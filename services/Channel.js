var Channel = function(config) {
	this.init(config);
};

Channel.prototype.init = function(config) {
	if(config) {
		this.setConfig(config);
	}

	this.connection = {
		current: 0,
		history: 0
	};
};
Channel.prototype.setConfig = function(config) {
	this.config = config;
	this.io = require('socket.io').listen(this.config.get('server'));
};
Channel.prototype.start = function() {
	var self = this
	,	io = this.io;

	io.on('connection', function(socket) {
		self.connection.current += 1;
		self.connection.history += 1;

		socket.emit('channel', {'event': 'views', 'data': self.connection.history });
		socket.broadcast.emit('channel', {'event': 'enter', 'data': {'client': socket.client.id}});
		socket.on('disconnect', function() {
			self.connection.current -= 1;

			socket.broadcast.emit('channel', {'event': 'leave', 'data': {'client': socket.client.id}});
		});
	});
};

module.exports = Channel;