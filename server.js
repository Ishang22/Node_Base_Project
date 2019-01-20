
require('dotenv').config();
const http                = require('http'),
       db                 = require('./Lib/connection'),
      requestParser       = require('./Lib/requestParser'),
      universalFunction   = require('./Lib/UniversalFunctions'),
    config        = require('./Config/appConstant'),
      url                 = require('url');


http.createServer(async function (req, res) {
    try{

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
    }
catch (er)
{
    if(er.statusCode)
    res.end(JSON.stringify(er)) ;
    else
    {
        res.end(JSON.stringify(config.STATUS_MSG.ERROR.SOMETHING_WENT_WRONG)) ;
    }

}


}).listen(8080);



console.log("Server Starts At 8080");