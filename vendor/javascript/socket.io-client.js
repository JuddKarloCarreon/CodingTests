import{parse as t,installTimerFunctions as e,Socket as s,nextTick as i}from"engine.io-client";import*as n from"socket.io-parser";import{PacketType as o}from"socket.io-parser";export{protocol}from"socket.io-parser";import{Emitter as r}from"@socket.io/component-emitter";
/**
 * URL parser.
 *
 * @param uri - url
 * @param path - the request path of the connection
 * @param loc - An object meant to mimic window.location.
 *        Defaults to window.location.
 * @public
 */function url(e,s="",i){let n=e;i=i||typeof location!=="undefined"&&location;null==e&&(e=i.protocol+"//"+i.host);if(typeof e==="string"){"/"===e.charAt(0)&&(e="/"===e.charAt(1)?i.protocol+e:i.host+e);/^(https?|wss?):\/\//.test(e)||(e="undefined"!==typeof i?i.protocol+"//"+e:"https://"+e);n=t(e)}n.port||(/^(http|ws)$/.test(n.protocol)?n.port="80":/^(http|ws)s$/.test(n.protocol)&&(n.port="443"));n.path=n.path||"/";const o=n.host.indexOf(":")!==-1;const r=o?"["+n.host+"]":n.host;n.id=n.protocol+"://"+r+":"+n.port+s;n.href=n.protocol+"://"+r+(i&&i.port===n.port?"":":"+n.port);return n}function on(t,e,s){t.on(e,s);return function subDestroy(){t.off(e,s)}}const c=Object.freeze({connect:1,connect_error:1,disconnect:1,disconnecting:1,newListener:1,removeListener:1});class Socket extends r{constructor(t,e,s){super();this.connected=false;this.recovered=false;this.receiveBuffer=[];this.sendBuffer=[];this._queue=[];this._queueSeq=0;this.ids=0;this.acks={};this.flags={};this.io=t;this.nsp=e;s&&s.auth&&(this.auth=s.auth);this._opts=Object.assign({},s);this.io._autoConnect&&this.open()}get disconnected(){return!this.connected}subEvents(){if(this.subs)return;const t=this.io;this.subs=[on(t,"open",this.onopen.bind(this)),on(t,"packet",this.onpacket.bind(this)),on(t,"error",this.onerror.bind(this)),on(t,"close",this.onclose.bind(this))]}get active(){return!!this.subs}connect(){if(this.connected)return this;this.subEvents();this.io._reconnecting||this.io.open();"open"===this.io._readyState&&this.onopen();return this}open(){return this.connect()}send(...t){t.unshift("message");this.emit.apply(this,t);return this}emit(t,...e){if(c.hasOwnProperty(t))throw new Error('"'+t.toString()+'" is a reserved event name');e.unshift(t);if(this._opts.retries&&!this.flags.fromQueue&&!this.flags.volatile){this._addToQueue(e);return this}const s={type:o.EVENT,data:e};s.options={};s.options.compress=this.flags.compress!==false;if("function"===typeof e[e.length-1]){const t=this.ids++;const i=e.pop();this._registerAckCallback(t,i);s.id=t}const i=this.io.engine&&this.io.engine.transport&&this.io.engine.transport.writable;const n=this.flags.volatile&&(!i||!this.connected);if(n);else if(this.connected){this.notifyOutgoingListeners(s);this.packet(s)}else this.sendBuffer.push(s);this.flags={};return this}_registerAckCallback(t,e){var s;const i=(s=this.flags.timeout)!==null&&s!==void 0?s:this._opts.ackTimeout;if(i===void 0){this.acks[t]=e;return}const n=this.io.setTimeoutFn((()=>{delete this.acks[t];for(let e=0;e<this.sendBuffer.length;e++)this.sendBuffer[e].id===t&&this.sendBuffer.splice(e,1);e.call(this,new Error("operation has timed out"))}),i);const fn=(...t)=>{this.io.clearTimeoutFn(n);e.apply(this,t)};fn.withError=true;this.acks[t]=fn}emitWithAck(t,...e){return new Promise(((s,i)=>{const fn=(t,e)=>t?i(t):s(e);fn.withError=true;e.push(fn);this.emit(t,...e)}))}
/**
     * Add the packet to the queue.
     * @param args
     * @private
     */_addToQueue(t){let e;typeof t[t.length-1]==="function"&&(e=t.pop());const s={id:this._queueSeq++,tryCount:0,pending:false,args:t,flags:Object.assign({fromQueue:true},this.flags)};t.push(((t,...i)=>{if(s!==this._queue[0])return;const n=t!==null;if(n){if(s.tryCount>this._opts.retries){this._queue.shift();e&&e(t)}}else{this._queue.shift();e&&e(null,...i)}s.pending=false;return this._drainQueue()}));this._queue.push(s);this._drainQueue()}
/**
     * Send the first packet of the queue, and wait for an acknowledgement from the server.
     * @param force - whether to resend a packet that has not been acknowledged yet
     *
     * @private
     */_drainQueue(t=false){if(!this.connected||this._queue.length===0)return;const e=this._queue[0];if(!e.pending||t){e.pending=true;e.tryCount++;this.flags=e.flags;this.emit.apply(this,e.args)}}
/**
     * Sends a packet.
     *
     * @param packet
     * @private
     */packet(t){t.nsp=this.nsp;this.io._packet(t)}onopen(){typeof this.auth=="function"?this.auth((t=>{this._sendConnectPacket(t)})):this._sendConnectPacket(this.auth)}
/**
     * Sends a CONNECT packet to initiate the Socket.IO session.
     *
     * @param data
     * @private
     */_sendConnectPacket(t){this.packet({type:o.CONNECT,data:this._pid?Object.assign({pid:this._pid,offset:this._lastOffset},t):t})}
/**
     * Called upon engine or manager `error`.
     *
     * @param err
     * @private
     */onerror(t){this.connected||this.emitReserved("connect_error",t)}
/**
     * Called upon engine `close`.
     *
     * @param reason
     * @param description
     * @private
     */onclose(t,e){this.connected=false;delete this.id;this.emitReserved("disconnect",t,e);this._clearAcks()}_clearAcks(){Object.keys(this.acks).forEach((t=>{const e=this.sendBuffer.some((e=>String(e.id)===t));if(!e){const e=this.acks[t];delete this.acks[t];e.withError&&e.call(this,new Error("socket has been disconnected"))}}))}
/**
     * Called with socket packet.
     *
     * @param packet
     * @private
     */onpacket(t){const e=t.nsp===this.nsp;if(e)switch(t.type){case o.CONNECT:t.data&&t.data.sid?this.onconnect(t.data.sid,t.data.pid):this.emitReserved("connect_error",new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));break;case o.EVENT:case o.BINARY_EVENT:this.onevent(t);break;case o.ACK:case o.BINARY_ACK:this.onack(t);break;case o.DISCONNECT:this.ondisconnect();break;case o.CONNECT_ERROR:this.destroy();const e=new Error(t.data.message);e.data=t.data.data;this.emitReserved("connect_error",e);break}}
/**
     * Called upon a server event.
     *
     * @param packet
     * @private
     */onevent(t){const e=t.data||[];null!=t.id&&e.push(this.ack(t.id));this.connected?this.emitEvent(e):this.receiveBuffer.push(Object.freeze(e))}emitEvent(t){if(this._anyListeners&&this._anyListeners.length){const e=this._anyListeners.slice();for(const s of e)s.apply(this,t)}super.emit.apply(this,t);this._pid&&t.length&&typeof t[t.length-1]==="string"&&(this._lastOffset=t[t.length-1])}ack(t){const e=this;let s=false;return function(...i){if(!s){s=true;e.packet({type:o.ACK,id:t,data:i})}}}
/**
     * Called upon a server acknowledgement.
     *
     * @param packet
     * @private
     */onack(t){const e=this.acks[t.id];if(typeof e==="function"){delete this.acks[t.id];e.withError&&t.data.unshift(null);e.apply(this,t.data)}}onconnect(t,e){this.id=t;this.recovered=e&&this._pid===e;this._pid=e;this.connected=true;this.emitBuffered();this.emitReserved("connect");this._drainQueue(true)}emitBuffered(){this.receiveBuffer.forEach((t=>this.emitEvent(t)));this.receiveBuffer=[];this.sendBuffer.forEach((t=>{this.notifyOutgoingListeners(t);this.packet(t)}));this.sendBuffer=[]}ondisconnect(){this.destroy();this.onclose("io server disconnect")}destroy(){if(this.subs){this.subs.forEach((t=>t()));this.subs=void 0}this.io._destroy(this)}disconnect(){this.connected&&this.packet({type:o.DISCONNECT});this.destroy();this.connected&&this.onclose("io client disconnect");return this}close(){return this.disconnect()}
/**
     * Sets the compress flag.
     *
     * @example
     * socket.compress(false).emit("hello");
     *
     * @param compress - if `true`, compresses the sending data
     * @return self
     */compress(t){this.flags.compress=t;return this}
/**
     * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
     * ready to send messages.
     *
     * @example
     * socket.volatile.emit("hello"); // the server may or may not receive it
     *
     * @returns self
     */get volatile(){this.flags.volatile=true;return this}
/**
     * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
     * given number of milliseconds have elapsed without an acknowledgement from the server:
     *
     * @example
     * socket.timeout(5000).emit("my-event", (err) => {
     *   if (err) {
     *     // the server did not acknowledge the event in the given delay
     *   }
     * });
     *
     * @returns self
     */timeout(t){this.flags.timeout=t;return this}
/**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * @example
     * socket.onAny((event, ...args) => {
     *   console.log(`got ${event}`);
     * });
     *
     * @param listener
     */onAny(t){this._anyListeners=this._anyListeners||[];this._anyListeners.push(t);return this}
/**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * @example
     * socket.prependAny((event, ...args) => {
     *   console.log(`got event ${event}`);
     * });
     *
     * @param listener
     */prependAny(t){this._anyListeners=this._anyListeners||[];this._anyListeners.unshift(t);return this}
/**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @example
     * const catchAllListener = (event, ...args) => {
     *   console.log(`got event ${event}`);
     * }
     *
     * socket.onAny(catchAllListener);
     *
     * // remove a specific listener
     * socket.offAny(catchAllListener);
     *
     * // or remove all listeners
     * socket.offAny();
     *
     * @param listener
     */offAny(t){if(!this._anyListeners)return this;if(t){const e=this._anyListeners;for(let s=0;s<e.length;s++)if(t===e[s]){e.splice(s,1);return this}}else this._anyListeners=[];return this}listenersAny(){return this._anyListeners||[]}
/**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * Note: acknowledgements sent to the server are not included.
     *
     * @example
     * socket.onAnyOutgoing((event, ...args) => {
     *   console.log(`sent event ${event}`);
     * });
     *
     * @param listener
     */onAnyOutgoing(t){this._anyOutgoingListeners=this._anyOutgoingListeners||[];this._anyOutgoingListeners.push(t);return this}
/**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * Note: acknowledgements sent to the server are not included.
     *
     * @example
     * socket.prependAnyOutgoing((event, ...args) => {
     *   console.log(`sent event ${event}`);
     * });
     *
     * @param listener
     */prependAnyOutgoing(t){this._anyOutgoingListeners=this._anyOutgoingListeners||[];this._anyOutgoingListeners.unshift(t);return this}
/**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @example
     * const catchAllListener = (event, ...args) => {
     *   console.log(`sent event ${event}`);
     * }
     *
     * socket.onAnyOutgoing(catchAllListener);
     *
     * // remove a specific listener
     * socket.offAnyOutgoing(catchAllListener);
     *
     * // or remove all listeners
     * socket.offAnyOutgoing();
     *
     * @param [listener] - the catch-all listener (optional)
     */offAnyOutgoing(t){if(!this._anyOutgoingListeners)return this;if(t){const e=this._anyOutgoingListeners;for(let s=0;s<e.length;s++)if(t===e[s]){e.splice(s,1);return this}}else this._anyOutgoingListeners=[];return this}listenersAnyOutgoing(){return this._anyOutgoingListeners||[]}
/**
     * Notify the listeners for each packet sent
     *
     * @param packet
     *
     * @private
     */notifyOutgoingListeners(t){if(this._anyOutgoingListeners&&this._anyOutgoingListeners.length){const e=this._anyOutgoingListeners.slice();for(const s of e)s.apply(this,t.data)}}}
