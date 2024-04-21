$(document).ready(function () {
    const socket = io();

    socket.on('connect', function () {
        socket.emit('get_live');
    });

    receive_live(socket);
    
});