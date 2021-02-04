var nodeStatic = require('node-static');
var fileServer = new nodeStatic.Server(`${__dirname}/static`);
var fileServerMedia = new nodeStatic.Server(`${__dirname}/storage`);

function route(handle, pathname, request, response) {
    // console.log("Request:", typeof pathname , pathname.match(/^\/download/));
    // console.log(`About to route a request from ${request.socket.remoteAddress} for ${pathname}`);
    if ((typeof handle[pathname]) === 'function') {
        handle[pathname](request, response);
    } else if (pathname.match(/^\/download/)){
        fileServerMedia.serve(request, response);
    } else {
        fileServer.serve(request, response);
    }
}

exports.route = route;