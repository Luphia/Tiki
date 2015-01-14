#!/usr/bin/env node

var cp = require('child_process');
var n = 600;
for(var i = 0; i < n; i++) {
	cp.fork(__dirname + '/single.js');
}
