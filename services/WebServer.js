var express = require('express')
,	session = require('express-session'),
,	express = require('express')
,	favicon = require('serve-favicon')
,	fs = require('fs')
,	path = require('path')
,	bodyParser = require('body-parser')
,	oauthserver = require('oauth2-server')
;

var WebServer = function() {};


WebServer.prototype.init = function() {};
WebServer.prototype.start = function() {};
WebServer.prototype.getRoute = function() {};
WebServer.prototype.getAPP = function() {};
WebServer.prototype.getServer = function() {};
WebServer.prototype.getSecure = function() {};