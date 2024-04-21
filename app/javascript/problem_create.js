$(document).ready(function () {    
    $('button:contains("Add")').on('click', function (event) {
        event.preventDefault();
        count = $('form > fieldset > fieldset').length
        to_add = `<fieldset>\n` +
            `\t<legend>Test ${count + 1}:</legend>\n` +
            `\t<button class="remove">X</button>\n` +
            `\t<div>\n` +
            `\t\t<label style="display: block" for="test_args_${count + 1}">Args</label>` +
            `\t\t<input type="text" name="test[args][]" id="test_args_${count + 1}" />` +
            `\t</div>\n` +
            `\t<div>\n` +
            `\t\t<label style="display: block" for="test_result_${count + 1}">Result</label>` +
            `\t\t<input type="text" name="test[result][]" id="test_result_${count + 1}" />` +
            `\t</div>\n` +
            `</fieldset>`;
        $(to_add).insertBefore($(this));
    });

    $(document).on('click', 'button.remove', function (event) {
        event.preventDefault();
        parent = $(this).parent()
        parent.nextAll('fieldset').each(function () {
            legend = $(this).find('legend');
            curr_count = legend.text().replace('Test ', '').replace(':', '');
            legend.text(legend.text().replace(curr_count, (parseInt(curr_count) - 1).toString()));
            $(this).find('label, input').each(function () {
                attr = ($(this).attr('for') !== undefined) ? 'for' : 'id';
                new_val = $(this).attr(attr).replace(curr_count, (parseInt(curr_count) - 1).toString());
                $(this).attr('for', new_val);
            });
        });
        
        parent.remove();
    });
    
    if (typeof tests !== 'undefined') {
        for (let i = 1; i < tests.length; i++) {
            $('button:contains("Add")').trigger('click');
            $(`#test_args_${i + 1}`).val(JSON.parse(tests[i]["args"]).toString());
            $(`#test_result_${i + 1}`).val(JSON.parse(tests[i]["result"]).toString());
        }
    }
});