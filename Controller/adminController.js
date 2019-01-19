let universalFunctions             = require('../Lib/UniversalFunctions'),
    db                              = require('../Lib/connection'),
    config                          = require('../Config/appConstant');


async function adminLogin (payload) {
    try{

        let step1 =   await checkUserExists(payload);

        let step2 =   await setTokenInDb( step1);

        return {
            statusCode      :  200,
            message         : "Success",
            data            : {
                id              :  step1[0].id,
                email           :  step1[0].email,
                accessToken     :  step2
            }

        };
    }
    catch (er)
    {

        console.log(er);
        return {
            statusCode  : 400,
            message     : er.sqlMessage || er.customMessage,
            responseType: er.code || er.type,
        };
    }

};

async function setTokenInDb(data)
{
    let token =  await  universalFunctions.encryptToken({id:data[0].id,type:config.userType.admin}),
    sql   =  "update admins set accessToken = ? where id=?";
    await db.connection.query(sql,[token,data[0].id]);
    return token;
};

async function checkUserExists(data)
{
    let sql = "select * from admins  where email=? AND password=?";
    let arr = [data.email,universalFunctions.CryptData(data.password)];
    let result =  await db.connection.query(sql,arr);

    if(result.length>0)
    {
        return result;
    }
    else
    {
        return Promise.reject(config.STATUS_MSG.ERROR.ADMIN_NOT_FOUND);
    }
};

module.exports = {
    adminLogin              : adminLogin           ,
};