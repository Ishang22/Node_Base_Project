let universalFunctions             = require('../Lib/UniversalFunctions'),
    db                              = require('../Lib/connection'),
    config                          = require('../Config/appConstant');




/////////////////////////////////////////////////////// adminLogin ///////////////////////////////////////////////////
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

/////////////////////////////////////////////////////// addItems ///////////////////////////////////////////////////
async function addItems (payload) {
    try{

        let sql    = "INSERT INTO items(name,brand,category,productCode) VALUES (?,?,?,?)",
            params = [payload.name,payload.brand,payload.category,payload.productCode];
           let dataToSend =   await db.connection.query(sql,params);

        return {
            statusCode      :  200,
            message         : "Successfully added Item",
            data            : dataToSend
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

/////////////////////////////////////////////////////// addVariants ///////////////////////////////////////////////////
async function addVariants (payload) {
    try{

        let sql    = "INSERT INTO variants(itemId,name) VALUES (?,?)",
            params = [payload.itemId,payload.name];
        let dataToSend =   await db.connection.query(sql,params);

        return {
            statusCode      :  200,
            message         : "Successfully added Variants",
            data            : dataToSend
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


/////////////////////////////////////////////////////// addProperties ///////////////////////////////////////////////////
async function addProperties (payload) {
    try{

        let sql    = "INSERT INTO properties(size,clothType,variantId,itemId,costPrice,sellingPrice,quanity) VALUES (?,?,?,?,?,?,?)",
            params = [payload.size,payload.clothType,payload.variantId,payload.itemId,payload.costPrice,payload.sellingPrice,payload.quanity];
        let dataToSend =   await db.connection.query(sql,params);

        return {
            statusCode      :  200,
            message         : "Successfully added Property",
            data            : dataToSend
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








module.exports = {
    adminLogin              : adminLogin           ,
    addItems                : addItems             ,
    addVariants             : addVariants          ,
    addProperties           : addProperties
};