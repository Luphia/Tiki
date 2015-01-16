#!/usr/bin/env node

var times = parseInt(process.argv[2]);
times = times > 0? times: 1;

var cp = require('child_process');
for(var i = 0; i < times; i++) {
	cp.fork(__dirname + '/test.js');
	if(i % 100 == 9) console.log("%d Bots lunched !!", i + 1);
}
