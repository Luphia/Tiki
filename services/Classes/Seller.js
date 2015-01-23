/*
	13372 message per sec in socket.io (50 byte)
	18352 transaction with search per sec;
	10460251 transaction per sec;
	but... 20byte per ticket -> 20MB for 100,000 tickets data;
 */

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

	this.client = {};
	this.clientBuy = {};
};

Seller.prototype.setConfig = function(config) {
	this.config = config;
	this.db = new EasyDB();
	this.db.connect({"url": this.config.get("mongo").uri});
	this.loadTicket();
};

Seller.prototype.loadTicket = function() {
	var data = this.db.listData('concert').list;
	this.tickets = [];
	this.remainTickets = [];
	this.index = {};
	this.typeIndex = {};

	for(var key in data) {
		var index = this.tickets.push(data[key]) - 1;

		if(!data[key].secret) {
			this.remainTickets.push(data[key].code);
		}

		var type = data[key].type;
		this.index[data[key]['code']] = index;
		
		if(!this.typeIndex[type]) {
			this.typeIndex[type] = [];
		}
		this.typeIndex[type].push(index);
	}
};

Seller.prototype.lock = function(code) {
	if(this.index.hasOwnProperty(code) && !this.tickets[ this.index[code] ].secret) {
		var secret = randomID(8);
		this.tickets[ this.index[code] ].secret = secret;

		// should move to sell event
		this.remainTickets.splice( this.remainTickets.indexOf(code), 1 );
		//var type = this.tickets[ this.index[code] ].type;
		//this.remainTickets[type] -= 1;

		return secret;
	}
	else {
		return false;
	}
};

Seller.prototype.lockByType = function(type) {
	var code, key;
	for(var k in this.typeIndex[type]) {
		var index = this.typeIndex[type][k];
		if(!this.tickets[index].secret) {
			code = this.tickets[index].code;
			key = this.lock(code);
			if(key) {
				return [code, key];
				break;
			}
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

	if(this.index.hasOwnProperty(code) && this.tickets[ this.index[code] ].secret == code) {
		delete this.tickets[ this.index[code] ].secret;

		// should move to return event
		this.remainTickets.push(code);
		//var type = this.tickets[ this.index[code] ].type;
		//this.remainTickets[type] += 1;

		return true;
	}
	else {
		return false;
	}
};

Seller.prototype.sellByCode = function(code, customer) {
	var key = this.lock(code);
	var customer = customer.toString();
	if(key) {
		this.tickets[this.index[code]].secret = key;
		this.tickets[this.index[code]].owner = customer;

		if(!this.clientBuy[customer]) {
			this.clientBuy[customer] = [];
		}
		this.clientBuy[customer].push(this.index[code]);

		return [code, key];
	}
	else {
		return false;
	}
};

Seller.prototype.setInfo = function(customer, info) {
	this.client[customer] = info;
};

Seller.prototype.sellByType = function(type, customer) {
	var ticket = this.lockByType(type);
	if(ticket) {
		var code = ticket[0]
		,	secret = ticket[1];

		if(!this.clientBuy[customer]) {
			this.clientBuy[customer] = [];
		}
		this.clientBuy[customer].push(this.index[code]);

		this.tickets[ this.index[code] ].owner = customer;
		return ticket;
	}
	else {
		return false;
	}
};

Seller.prototype.sellByEvent = function(event, customer) {
	var ticket = this.lockByEvent(event);
	if(ticket) {
		var code = ticket[0]
		,	secret = ticket[1];

		if(!this.clientBuy[customer]) {
			this.clientBuy[customer] = [];
		}
		this.clientBuy[customer].push(this.index[code]);

		this.tickets[ this.index[code] ].owner = customer;
		return ticket;
	}
	else {
		return false;
	}
};

Seller.prototype.setTicket = function(options) {
	ticketOptions = {
		event: "concert",
		type: {
			"A01": 1000
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

	this.db.postData(ticketOptions.event, data);
	this.loadTicket();
};

Seller.prototype.test = function() {
	var s = new Date();
	var times = 10000000;

	var get = 0;
	for(var i=0; i<times; i++) {
		var ticket = this.sellByCode('A1000000499', 'Yo');
		if(ticket) {
			get++;
			console.log("get Ticket: %s", ticket);
		}
	}
	console.log("total get: %d", get);

	var sec = (new Date() - s) / 1000;
	console.log("cost: %d sec", sec);
	console.log("req per sec: %d", times/sec);
}

module.exports = Seller;