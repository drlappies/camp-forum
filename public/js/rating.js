$('#like').on('change', function () {
    $.ajax({
        type: "POST",
        url: `/campgrounds/${campgroundId}`,
        data: { "status": "like" }
    })
})
$('#dislike').on('change', function () {
    $.ajax({
        type: "POST",
        url: `/campgrounds/${campgroundId}`,
        data: { "status": "dislike" }
    })
})