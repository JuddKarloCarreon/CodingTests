$(document).ready(function () {
    $('form').on('submit', function () {
        inputs = {
            username: $('#username').val(),
            password: $('#password').val()
        };
        errors = {
            username: [],
            password: []
        };
        has_errors = false;
        if ($(this).attr('id') == 'signup') {
            inputs.password_confirmation = $('#password_confirmation').val();
            errors.password_confirmation = [];
            if (inputs.password != inputs.password_confirmation) {
                errors.password_confirmation.push('Does not match.');
            }
        }
        for (key in inputs) {
            if (inputs[key].length == 0) {
                errors[key].push('Cannot be empty.');
            }
        }
        for (key in errors) {
            if (errors[key].length > 0) {
                $(`label[for="${key}"]`).children().remove();
                $(`label[for="${key}"]`).append(`<span class="errors">${errors[key].join(' ')}</span>`);
                has_errors = true;
            }
        }
        if (has_errors === false) {
            window.location.href = "lobby.html";
        }
        return false;
    });
});