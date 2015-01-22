var Ctrl = function(config) { this.init(); };
Ctrl.prototype.init = function(config) {
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
Ctrl.prototype.getTickets = function() {
	return this.remainTickets;
};
Ctrl.prototype.getAreaTickets = function() {
	var i = 0, rs = [];
	var pick = 10;
	if(pick > this.remainTickets.length) { return this.remainTickets; }

	var s = Math.floor( Math.random() * (this.remainTickets.length - 10) );

	return this.remainTickets.slice(s, s + 10);
};
Ctrl.prototype.buyCode = function(code, client) {
	var rs = this.seller.sellByCode(code, client);
	return rs;
};
Ctrl.prototype.buyType = function(type, number, client) {
	var rs = [];
	number = parseInt(number);
	number = number > 0? number: 1;

	for(var i = 0; i < number; i++) {
		rs.push(this.seller.sellByType(type, client));
	}

	return rs;
};
Ctrl.prototype.buyEvent = function(ev, number, client) {
	var rs = [];
	number = parseInt(number);
	number = number > 0? number: 1;

	for(var i = 0; i < number; i++) {
		rs.push(this.seller.sellByEvent(ev, client));
	}

	return rs;
};
Ctrl.prototype.update = function() {
	return true;
};
Ctrl.prototype.isFinish = function() {
	if(this.remainTickets.length > 0) return false;

	this.times++;
	this.seller.loadTicket();
	this.remainTickets = this.seller.remainTickets;

	return true;
};

module.exports = Ctrl;