let universalFunctions             = require('../Lib/UniversalFunctions'),
    db                              = require('../Lib/connection'),
    config                          = require('../Config/appConstant');


/////////////////////////////////////////////////////// signUp ///////////////////////////////////////////////////
async function signUp(payload) {
    try{
     let step1 = await  checkUserAlreadyExists(payload);
     let step2 = await  saveEntryOfUser(payload);
     let step3 = await setTokenInDb(step2);
        return {
            statusCode      :  200,
            message         : "Success",
            data            : {
                id              :  step2.insertId,
                email           :  payload.email,
                accessToken     :  step3
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

async function checkUserAlreadyExists(data)
{
    let  sql= "select * from user where email =?";
    let dataToSend = await  db.connection.query(sql,[data.email]);
    if(dataToSend.length>0)
    {
        return Promise.reject(config.STATUS_MSG.ERROR.DUPLICATE_EMAIL);
    }
    else
    {
        return null ;
    }

};

async function saveEntryOfUser(data)
{
    let sql    = "INSERT INTO user(name,email,password) VALUES (?,?,?)",
        params = [data.name,data.email,universalFunctions.CryptData(data.password)];
    return   await db.connection.query(sql,params);

};

async function setTokenInDb(data)
{
    let token =  await  universalFunctions.encryptToken({id:data.insertId?data.insertId:data[0].id,type:config.userType.user}),
        sql   =  "update user set accessToken = ? where id=?";
    console.log([token,(data.insertId?data.insertId:data[0].id)])
    await db.connection.query(sql,[token,(data.insertId?data.insertId:data[0].id)]);
    return token;
};



/////////////////////////////////////////////////////// login ///////////////////////////////////////////////////
async function login(payload) {
    try{
        let step1 = await  checkUserExists(payload);
        let step2 = await setTokenInDb(step1);
        return {
            statusCode      :  200,
            message         : "Success",
            data            : {
                id              :  step1.id,
                email           :  payload.email,
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

async function checkUserExists(data)
{
    let sql = "select * from user  where email=? AND password=?";
    let arr = [data.email,universalFunctions.CryptData(data.password)];
    let result =  await db.connection.query(sql,arr);

    if(result.length>0)
    {
        return result;
    }
    else
    {
        return Promise.reject(config.STATUS_MSG.ERROR.USER_NOT_FOUND);
    }
};

/////////////////////////////////////////////////////// Item-Listing ///////////////////////////////////////////////////
async function itemListing(payload) {
    try{

        let step1 =   itemListingFunction(payload);
        let step2 =   itemListingCount();
        return {
            statusCode      :  200,
            message         : "Success",
            data            : {
                listing         : await step1,
                count            : (await  step2)[0].count
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

async function itemListingFunction(data)
{
    let sql = "select * from items ",arr=[];


    if(data.searchParameter)
    {
        sql=sql +" WHERE name LIKE ? AND isDeleted = 0";
        arr=[`%${data.searchParameter}%`]
    }
    else
    {
        sql=sql +" WHERE isDeleted = 0";
    }

    sql=sql +" ORDER BY createdAt ASC";

    if((parseInt(data.offset)+parseInt(data.limit))>0)
    {
        sql=sql +" LIMIT ?,?";
        arr=[...arr,...[parseInt(data.offset),parseInt(data.limit)]];
    }

    return    db.connection.query(sql,arr);
};

async function itemListingCount()
{
    let sql = "select COUNT(id) AS count from items";
    let arr = [];
    return db.connection.query(sql,arr);

};

///////////////////////////////////////////////////////  edit-item ///////////////////////////////////////////////////
async function editProducts(payload) {
    try{

        let step1 = getProductDetails(payload);
        let step2 = updateItemData(payload);
        let step3= generateUserLogs(await step1,payload);

        return {
            statusCode      :  200,
            message         : "updated successfully",
            data            :  null
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

async function getProductDetails(data)
{
    let sql = "select * from items where id = ? ";
    return   db.connection.query(sql,[parseInt(data.itemId)]);
};

async function updateItemData(data)
{
    let   sql   =  "update items set name = ?,brand=?,category=?,productCode=? where id=?";
    return   db.connection.query(sql,[data.name,data.brand,data.category,data.productCode,parseInt(data.itemId)]);
};

async function generateUserLogs(productDetails,userProductDetails)
{
// console.log("===generateUserLogs========userProductDetails======userProductDetails===",productDetails,userProductDetails);

    let notificationString = userProductDetails.userData.name+ " has changed the";
    let count = 0;


    if(productDetails[0].name !==userProductDetails.name)
    {
        notificationString= notificationString+" name";
        count++;
    }
    if(productDetails[0].brand !==userProductDetails.brand)
    {
        if(count>0)
        notificationString= notificationString+",brand";
        else
        notificationString= notificationString+" brand";

        count++;
    }
     if(productDetails[0].category !==userProductDetails.category)
    {
        if(count>0)
            notificationString= notificationString+",category";
        else
            notificationString= notificationString+" category";

        count++;
    }
     if(productDetails[0].productCode !==userProductDetails.productCode)
    {
        if(count>0)
            notificationString= notificationString+",productCode";
        else
            notificationString= notificationString+" productCode";

        count++;
    }

    notificationString = notificationString + " of product "+productDetails[0].name +" .";

    console.log(notificationString);
    if(count>0)
    {
        let sql    = "INSERT INTO userLogs(notificationString,userId,itemId,variantId) VALUES (?,?,?,?)",
            params = [notificationString,userProductDetails.userData.id,userProductDetails.itemId,userProductDetails.variantId?userProductDetails.variantId:null];
       return  await db.connection.query(sql,params);
    }

};

/////////////////////////////////////////////////////// getVariants ///////////////////////////////////////////////////
async function getVariants(payload) {
    try{
        let step1 =   getVariantFunction(payload);
        let step2 =   getVariantCount();
        return {
            statusCode      :  200,
            message         : "Success",
            data            : {
                listing         : await step1,
                count            : (await  step2)[0].count
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

async function getVariantFunction(data)
{
    let sql = "SELECT p.`id`,p.`size`,p.`clothType`,p.`createdAt`,p.`variantId`,p.`itemId`,p.`costPrice`," +
        "p.`sellingPrice`," +
        "p.`quanity`,p.`isDeleted`,v.name,v.id AS variantId FROM `properties` " +
        "p INNER JOIN variants v ON p.`variantId`= v.id WHERE " +
        "p.`itemId` = ? AND v.isDeleted=0 AND p.isDeleted=0 AND p.quanity>0",arr=[parseInt(data.itemId)];

  //clothType
    //	size
    if(data.searchParameter)
    {
        sql=sql +" AND (clothType LIKE ? OR  size LIKE ?)";
        arr=[...arr,...[`%${data.searchParameter}%`,`%${data.searchParameter}%`]];
    }

    sql=sql +" ORDER BY createdAt ASC";

    if((parseInt(data.offset)+parseInt(data.limit))>0)
    {
        sql=sql +" LIMIT ?,?";
        arr=[...arr,...[parseInt(data.offset),parseInt(data.limit)]];
    }

    console.log(sql,arr);
    return    db.connection.query(sql,arr);
};

async function getVariantCount()
{
    let sql = "select COUNT(id) AS count from properties";
    let arr = [];
    return db.connection.query(sql,arr);

};


///////////////////////////////////////////////////////  editVariants ///////////////////////////////////////////////////
async function editVariants(payload) {
    try{

        let step1 = getVariantDetails(payload);
         let step2 = updatePropertyData(payload);
         let step3= generateUserLogsForVariants(await step1,payload);

        return {
            statusCode      :  200,
            message         : "updated successfully",
            data            :  null
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

async function getVariantDetails(data)
{
    let sql = "SELECT p.`id`,p.`size`,p.`clothType`,p.`createdAt`,p.`variantId`," +
        "p.`itemId`,p.`costPrice`,p.`sellingPrice`," +
        "p.`quanity`,p.`isDeleted`,v.name,v.id AS variantId,i.name AS itemName FROM `properties`" +
        " p INNER JOIN variants v ON p.`variantId`= v.id INNER JOIN items i  ON p.`itemId`= i.id WHERE " +
        "p.id=?";
    return   db.connection.query(sql,[parseInt(data.variantId)]);
};

async function updatePropertyData(data)
{
    let   sql   =  "update properties p INNER JOIN variants v ON p.`itemId`= v.id  SET " +
        "p.`size`=?,p.`clothType`=?,p.`costPrice`=?,p.`sellingPrice`=?,p.`quanity`=?,v.name=? where p.id=?";
    return   db.connection.query(sql,[data.size,data.clothType,data.costPrice,data.sellingPrice,data.quanity,data.name,parseInt(data.variantId)]);
};

async function generateUserLogsForVariants(productDetails,userProductDetails)
{
// console.log("===generateUserLogs========userProductDetails======userProductDetails===",productDetails,userProductDetails);

    let notificationString = userProductDetails.userData.name+ " has changed the variant "+productDetails[0].name ;
    let count = 0;


    if(productDetails[0].size !=userProductDetails.size)
    {
        notificationString= notificationString+" size";
        count++;
    }
    if(productDetails[0].clothType !=userProductDetails.clothType)
    {
        if(count>0)
            notificationString= notificationString+",clothType";
        else
            notificationString= notificationString+" clothType";

        count++;
    }
    if(productDetails[0].costPrice !=userProductDetails.costPrice)
    {
        if(count>0)
            notificationString= notificationString+",costPrice";
        else
            notificationString= notificationString+" costPrice";

        count++;
    }
    if(productDetails[0].sellingPrice !=userProductDetails.sellingPrice)
    {
        if(count>0)
            notificationString= notificationString+",sellingPrice";
        else
            notificationString= notificationString+" sellingPrice";

        count++;
    }
    if(productDetails[0].quanity !=userProductDetails.quanity)
    {
        if(count>0)
            notificationString= notificationString+",quanity";
        else
            notificationString= notificationString+" quanity";

        count++;
    }
    if(productDetails[0].name !=userProductDetails.name)
    {
        if(count>0)
            notificationString= notificationString+",name";
        else
            notificationString= notificationString+" name";

        count++;
    }

    notificationString = notificationString + " of product "+productDetails[0].itemName +" .";

    console.log(notificationString);
    if(count>0)
    {
        let sql    = "INSERT INTO userLogs(notificationString,userId,itemId,variantId) VALUES (?,?,?,?)",
            params = [notificationString,userProductDetails.userData.id,userProductDetails.itemId,userProductDetails.variantId?userProductDetails.variantId:null];
        return  await db.connection.query(sql,params);
    }

};


/////////////////////////////////////////////////////// getUserLogs ///////////////////////////////////////////////////
async function getUserLogs(payload) {
    try{
        let step1 =   getUserLogsFunction(payload);
        let step2 =   getUserLogsCount(payload);
        return {
            statusCode      :  200,
            message         : "Success",
            data            : {
                listing          : await step1,
                count            : (await  step2)[0].count
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

async function getUserLogsFunction(data)
{
    let sql = "SELECT * from userLogs",arr=[];

    if(data.userId && data.userId!=='')
    {
        sql=sql+' where userId = ? ';
        arr=[data.userId];
    }

    return    db.connection.query(sql,arr);
};

async function getUserLogsCount(data)
{
    let sql = "select COUNT(id) AS count from userLogs",arr=[];

    if(data.userId && data.userId!=='')
    {
        sql=sql+' where userId = ? ';
        arr=[data.userId];
    }
    return db.connection.query(sql,arr);

};


/////////////////////////////////////////////////////// deleteItem ///////////////////////////////////////////////////
async function deleteItem(data)
{

    console.log("================data=======================",data);
   let sql   =  "update items set isDeleted = 1  where id=?";
          await db.connection.query(sql,[parseInt(data.itemId)]);

       sql   =  "update variants set isDeleted = 1  where itemId=?";
         await db.connection.query(sql,[parseInt(data.itemId)]);

       sql   =  "update properties set isDeleted = 1  where itemId=?";
       await db.connection.query(sql,[parseInt(data.itemId)]);


    return {
        statusCode      :  200,
        message         : "Items Deleted Succesfully",
        data            : null

    };
};

/////////////////////////////////////////////////////// deleteVariants ///////////////////////////////////////////////////
async function deleteVariants(data)
{

   let sql   =  "update variants set isDeleted = 1  where id=? ";
    await db.connection.query(sql,[parseInt(data.variantId)]);

    sql   =  "update properties set isDeleted = 1  where variantId=? and itemId=?";
    await db.connection.query(sql,[parseInt(data.variantId),parseInt(data.itemId)]);


    return {
        statusCode      :  200,
        message         : "variant Deleted Succesfully",
        data            : null

    };
};






module.exports = {
    signUp              : signUp,
    login               : login,
    itemListing         : itemListing,
    editProducts        : editProducts,
    getVariants         : getVariants,
    editVariants        : editVariants,
    getUserLogs         : getUserLogs,
    deleteItem          : deleteItem,
    deleteVariants      : deleteVariants
};