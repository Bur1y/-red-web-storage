function start(response) {

    // console.log('CALL function csCB');
    response.writeHead(404, {"Content-Type": "text/plain"});
    // response.write("Hello World");
    response.end();
}

function upload(response) {
    // console.log('CALL function csCB');
    response.writeHead(500, {"Content-Type": "text/plain"});
    //  response.write("Hello World");
    response.end();
}

exports.start = start;
exports.upload = upload;