var Ctrl = require('./Classes/Ctrl.js');

var Channel = function(config) {
	this.init(config);
};

var lastUpdate = 0;
var channelCtrl;

Channel.prototype.init = function(config) {
	channelCtrl = new Ctrl(config);
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

						if(channelCtrl.isFinish()) {
							try {
								io.emit('channel', {
									"event": "reset",
									"times": this.times
								});
							}
							catch(e) {
								console.log(e);
							}
						}
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
						if(channelCtrl.isFinish()) {
							try {
								io.emit('channel', {
									"event": "reset",
									"times": this.times
								});
							}
							catch(e) {
								console.log(e);
							}
						}
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
						if(channelCtrl.isFinish()) {
							try {
								io.emit('channel', {
									"event": "reset",
									"times": this.times
								});
							}
							catch(e) {
								console.log(e);
							}
						}
					}
					break;
			}
		});
	});
};

module.exports = Channel;