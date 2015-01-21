var Channel = function(config) {
	this.init(config);
};

var lastUpdate = 0;

Channel.prototype.init = function(config) {
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
Channel.prototype.setConfig = function(config) {
	this.config = config;
	this.io = require('socket.io').listen(this.config.get('server'), {
	    'pingInterval': 3600000,
	    'pingTimeout': 3600000
	});
};
Channel.prototype.setSeller = function(seller) {
	this.seller = seller;
	//this.connection.remain = seller.remain();
	this.remainTickets = seller.remainTickets;
};

Channel.prototype.getTickets = function() {
	return this.remainTickets;
};
Channel.prototype.getAreaTickets = function() {
	var i = 0, rs = [];
	var pick = 10;
	if(pick > this.remainTickets.length) { return this.remainTickets; }

	var s = Math.floor( Math.random() * (this.remainTickets.length - 10) );

	return this.remainTickets.slice(s, s + 10);
};
Channel.prototype.buyCode = function(code, client) {
	var rs = this.seller.sellByCode(code, client);
	return rs;
};
Channel.prototype.buyType = function(type, number, client) {
	var rs = [];
	number = parseInt(number);
	number = number > 0? number: 1;

	for(var i = 0; i < number; i++) {
		rs.push(this.seller.sellByType(type, client));
	}

	return rs;
};
Channel.prototype.buyEvent = function(ev, number, client) {
	var rs = [];
	number = parseInt(number);
	number = number > 0? number: 1;

	for(var i = 0; i < number; i++) {
		rs.push(this.seller.sellByEvent(ev, client));
	}

	return rs;
};
Channel.prototype.update = function() {
	return true;
	/*
	var now = new Date() * 1;
	var per = 10000;
	if(now - lastUpdate > per) {

		lastUpdate = now;
		return true;
	}
	else {
		return false;
	}
	*/
};
Channel.prototype.setOwner = function(client, customer) {

};

Channel.prototype.start = function() {
	var self = this
	,	io = this.io;

	io.on('connection', function(socket) {
		var customer = socket.client.id;

		self.connection.current += 1;
		self.connection.history += 1;

		socket.emit('channel', {'event': 'enter', 'data': self.connection});
		if(self.update()) { socket.broadcast.emit('channel', {'event': 'enter', 'data': self.connection}); }
		socket.on('disconnect', function() {
			self.connection.current -= 1;

			if(self.update()) { socket.broadcast.emit('channel', {'event': 'enter', 'data': self.connection}); }
		});

		socket.on('channel', function(_event) {
			var ev = _event.event;
			var data = _event.data;
			var rs, brs;

			switch(ev) {
				case 'getTickets':
					rs = {
						"event": "getTickets",
						"times": self.times,
						"data": self.getTickets()
					};
					socket.emit('channel', rs);
					break;

				case 'getAreaTickets':
					rs = {
						"event": "getTickets",
						"times": self.times,
						"data": self.getAreaTickets()
					};
					socket.emit('channel', rs);
					break;

				case 'buyCode':
					var code = data;
					var client = socket.client.id;

					rs = {
						"event": "buyCode",
						"data": self.buyCode(code, client)
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
						self.isFinish();
					}
					break;

				case 'buyType':
					var type = data.type;
					var number = data.number;
					var client = socket.client.id;

					rs = {
						"event": "buyType",
						"data": self.buyType(type, number, client)
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
						self.isFinish();
					}
					break;

				case 'buyEvent':
					var ev = data.event;
					var number = data.number;
					var client = socket.client.id;

					rs = {
						"event": "buyEvent",
						"data": self.buyEvent(type, number, client)
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
						self.isFinish();
					}
					break;
			}
		});
	});
};

Channel.prototype.isFinish = function() {
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

module.exports = Channel;