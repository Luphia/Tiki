function start() {
    $.ajax({
        type: "GET",
        url: './openbot',
        data: { ip: $('#inputip').val(), count: $('#inputcount').val(), sleep: $('#inputsleep').val() },
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        cache: false,
        async: false
    })
    .done(function (data) {
        if (data.status = 'OK') {
            $('#info').text(data.info);
        };
    })
    .fail(function (data) {
        $('#info').text('啟動失敗');
    });
};

$('#start').click(function () {
    start();
});