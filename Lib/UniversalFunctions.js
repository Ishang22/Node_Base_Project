let   { parse }    = require('querystring'),
        url        = require('url'),
        MD5        = require('md5'),
    db                 = require('./connection'),
     config        = require('../Config/appConstant'),
     crypto        = require('crypto'),
    algorithm      = process.env.algorithm,
    key            = process.env.key;



const CryptData = function (stringToCrypt) {
    return MD5(MD5(stringToCrypt));
};


function getRequestData(request) {
    let url_parts = url.parse(request.url, true);
    return url_parts.query;
};

async function postRequestData(request) {
    return new Promise(async (resolve, reject) => {

        let isAccessToken=0,userData={}
        if(request.headers.authorization && request.headers.authorization!=='')
        {
            userData = await (validateUser((await decryptToken(request.headers.authorization)), request.headers.authorization));
            isAccessToken=1;
            if(!userData){

                console.log("==config.STATUS_MSG.ERROR.INVALID_TOKEN===",config.STATUS_MSG.ERROR.INVALID_TOKEN);
                return reject(config.STATUS_MSG.ERROR.INVALID_TOKEN)
            }
        }


        let body = '';
        request.on('data', chunk => {body += chunk.toString();});

        request.on('end', () => {
            let data = parse(body);
            if(isAccessToken)
            {
                data.userData = userData[0];
            }
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


async function validateUser(data,accessToken) {

    let  sql='',userType = JSON.parse(data).userType;

    if (userType === config.userType.user){
        console.log("====step1 ======");
        sql= "select * from user where id =? and accessToken = ?";

    }
    else if (userType === config.userType.admin){
        console.log("====step2 ======");
        sql= "select * from admins  where id =? and accessToken = ?";
    }

   let dataToSend = await  db.connection.query(sql,[JSON.parse(data).id,accessToken]);

    console.log("===[JSON.parse(data).id,accessToken]==============",[JSON.parse(data).id,accessToken],JSON.parse(data).userType);
   if(dataToSend.length>0)
   {
       return dataToSend;
   }
   else
   {
       return null;
   }

};



module.exports={
    getRequestData  : getRequestData,
    postRequestData : postRequestData,
    CryptData       : CryptData,
    encryptToken    : encryptToken,
    decryptToken    : decryptToken
};