/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */function Backoff(t){t=t||{};this.ms=t.min||100;this.max=t.max||1e4;this.factor=t.factor||2;this.jitter=t.jitter>0&&t.jitter<=1?t.jitter:0;this.attempts=0}Backoff.prototype.duration=function(){var t=this.ms*Math.pow(this.factor,this.attempts++);if(this.jitter){var e=Math.random();var s=Math.floor(e*this.jitter*t);t=(Math.floor(e*10)&1)==0?t-s:t+s}return Math.min(t,this.max)|0};Backoff.prototype.reset=function(){this.attempts=0};Backoff.prototype.setMin=function(t){this.ms=t};Backoff.prototype.setMax=function(t){this.max=t};Backoff.prototype.setJitter=function(t){this.jitter=t};class Manager extends r{constructor(t,s){var i;super();this.nsps={};this.subs=[];if(t&&"object"===typeof t){s=t;t=void 0}s=s||{};s.path=s.path||"/socket.io";this.opts=s;e(this,s);this.reconnection(s.reconnection!==false);this.reconnectionAttempts(s.reconnectionAttempts||Infinity);this.reconnectionDelay(s.reconnectionDelay||1e3);this.reconnectionDelayMax(s.reconnectionDelayMax||5e3);this.randomizationFactor((i=s.randomizationFactor)!==null&&i!==void 0?i:.5);this.backoff=new Backoff({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()});this.timeout(null==s.timeout?2e4:s.timeout);this._readyState="closed";this.uri=t;const o=s.parser||n;this.encoder=new o.Encoder;this.decoder=new o.Decoder;this._autoConnect=s.autoConnect!==false;this._autoConnect&&this.open()}reconnection(t){if(!arguments.length)return this._reconnection;this._reconnection=!!t;return this}reconnectionAttempts(t){if(t===void 0)return this._reconnectionAttempts;this._reconnectionAttempts=t;return this}reconnectionDelay(t){var e;if(t===void 0)return this._reconnectionDelay;this._reconnectionDelay=t;(e=this.backoff)===null||e===void 0?void 0:e.setMin(t);return this}randomizationFactor(t){var e;if(t===void 0)return this._randomizationFactor;this._randomizationFactor=t;(e=this.backoff)===null||e===void 0?void 0:e.setJitter(t);return this}reconnectionDelayMax(t){var e;if(t===void 0)return this._reconnectionDelayMax;this._reconnectionDelayMax=t;(e=this.backoff)===null||e===void 0?void 0:e.setMax(t);return this}timeout(t){if(!arguments.length)return this._timeout;this._timeout=t;return this}maybeReconnectOnOpen(){!this._reconnecting&&this._reconnection&&this.backoff.attempts===0&&this.reconnect()}
/**
     * Sets the current transport `socket`.
     *
     * @param {Function} fn - optional, callback
     * @return self
     * @public
     */open(t){if(~this._readyState.indexOf("open"))return this;this.engine=new s(this.uri,this.opts);const e=this.engine;const i=this;this._readyState="opening";this.skipReconnect=false;const n=on(e,"open",(function(){i.onopen();t&&t()}));const onError=e=>{this.cleanup();this._readyState="closed";this.emitReserved("error",e);t?t(e):this.maybeReconnectOnOpen()};const o=on(e,"error",onError);if(false!==this._timeout){const t=this._timeout;const s=this.setTimeoutFn((()=>{n();onError(new Error("timeout"));e.close()}),t);this.opts.autoUnref&&s.unref();this.subs.push((()=>{this.clearTimeoutFn(s)}))}this.subs.push(n);this.subs.push(o);return this}connect(t){return this.open(t)}onopen(){this.cleanup();this._readyState="open";this.emitReserved("open");const t=this.engine;this.subs.push(on(t,"ping",this.onping.bind(this)),on(t,"data",this.ondata.bind(this)),on(t,"error",this.onerror.bind(this)),on(t,"close",this.onclose.bind(this)),on(this.decoder,"decoded",this.ondecoded.bind(this)))}onping(){this.emitReserved("ping")}ondata(t){try{this.decoder.add(t)}catch(t){this.onclose("parse error",t)}}ondecoded(t){i((()=>{this.emitReserved("packet",t)}),this.setTimeoutFn)}onerror(t){this.emitReserved("error",t)}socket(t,e){let s=this.nsps[t];if(s)this._autoConnect&&!s.active&&s.connect();else{s=new Socket(this,t,e);this.nsps[t]=s}return s}
/**
     * Called upon a socket close.
     *
     * @param socket
     * @private
     */_destroy(t){const e=Object.keys(this.nsps);for(const t of e){const e=this.nsps[t];if(e.active)return}this._close()}
/**
     * Writes a packet.
     *
     * @param packet
     * @private
     */_packet(t){const e=this.encoder.encode(t);for(let s=0;s<e.length;s++)this.engine.write(e[s],t.options)}cleanup(){this.subs.forEach((t=>t()));this.subs.length=0;this.decoder.destroy()}_close(){this.skipReconnect=true;this._reconnecting=false;this.onclose("forced close");this.engine&&this.engine.close()}disconnect(){return this._close()}onclose(t,e){this.cleanup();this.backoff.reset();this._readyState="closed";this.emitReserved("close",t,e);this._reconnection&&!this.skipReconnect&&this.reconnect()}reconnect(){if(this._reconnecting||this.skipReconnect)return this;const t=this;if(this.backoff.attempts>=this._reconnectionAttempts){this.backoff.reset();this.emitReserved("reconnect_failed");this._reconnecting=false}else{const e=this.backoff.duration();this._reconnecting=true;const s=this.setTimeoutFn((()=>{if(!t.skipReconnect){this.emitReserved("reconnect_attempt",t.backoff.attempts);t.skipReconnect||t.open((e=>{if(e){t._reconnecting=false;t.reconnect();this.emitReserved("reconnect_error",e)}else t.onreconnect()}))}}),e);this.opts.autoUnref&&s.unref();this.subs.push((()=>{this.clearTimeoutFn(s)}))}}onreconnect(){const t=this.backoff.attempts;this._reconnecting=false;this.backoff.reset();this.emitReserved("reconnect",t)}}const h={};function lookup(t,e){if(typeof t==="object"){e=t;t=void 0}e=e||{};const s=url(t,e.path||"/socket.io");const i=s.source;const n=s.id;const o=s.path;const r=h[n]&&o in h[n].nsps;const c=e.forceNew||e["force new connection"]||false===e.multiplex||r;let a;if(c)a=new Manager(i,e);else{h[n]||(h[n]=new Manager(i,e));a=h[n]}s.query&&!e.query&&(e.query=s.queryKey);return a.socket(s.path,e)}Object.assign(lookup,{Manager:Manager,Socket:Socket,io:lookup,connect:lookup});export{Manager,Socket,lookup as connect,lookup as default,lookup as io};

