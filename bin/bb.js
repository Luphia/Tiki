var request = require('request');
var io = new require('socket.io-client');
var Bot = require('./Bot2.js');
var client = {};

//process.nextTick(function () {
//    client[i] = io.connect('ws://localhost/', {
//        'force new connection': true
//    });
//});

//for (var i = 0; i < 1000; i++) {
//    var bot = new Bot();
//    bot.start();

//};

var i = 0;
var timer;
var Bot = require('./Bot.js');

function test() {
    if (i < 10000) {
        var bot = new Bot();
        bot.start();
        timer = setTimeout(test, 300);
    };
};

timer = setTimeout(test, 300);
