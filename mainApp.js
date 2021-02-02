var server = require("./serverCFG");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handlers = {};

server.start(router.route, handlers);