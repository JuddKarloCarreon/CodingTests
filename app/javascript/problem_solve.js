$(document).ready(function () {
    /* variables for recording */
    let data = {added: '', removed: '', a_ind: '', r_ind: ''},
        old_code = '', new_code = '',
        record_start = false, offset,
        record_loop, loop_time = 80;

    let final_submission = false;

    if (record.length > 0) {
        record = JSON.parse(record);
        old_code = process_old_code();
    }
    

    const socket = io();
    
    /* Handles form submission */
    $('form').on('submit', function () {
        if ($(this).find('textarea').val().length > 0) {
            if (final_submission === false) {
                add_record('SUBMIT');
            }
            $(this).append($(`<textarea id="record_textarea" name="recording">${JSON.stringify(record)}</textarea>`));
            let action = $(this).attr('action');
            let serialize = $(this).serialize();
            // serialize += "&recording=" + ;
            $('#record_textarea').remove();
            console.log(serialize);
            console.log($(this).find('textarea').val().length);
            $(this).children().prop('disabled', true);

            $.post(action, serialize, function (res) {
                if (final_submission === false) {
                    $('#results .errors, #results .success, #results .notice').remove();
                    if (res.hasOwnProperty("errors")) {
                        $(`<p class="errors">${res.errors}</p>`).insertAfter($('#results').find('h2'));
                    } else {
                        let message = `<p>Results:</p>\n`;
                        $(`<p class="notice">${res.results[1]}</p>`).insertAfter($('#results').find('h2'));
                        for (let i = 0; i < res.results[0].length; i++) {
                            let to_insert;
                            if (typeof res.results[0][i] == 'string') {
                                message += `<p style="margin-left: 20px;">${res.results[0][i].toString()}</p>\n`;
                                to_insert = `<span class="errors">${res.results[0][i].toString()}</span>`;
                            } else {
                                message += `<p style="margin-left: 20px;">${res.results[0][i][0].toString()}</p>\n`;
                                to_insert = `<span class="${res.results[0][i][1].toString()}">${res.results[0][i][0].toString()}</span>`;
                            }
                            $(to_insert).insertAfter($('#results').find(`span[alt_id="num"]:contains(${i + 1})`));
                        }
                        if ($('#results .success').length > 0) {
                            message += '<p>Stay to refine your code, or continue back to the lobby?</p>'
                            ConfirmDialog(message, res.results[1]);
                        }
                    }

                    add_record(JSON.stringify(res));
                }
            }, 'JSON').always(() => {
                $(this).children().prop('disabled', false);
                if (final_submission === true) {
                    window.location.href = $('header h2 a').attr('href');
                }
            });
        }

        return false;
    });

    $('textarea').on('keyup', function () {
        let y_padding = parseInt($(this).css('padding-top')) + parseInt($(this).css('padding-bottom'));
        if ($(this).prop("scrollHeight") - y_padding > $(this).height()) {
            $(this).height($(this).prop("scrollHeight"));
        }
    });

    /* This handles the recording of inputs */
    $('textarea').on('input', function () {
        data = {added: '', removed: '', a_ind: '', r_ind: ''};
        if (record_start === false) {
            record_start = new Date().getTime();
            if (record.length == 0) {
                offset = 0;
                record.push([0, 'START']);
                record.push([0, 'BUFFER']);
            } else {
                offset = record[record.length - 1][0];
                record[record.length - 1][1] = 'BUFFER';
            }
            record_loop = setInterval(function () {
                record[record.length - 1][0] += loop_time;
            }, loop_time);

            socket.emit('create_room', {room_name});
        } else {
            old_code = new_code;
        }

        new_code = $(this).val();
        let o_code = old_code.split('');
        let n_code = new_code.split('');
        let i = 0;
        /* This detects changes */
        while (o_code.length > 0 || n_code.length > 0) {
            /* Check if there one of the arrays is empty */
            if (o_code.length == 0) {
                data.added = n_code.join('');
                data.a_ind = i;
                break;
            } else if (n_code.length == 0) {
                data.removed = o_code.join('');
                data.r_ind = i;
                break;
            /* Remove common code */
            } else if (n_code[0] === o_code[0]) {
                [n_code, o_code] = [n_code, o_code].map(val => val.slice(1));
            /* Detect if 1 character is added */
            } else if (n_code.length > 1 && o_code.join('') === n_code.slice(1).join('')) {
                data.added += n_code.shift();
                data.a_ind = i;
            /* This handles 1 character removed, as well as the default operation for when multiple
                characters are added/removed */
            } else {
                data.removed += o_code.shift();
                data.r_ind = i;
                continue;
            }
            i += 1;
        }
        /* This adds the changes to the record. Note that it is important that 'removed' comes before 'added' */
        ['removed', 'added'].forEach(function (key) {
            if (data[key].length > 0) {
                if (key == 'added') {
                    add_record([data.a_ind, data[key]]);
                } else if (key == 'removed') {
                    add_record([data.r_ind, data[key], 0]);
                }
                if (record[record.length - 1][0] < record[record.length - 2][0]) {
                    record[record.length - 1][0] = record[record.length - 2][0]
                }
            }
        });
    });

    $('#reset_button').on('click', function () {
        if (record_loop !== undefined) {
            clearInterval(record_loop);
        }
        record_start = false;
        old_code = '';
        new_code = '';
        record = [];
        $('textarea').val('');
    });

    /* Handle socket connections */
    socket.on('request_record', function () {
        socket.emit('send_record', {record: JSON.stringify(record)});
    });

    /* Confirmation dialogue from jquery ui */
    function ConfirmDialog(content, title) {
        $('<div></div>').appendTo('body')
            .html(content)
            .dialog({
                modal: true,
                title: title,
                zIndex: 10,
                autoOpen: true,
                width: 'auto',
                resizable: false,
                buttons: {
                    'Continue': function() {
                        $(this).dialog("close");
                        clearInterval(record_loop);
                        record[record.length - 1][1] = 'END';
                        final_submission = true;
                        $('form').trigger('submit');
                    },
                    'Stay': function() {
                        $(this).dialog("close");
                    }
                },
                close: function(event, ui) {
                    $(this).remove();
                }
            });
    };
    function add_record(content) {
        let time = new Date().getTime() - record_start + offset;
        record.splice(record.length - 1, 0, [time, content]);
        socket.emit('send_record', {record: JSON.stringify(record)});
    }
    function process_old_code() {
        let curr_ind = 0;
        let curr_time = record[curr_ind][0];
        let code = '';
        while (record[record.length - 1][0] >= curr_time && !['BUFFER', 'END'].includes(record[curr_ind][1])) {
            if (Array.isArray(record[curr_ind][1])) {
                if (record[curr_ind][1].length < 3) {
                    code = code.split('');
                    code.splice(record[curr_ind][1][0], 0, record[curr_ind][1][1]);
                    code = code.join('');
                    cursor_ind = record[curr_ind][1][0] + record[curr_ind][1][1].length;
                } else {
                    code = code.substring(0, record[curr_ind][1][0]) + code.substring(record[curr_ind][1][0]).replace(record[curr_ind][1][1], '');
                    cursor_ind = record[curr_ind][1][0];
                }
            }
            
            if (record.length > (curr_ind + 1)) {
                curr_ind = curr_ind + 1;
                curr_time = record[curr_ind][0];
            }
        }
        return code;
    }
});