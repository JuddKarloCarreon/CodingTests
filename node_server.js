
const express                   = require('express');
const app                       = express();
const server                    = app.listen(8000);
const { createProxyMiddleware } = require('http-proxy-middleware');
const io                        = require('socket.io')(server);

const hosts                     = {};

app.use('/', createProxyMiddleware({
      target: 'http://localhost:3000',
      changeOrigin: true,
    }),
);

io.on('connection', function (socket) { //2
    socket.on('create_room', function (data) {
        hosts[socket.id] = data.room_name;
        socket.join(data.room_name);
        send_rooms(socket);
    });
    socket.on('send_record', async function (data) {
        socket.to(hosts[socket.id]).emit('receive_record', data);
    });
    socket.on('join_room', function (data) {
        let key = Object.keys(hosts).find(key => hosts[key] === data.room_name);
        if (key !== undefined) {
            socket.join(data.room_name);
            socket.to(key).emit('request_record');
        } else {
            io.in(socket.id).disconnectSockets();
        }
    });
    socket.on('get_live', function () {
        send_rooms(socket);
    });
    socket.on('disconnect', function () {
        if (hosts[socket.id] !== undefined) {
            io.in(hosts[socket.id]).disconnectSockets(true);
            delete hosts[socket.id];
            send_rooms(socket);
        }
    });
});

function send_rooms(socket) {
    let rooms = JSON.stringify(Object.values(hosts));
    socket.emit('receive_live', {rooms});
}