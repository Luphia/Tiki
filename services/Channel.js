var Channel = function(config) {
	this.init(config);
};

var lastUpdate = 0;

Channel.prototype.init = function(config) {
	if(config) {
		this.setConfig(config);
	}

	this.connection = {
		current: 0,
		history: 0,
		focus: {}
	};

	this.remainTickets = [];
};
Channel.prototype.setConfig = function(config) {
	this.config = config;
	this.io = require('socket.io').listen(this.config.get('server'));
};
Channel.prototype.setSeller = function(seller) {
	this.seller = seller;
	//this.connection.remain = seller.remain();
	this.remainTickets = seller.remainTickets;
};

Channel.prototype.getTickets = function() {
	return this.remainTickets;
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
	var now = new Date() * 1;
	var per = 10000;
	if(now - lastUpdate > per) {

		lastUpdate = now;
		return true;
	}
	else {
		return false;
	}
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
						"data": self.getTickets()
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

					socket.emit('channel', rs);
					if(brs.data.length > 0) io.emit('channel', brs);

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

					socket.emit('channel', rs);
					if(brs.data.length > 0) io.emit('channel', brs);
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

					socket.emit('channel', rs);
					if(brs.data.length > 0) io.emit('channel', brs);
					break;
			}
		});
	});
};

module.exports = Channel;