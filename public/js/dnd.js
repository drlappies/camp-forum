$(document).ready(function () {
    $('#set').sortable({
        disabled: true
    });

    $('#get').on('click', '.dropable', function (event) {
        const tag = document.getElementById(event.target.id);
        $('#set').append(tag)
        $(`#${event.target.id}`).removeClass('dropable');
        $(`#${event.target.id}`).addClass('removable');
    })

    $('#set').on('click', '.removable', function (event) {
        const removeTag = document.getElementById(event.target.id);
        $("#get").append(removeTag);
        $(`#${event.target.id}`).addClass('dropable');
        $(`#${event.target.id}`).removeClass('removable');
    })
})

$('form').on('submit', function () {
    $('#tags').val($('#set').sortable('toArray'))
})