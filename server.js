const http                = require('http'),
       db                 = require('./Lib/connection'),
      requestParser       = require('./Lib/requestParser'),
      universalFunction   = require('./Lib/UniversalFunctions'),
      url                 = require('url');


http.createServer(async function (req, res) {
    let dataToSend = {};

    if (req.method === 'GET') {
        dataToSend = universalFunction.getRequestData(req);
    }
    else
    {
        dataToSend =  await universalFunction.postRequestData(req);
    }

    dataToSend = await requestParser.setPathOfRequest(dataToSend,url.parse(req.url).pathname);


    res.writeHead(dataToSend.statusCode, {"Content-Type": " application/json"});
    res.end( JSON.stringify(dataToSend));

}).listen(8080);



console.log("Server Starts At 8080");