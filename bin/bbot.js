var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var compress = require('compression');
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server, { cookie: false });
var cio = new require('socket.io-client');
var Bot = require('./Bot2.js');

var Collector = require('../services/Classes/monitor.network.js');
var collector = new Collector();

var timer;

app.set('port', 8888);
app.use(compress());
app.use(bodyParser.urlencoded({ 'extended': false }))
app.use(bodyParser.json())
app.use(cookieParser());

server.listen(app.get('port'), function () {
    var os = require('os');
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        var alias = 0;
        ifaces[dev].forEach(function (details) {
            if (details.family == 'IPv4') {
                console.log(dev + (alias ? ':' + alias : ''), details.address);
                ++alias;
            };
        });
    };
    console.log("BOT伺服器啟動完成，啟動 PORT 於： " + app.get('port') + "；作業系統：" + os.platform());
});

app.get('/', function (req, res) {
    res.send('BOT伺服器 運作中')
});

app.get('/:count', function (req, res) {
    var count = req.params.count;
    var i = 0;
    function test() {
        if (i < count) {
            var bot = new Bot();
            bot.start();
            timer = setTimeout(test, 100);
            i++;
        } else {
            delete timer;
        };
    };

    timer = setTimeout(test, 100);

    res.end('BOT伺服器 共發起： ' + count + ' 個自動 BOT。');
});

io.on('connection', function (socket) {
    var address = socket.handshake.address;
    console.log("新連線來自於 => " + address);

    setInterval(function () {
        io.emit('data', collector.getCurrent());
    }, 1000);
});