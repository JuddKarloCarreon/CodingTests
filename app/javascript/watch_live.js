$(document).ready(function (){
    const socket = io(); //1
    
    socket.on('connect', function () {
        socket.emit('join_room', {room_name});
        socket.emit('get_live');
    });

    socket.on('receive_record', function (data) {
        let check = (record.length == 0) ? true : false;
        record = JSON.parse(data.record);
        if (check) {
            start_live();
        }
    });

    receive_live(socket, room_name);

    socket.on('disconnect', function () {
        alert('Host has disconnected.');
        window.location.href = $('header h2 a').attr('href');
    });
});