var config = require('../config.private')
,	Web = require('../services/Web.js')
,	Channel = require('../services/Channel.js')
;

var web = new Web()
,	channel = new Channel()
;

web.start();
channel.start();