/*

	Bot want to buy 1 ~ 4 tickets
	Bot need to condsider 5 ~ 20 second before acting
	Bot would quit if all tickets was sold out
 */

var io = require('socket.io-client');
var ID = 0;

var zeroFill = function(d, length) {
	var l = parseInt(length);
	if(!l > 0) { l = 8; }

	var s = d.toString();
	while(s.length < l) {
		s = "0" + s;
	}
	return s;
};
var random = function(a, b) {
	if(a > b) { return random(b, a); }

	var range = b - a;
	return Math.random() * range + a;
};

var Bot = function(config) { this.init(config); };

Bot.prototype.init = function(config) {
	var self = this;

	this.ID = "BOT" + zeroFill(++ID, 8);
	this.connect = io('ws://10.10.23.55');
	this.connect.on('channel', function(d) {
		var ev = d.event
		,	data = d.data

		switch(ev) {
			case 'getTickets':
				self.getTickets(data);
				break;
			case 'sold':
				self.getSold(data);
				break;
			case 'buyType':
				self.getBuyType(data);
		}
	});

	this.want = parseInt(random(1, 4));
	this.goods = [];
	this.remainTickets = [];
	this.request('getTickets');
};

Bot.prototype.request = function(ev, data) {
	var msg = {
		"event": ev,
		"data": data
	};

	this.connect.emit('channel', msg);
};

Bot.prototype.getTickets = function(data) {
	this.remainTickets = data;
	this.countRemain();
};
Bot.prototype.countRemain = function() {
	this.remainType = {};
	for(var k in this.remainTickets) {
		var type = this.remainTickets[k].substr(0, 3);
		if(!this.remainType.hasOwnProperty(type)) { this.remainType[type] = 0; }
		this.remainType[type]++;
	}

	return this.remainType;
};
Bot.prototype.getSold = function(tickets) {
	for(var k in tickets) {
		var ticket = tickets[k];
		var type = ticket.substr(0, 3);
		this.remainTickets.splice( this.remainTickets.indexOf(ticket) , 1);
		this.remainType[type]--;
	}
};
Bot.prototype.getBuyType = function(data) {
	for(var k in data) {
		if(data[k]) {
			this.want--;
			this.goods.push(data[k]);
			console.log(this.ID + " get " + data[k][0]);
		}
	}
	this.done();
};
Bot.prototype.done = function() {
	this.todo--;
	if(this.todo <= 0) this.finish();
};
Bot.prototype.buyTicket = function(type, number) {

};
Bot.prototype.focus = function() {

};
Bot.prototype.consider = function(action, probability) {
	if(!parseFloat(probability)) { probability = 1; }

	var time = random(5000, 30000);
	if(Math.random() < probability) {
		setTimeout(action, time);
	}
};

Bot.prototype.shopping = function() {
	this.todo = 1;

	var targets = [];
	for(var k in this.remainType) {
		if(this.remainType[k] >= this.want) {
			targets.push(k);
		}
	}

	var target = targets[Math.floor(Math.random() * targets.length)];
	var data = {"type": target, "number": this.want};

	var self = this;
	if(target) {
		this.consider(function() { self.request('buyType', data); });
	}
	else {
		this.consider(function() { self.finish(); });
	}
};
Bot.prototype.finish = function() {
	if(this.want > 0) {
		this.shopping();
	}
	else {
		console.log('Goodbye, ' + this.ID);
	}
};
Bot.prototype.start = function() {
	this.shopping();
};

/*

var Bot = require('./bin/Bot.js');
var bot = new Bot();
bot.start();

 */

 module.exports = Bot;