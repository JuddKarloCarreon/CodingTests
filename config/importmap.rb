# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "socket.io" # @4.7.5
pin "#build/cjs/decodePacket.js", to: "#build--cjs--decodePacket.js.js" # @2.0.1
pin "socket.io-client", to: "https://cdn.socket.io/4.7.5/socket.io.esm.min.js" # @4.7.5
pin "#build/esm/decodePacket.js", to: "#build--esm--decodePacket.js.js" # @2.0.1
pin "#build/esm/encodePacket.js", to: "#build--esm--encodePacket.js.js" # @2.0.1
pin "#build/esm/globalThis.js", to: "#build--esm--globalThis.js.js" # @2.0.1
pin "#build/esm/transports/websocket-constructor.js", to: "#build--esm--transports--websocket-constructor.js.js" # @2.0.1
pin "#build/esm/transports/xmlhttprequest.js", to: "#build--esm--transports--xmlhttprequest.js.js" # @2.0.1
