var Channel = function(config) {
	this.init(config);
};

Channel.prototype.init = function(config) {
	if(config) {
		this.setConfig(config);
	}
};
Channel.prototype.setConfig = function(config) {
	this.config = config;
	this.io = require('socket.io').listen(this.config.get('server'));
};
Channel.prototype.start = function() {
	var self = this
	,	io = this.io;

	io.on('connection', function(socket) {
		io.emit('channel', {'event': 'enter', 'data': {'client': socket.client.id}});
		socket.on('disconnect', function() {
			io.emit('channel', {'event': 'leave', 'data': {'client': socket.client.id}});
		});
	});
};
Channel.prototype.setPath = function() {};
Channel.prototype.setRoom = function() {};

module.exports = Channel;