var EasyDB = require('./EasyDB.js')
,	total = 0
,	no = 0
;

var Seller = function(config) {
	this.init(config);
};

Seller.prototype.init = function(config) {
	this.cluster = {
		total: ++total,
		no: no++
	};

	if(config) {
		this.setConfig(config);
	}
};

Seller.prototype.setConfig = function(config) {
	this.config = config;
	this.db = new EasyDB();
	db.connect({"url": this.config.get("mongodb").uri});
};

Seller.prototype.setTicket = function(options) {
	ticketOptions = {
		event: "姜蕙演唱會",
		type: {
			"搖滾區": 200,
			"平面特區": 200,
			"A區": 500,
			"B區": 500,
			"C區": 500,
			"D區": 500,
			"E區": 500,
			"外圍區": 2000,
			"高層區": 2000
		}
	};

	var data = [];
	for(var key in ticketOptions.type) {
		for(var i = 0; i < ticketOptions.type[key]; i++) {
			data.push({
				"event": ticketOptions.event,
				"type": key
			});
		}
	}
	db.cleanTable(ticketOptions.event);
	db.postData(ticketOptions.event, data);
};