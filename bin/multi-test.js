#!/usr/bin/env node

var times = parseInt(process.argv[2]);
times = times > 0? times: 100;

var cp = require('child_process');
var start;
var myProcess = [];
for(var i = 0; i < times; i++) {
	if((i+1) % 100 == 1) start = new Date();

	myProcess.push( cp.fork(__dirname + '/test.js') );

	if((i+1) % 100 == 0) console.log("\x1b[32m%d Bots\x1b[0m lunched (per 100 in \x1b[32m%d\x1b[0m second)", i + 1, parseInt((new Date() - start) / 1000));
}