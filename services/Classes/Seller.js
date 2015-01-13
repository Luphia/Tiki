var EasyDB = require('./EasyDB.js')
,	total = 0
,	no = 0
;

var intString = function(int, length) {
	var l = length > 0? length: 8;
	var rs = int.toString();

	while(rs.length < l) {
		rs = '0' + rs;
	}

	return rs;
	}
,	randomID = function(n) {
	n = (n > 0)? n: 8;
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

	for(var i = 0; i < n; i++ ) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}
,	clone = function(target) {
	if(typeof(target) == 'object') {
		var rs = Array.isArray(target)? []: {};
		for(var key in target) {
			rs[key] = clone(target[key]);
		}
		return rs;
	}
	else {
		return target;
	}
};



var Seller = function(config) {
	this.init(config);
};

Seller.prototype.init = function(config) {
	++total;
	this.no = no++;

	if(config) {
		this.setConfig(config);
	}
};

Seller.prototype.setConfig = function(config) {
	this.config = config;
	this.db = new EasyDB();
	this.db.connect({"url": this.config.get("mongo").uri});
};

Seller.prototype.loadTicket = function() {
	var data = this.db.listData('concert');
	this.tickets = [];
	this.index = {};
	this.lock = {};
	for(var key in data) {
		if(data[key]._id % total == this.no) {
			var index = this.tickets.push(data[key]) - 1;
			this.index[data[key]['code']] = index;
			this.lock[data[key]['code']] = false;
		}
	}
};

Seller.prototype.lock = function(code) {
	if(this.lock[code] || !this.lock.hasOwnProperty(code)) {
		return false;
	}
	if(this.index.hasOwnProperty(code) && !this.tickets[ this.index[code] ].secret) {
		var secret = randomID(8);
		this.tickets[ this.index[code] ].secret = secret;

		var type = this.tickets[ this.index[code] ].type;
		this.remainTickets[type] -= 1;
		return secret;
	}
};

Seller.prototype.lockByType = function(type) {
	var code, key;
	for(var k in this.tickets) {
		if(this.tickets[k].type == type && !this.tickets[k].secret) {
			code = this.tickets[k].code;
			key = this.lock(code);
		}
		if(key) {
			return [code, key];
		}
	}

	return false;
};

Seller.prototype.lockByEvent = function(event) {
	var code, key;
	for(var k in this.tickets) {
		if(this.tickets[k].event == event && !this.tickets[k].secret) {
			code = this.tickets[k].code;
			key = this.lock(code);
		}
		if(key) {
			return [code, key];
		}
	}

	return false;
}

Seller.prototype.unlock = function(code, key) {
	if(this.lock[code] == key) {
		this.lock[code] = false;

		var type = this.tickets[ this.index[code] ].type;
		this.remainTickets[type] += 1;
		return true;
	}
	else {
		return false;
	}
};

Seller.prototype.sellByCode = function(code, customer) {
	var key = this.lock(code);
	if(key) {
		this.tickets[this.index[code]].secret = key;
		this.tickets[this.index[code]].owner = customer;

		return [code, key];
	}
	else {
		return false;
	}
};

Seller.prototype.sellByType = function(type, customer) {
	var ticket = this.lockByType(type);
	if(ticket) {
		var code = ticket[0]
		,	secret = ticket[1];

		this.tickets[ this.index[code] ].owner = customer;
		return ticket;
	}
	else {
		return false;
	}
};

Seller.prototype.sellByEvent = function(event, customer) {
	var ticket = this.lockByType(type);
	if(ticket) {
		var code = ticket[0]
		,	secret = ticket[1];

		this.tickets[ this.index[code] ].owner = customer;
		return ticket;
	}
	else {
		return false;
	}
};

Seller.prototype.remain = function(reset) {
	if(!this.remainTickets || reset) {
		for(var k in this.tickets) {
			if(this.remainTickets[ this.tickets[k].type ]) {
				this.remainTickets[ this.tickets[k].type ] = 1;
			}
			else {
				this.remainTickets[ this.tickets[k].type ] ++;
			}
		}
	}

	var rs = {
		total: 0,
		detail: []
	};

	for(var k in this.remainTickets) {
		rs.detail[k] = this.remainTickets[k];
		rs.total += this.remainTickets[k];
	}
};

Seller.prototype.setTicket = function(options) {
	ticketOptions = {
		event: "concert",
		type: {
			"A01": 200,
			"A02": 200,
			"A03": 200,
			"A04": 300,
			"A05": 300,
			"A06": 300,
			"A07": 300,
			"A08": 500,
			"A09": 500,
			"A10": 500,
			"A11": 500,
			"A12": 500,
			"A13": 500,
			"A14": 500,
			"A15": 500,
			"A16": 500,
			"A17": 500,
			"A18": 500,
			"A19": 500,
			"A20": 500,
		}
	};

	var data = [];
	this.db.cleanTable(ticketOptions.event);
	for(var key in ticketOptions.type) {
		
		for(var i = 0; i < ticketOptions.type[key]; i++) {
			data.push({
				"event": ticketOptions.event,
				"type": key,
				"code": key + intString((i+1), 8)
			});
		}

	}
	console.log(data.length);
	this.db.postData(ticketOptions.event, data);
};

module.exports = Seller;