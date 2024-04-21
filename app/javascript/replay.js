$(document).ready(function () {
    console.log(record);
    let cursor = '<span><span id="cursor">|</span></span>';
    let cursor_ind = 0;
    let code = '';

    let loop;
    let curr_ind = 0;
    let time_gap = {
        1: 80,
        2: Math.trunc(80 / 2),
        4: Math.trunc(80 / 4)
    };
    let speed = 1;
    let seek_playing = false;
    let seeking = false;
    let live_loop;
    let results = {};

    /* This handles the pause and play of the recording */
    $('#play_pause, #screen, #tests, #results').on('click', function () {
        let symbols = {play: '▷', pause: '❚❚'}
        let new_state = ($('#play_pause').text() == '▷') ? 'pause' : 'play';
        $('#play_pause').html(symbols[new_state]);

        if (new_state === 'pause') {
            if ($('#slidebar').val() === $('#slidebar').attr('max') && live === false) {
                reset_recording();
                $('#slidebar').val(0);
            }

            loop = setInterval(process_screen, time_gap[speed]);
        } else {
            clearInterval(loop);
        }
    });

    /* The mousedown, mouseup, and input event listeners handles the event where the user is seeking specific
        times in the recording via the slidebar. */
    $('#slidebar').on('mousedown', function () {
        seeking = true;
        if ($('#play_pause').text() == '❚❚') {
            $('#play_pause').trigger('click');
            seek_playing = true;
        }
    });
    $(document).on('mouseup', function() {
        if (seeking = true) {
            reset_recording();
            set_time();
            if ($('#play_pause').text() == '▷' && seek_playing === true) {
                $('#play_pause').trigger('click');
                seek_playing = false;
            } else if ($('#slidebar').val() == 0) {
                set_screen();
            }
        }
        seeking = false;
    });
    $('#slidebar').on('input', function () {
        reset_recording();
        process_screen(false);
    });

    /* Handles the changing of speeds of the recording */
    $('#speed > span').on('click', function () {
        speed = parseInt($(this).text());
        $(this).siblings().removeClass('selected_speed');
        $(this).addClass('selected_speed');
        if ($('#play_pause').text() == '❚❚') {
            $('#play_pause').trigger('click');
            $('#play_pause').trigger('click');
        }
    });

    /* Handles the processing required to build the code via the recording */
    function process_screen(loop = true) {
        let slidebar = parseInt($('#slidebar').val());
        let curr_time = record[curr_ind][0];
        let interval = time_gap[1] * speed;
        let live_status = (typeof live === "undefined") ? false : live;

        while (slidebar >= curr_time && !['BUFFER', 'END'].includes(record[curr_ind][1])) {
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
                set_screen();
            } else if (typeof record[curr_ind][1] === 'string' && !['START', 'BUFFER', 'SUBMIT', 'END'].includes(record[curr_ind][1])){
                if (results[curr_ind] === undefined) {
                    results[curr_ind] = JSON.parse(record[curr_ind][1]);
                }
            }

            if (record[curr_ind][1] === 'SUBMIT') {
                $('#submitting').removeClass('hidden');
            } else {
                $('#submitting').addClass('hidden');
            }

            if (Object.keys(results).length > 0) {
                for (const [key, value] of Object.entries(results)) {
                    if (curr_ind >= key) {
                        process_results(value);
                    } else {
                        clear_results();
                    }
                }
            }
            
            if (record.length > (curr_ind + 1)) {
                curr_ind = curr_ind + 1;
                curr_time = record[curr_ind][0];
            }
        }

        if (live_loop === undefined && live_status === true) {
            live_loop = setInterval(function () {
                if (record[record.length - 1][1] == 'BUFFER') {
                    record[record.length - 1][0] += interval;
                    set_max_time();
                } else {
                    clearInterval(live_loop);
                }

            }, interval);
        }
        // console.log(slidebar, curr_time - interval);
        if ((record[curr_ind][1] == 'END' && slidebar >= curr_time - interval + 1) && loop === true && live_status !== true) {
            $('#play_pause').trigger('click');
        }
        
        set_time(slidebar + interval, undefined, !seeking);
    }
    /* This displays the built code from the recording, onto the screen */
    function set_screen() {
        console.log(code);
        let out = code.split('');
        out.splice(cursor_ind, 0, cursor);
        console.log(out);
        console.log(out.join(''));
        $('#screen pre').html(out.join(''));
    }
    /* This resets the primary indicator parameters that handles viewing of the recording */
    function reset_recording() {
        code = '';
        curr_ind = 0;
    }

    function process_results(result) {
        clear_results();
        if (result.hasOwnProperty("errors")) {
            $(`<p class="errors">${result.errors}</p>`).insertAfter($('#results').find('h2'));
        } else {
            $(`<p class="notice">${result.results[1]}</p>`).insertAfter($('#results').find('h2'));
            for (let i = 0; i < result.results[0].length; i++) {
                let to_insert;
                if (typeof result.results[0][i] == 'string') {
                    to_insert = `<span class="errors">${result.results[0][i].toString()}</span>`;
                } else {
                    to_insert = `<span class="${result.results[0][i][1].toString()}">${result.results[0][i][0].toString()}</span>`;
                }
                $(to_insert).insertAfter($('#results').find(`span[alt_id="num"]:contains(${i + 1})`));
            }
        }
    }
    function clear_results() {
        $('#results').find('.notice, .errors, .success').remove();
    }
    
    
    set_max_time();
});
/* Handles the changing of time to show in the recording */
function set_time(new_val, max = false, set_slidebar = false) {
    let elem = '#curr_time';
    let total_ms;
    if (max === false) {
        if (new_val !== undefined && set_slidebar) {
            $('#slidebar').val(new_val);
        }
        total_ms = parseInt($('#slidebar').val());
    } else {
        elem = '#max_time'
        total_ms = record[record.length - 1][0];
    }
    
    let total_secs = Math.trunc(total_ms / 1000);
    let mins = Math.trunc(total_secs / 60);
    let secs = Math.trunc(total_secs - (mins * 60)).toString();
    mins = mins.toString();
    [mins, secs] = [mins, secs].map((val) => (val.length < 2) ? '0' + val : val);

    $(elem).html(`${mins}:${secs}`);
}
/* Handles the changing of maximum time of the recording */
function set_max_time() {
    if (record.length > 0) {
        $('#slidebar').attr('max', record[record.length - 1][0]);
        set_time(undefined, true);
    }
}
/* This handles the live viewing of  code */
function start_live() {
    if (record[record.length - 1][1] == 'BUFFER') {
        set_max_time();
        live = true;
        $('#slidebar').trigger('mousedown');
        $('#slidebar').val(record[record.length - 1][0]);
        $('#slidebar').trigger('input');
        $('#slidebar').trigger('mouseup');
        $('#play_pause').trigger('click');
    }
}