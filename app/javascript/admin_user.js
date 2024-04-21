$(document).ready(function () {
    $('form').on('submit', function () {
        let type = ($(this).find('input[name="do"]').val() == 'add') ? ['Make', 'an'] : ['Remove', 'from'];
        if (!confirm(`${type[0]} ${$(this).parent().siblings('td').first().text()} ${type[1]} admin?`)) {
            return false;
        }
    });
});