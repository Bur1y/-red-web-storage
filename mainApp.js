var server = require("./serverCFG");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handlers = {};
handlers['/api/get-list'] = requestHandlers.getList;
handlers['/api/create']   = requestHandlers.create;
handlers['/api/remove']   = requestHandlers.remove;

server.start(router.route, handlers);