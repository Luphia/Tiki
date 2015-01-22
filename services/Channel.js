var Channel = function(config) {
	this.init(config);
};

var lastUpdate = 0;
var channelCtrl;

var ctrl = function(config) { this.init(); };
ctrl.prototype.init = function(config) {
	if(config) {
		this.setConfig(config);
	}

	this.times = 1;

	this.connection = {
		current: 0,
		history: 0,
		focus: {}
	};

	this.remainTickets = [];
	this.point = 0;
};
ctrl.prototype.getTickets = function() {
	return this.remainTickets;
};
ctrl.prototype.getAreaTickets = function() {
	var i = 0, rs = [];
	var pick = 10;
	if(pick > this.remainTickets.length) { return this.remainTickets; }

	var s = Math.floor( Math.random() * (this.remainTickets.length - 10) );

	return this.remainTickets.slice(s, s + 10);
};
ctrl.prototype.buyCode = function(code, client) {
	var rs = this.seller.sellByCode(code, client);
	return rs;
};
ctrl.prototype.buyType = function(type, number, client) {
	var rs = [];
	number = parseInt(number);
	number = number > 0? number: 1;

	for(var i = 0; i < number; i++) {
		rs.push(this.seller.sellByType(type, client));
	}

	return rs;
};
ctrl.prototype.buyEvent = function(ev, number, client) {
	var rs = [];
	number = parseInt(number);
	number = number > 0? number: 1;

	for(var i = 0; i < number; i++) {
		rs.push(this.seller.sellByEvent(ev, client));
	}

	return rs;
};
ctrl.prototype.update = function() {
	return true;
};
ctrl.prototype.isFinish = function() {
	if(this.remainTickets.length > 0) return false;

	this.times++;
	this.seller.loadTicket();
	this.remainTickets = this.seller.remainTickets;

	try {
		this.io.emit('channel', {
			"event": "reset",
			"times": this.times
		});
	}
	catch(e) {
		console.log(e);
	}
};



Channel.prototype.init = function(config) {
	channelCtrl = new ctrl(config);
};
Channel.prototype.setConfig = function(config) {
	this.config = config;
	this.io = require('socket.io').listen(this.config.get('server'), {
	    'pingInterval': 3600000,
	    'pingTimeout': 3600000
	});
};
Channel.prototype.setSeller = function(seller) {
	channelCtrl.seller = seller;
	//this.connection.remain = seller.remain();
	channelCtrl.remainTickets = seller.remainTickets;
};
Channel.prototype.start = function() {
	var io = this.io;

	io.on('connection', function(socket) {
		var customer = socket.client.id;

		channelCtrl.connection.current += 1;
		channelCtrl.connection.history += 1;

		socket.emit('channel', {'event': 'enter', 'data': channelCtrl.connection});
		if(channelCtrl.update()) { socket.broadcast.emit('channel', {'event': 'enter', 'data': channelCtrl.connection}); }
		socket.on('disconnect', function() {
			channelCtrl.connection.current -= 1;

			if(channelCtrl.update()) { socket.broadcast.emit('channel', {'event': 'enter', 'data': channelCtrl.connection}); }
		});

		socket.on('channel', function(_event) {
			var ev = _event.event;
			var data = _event.data;
			var rs, brs;

			switch(ev) {
				case 'getTickets':
					rs = {
						"event": "getTickets",
						"times": channelCtrl.times,
						"data": channelCtrl.getTickets()
					};
					socket.emit('channel', rs);
					break;

				case 'getAreaTickets':
					rs = {
						"event": "getTickets",
						"times": channelCtrl.times,
						"data": channelCtrl.getAreaTickets()
					};
					socket.emit('channel', rs);
					break;

				case 'buyCode':
					var code = data;
					var client = socket.client.id;

					rs = {
						"event": "buyCode",
						"data": channelCtrl.buyCode(code, client)
					};

					brs = {
						"event": "sold",
						"data": []
					};

					if(rs.data) {
						brs.data.push(rs.data[0]);
					}

					try {
						socket.emit('channel', rs);
					} catch(e) {}
					if(brs.data.length > 0) {
						try {
							io.emit('channel', brs);
						}
						catch(e) {}
						channelCtrl.isFinish();
					}
					break;

				case 'buyType':
					var type = data.type;
					var number = data.number;
					var client = socket.client.id;

					rs = {
						"event": "buyType",
						"data": channelCtrl.buyType(type, number, client)
					};

					brs = {
						"event": "sold",
						"data": []
					};

					for(var k in rs.data) {
						if(rs.data[k]) {
							brs.data.push(rs.data[k][0]);
						}
					}

					try {
						socket.emit('channel', rs);
					} catch(e) {}
					if(brs.data.length > 0) {
						try {
							io.emit('channel', brs);
						}
						catch(e) {}
						channelCtrl.isFinish();
					}
					break;

				case 'buyEvent':
					var ev = data.event;
					var number = data.number;
					var client = socket.client.id;

					rs = {
						"event": "buyEvent",
						"data": channelCtrl.buyEvent(type, number, client)
					};

					brs = {
						"event": "sold",
						"data": []
					};

					for(var k in rs.data) {
						if(rs.data[k]) {
							brs.data.push(rs.data[k][0]);
						}
					}

					try {
						socket.emit('channel', rs);
					} catch(e) {}
					if(brs.data.length > 0) {
						try {
							io.emit('channel', brs);
						}
						catch(e) {}
						channelCtrl.isFinish();
					}
					break;
			}
		});
	});
};

module.exports = Channel;