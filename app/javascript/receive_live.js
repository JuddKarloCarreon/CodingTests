function receive_live (socket, name = '') {
    socket.on('receive_live', function (data) {
        $.getJSON(`/pages/get_live_data/${data.rooms}`, function (res) {
            $('#live_list ul').html('');
            res.forEach(function (category, ind) {
                category.forEach(function (val) {
                    let room_name = val[1];
                    if (name != room_name) {
                        let problem_id, user_id;
                        [problem_id, user_id] = room_name.split('_');
                        $(`#live_list > li:nth-child(${ind + 1})> ul`).append(`<li class="${room_name}"><a href="/pages/${problem_id}/live/${user_id}">${val[0]}</a></li>`);
                    }
                });
            });
        });
    });
}