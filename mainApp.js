var server = require("./serverCFG");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handlers = {};
handlers['/api/get-list'] = requestHandlers.getList;
handlers['/api/create']   = requestHandlers.create;
handlers['/api/remove']   = requestHandlers.remove;
handlers['/api/download'] = requestHandlers.download;

handlers['/api/register'] = requestHandlers.register;
handlers['/api/login']    = requestHandlers.login;
handlers['/api/logout']   = requestHandlers.logout;

server.start(router.route, handlers);