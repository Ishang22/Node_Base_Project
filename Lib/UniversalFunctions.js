let   { parse }    = require('querystring'),
        url        = require('url'),
        MD5        = require('md5'),
    config         = require('../Config/appConstant'),
     crypto        = require('crypto'),
    algorithm      = 'aes256',
    key            = 'fa7ec3d6eadedd4ce0f76d754bc4a962';



const CryptData = function (stringToCrypt) {
    return MD5(MD5(stringToCrypt));
};


function getRequestData(request) {
    let url_parts = url.parse(request.url, true);
    return url_parts.query;
};

async function postRequestData(request) {
    return new Promise((resolve, reject) => {
        let body = '';

        request.on('data', chunk => {
            body += chunk.toString();
        });

        request.on('end', () => {
            let data = parse(body);
            console.log(data);
            resolve(data);
        });
    });


};

async function encryptToken(data) {
    console.log(data);
    let  text  = JSON.stringify({id:data.id,userType:data.type,date:new Date()}),
        cipher = crypto.createCipher(algorithm, key);
       return  cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
};


async function decryptToken(data) {
    let  decipher = crypto.createDecipher(algorithm, key);
   return decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
};


module.exports={
    getRequestData  : getRequestData,
    postRequestData : postRequestData,
    CryptData       : CryptData,
    encryptToken    : encryptToken,
    decryptToken    : decryptToken
};