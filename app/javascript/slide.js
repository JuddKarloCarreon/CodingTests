$(document).ready(function () {
    $('*:has(> .arrow)').on('click', function (event, duration = 400) {
        $(this).siblings().slideToggle(duration, () => {
            elem = $(this).children('.arrow');
            types = ['up', 'down'];
            for (let i = 0; i < types.length; i++) {
                if (elem.hasClass(types[i])) {
                    elem.removeClass(types[i]);
                    elem.addClass(types[1 - i]);
                    break;
                }
            };
        });
    });
    
    $('*:has(> .arrow):has(~ pre)').each(function () {
        $(this).trigger('click', 0);
    });
});