


function hitApi() {
    console.log("=hitApi=============");
    return {
        statusCode:200,
        message:"Success",
        data:{
            a:'a',
            b:'b'
        }
    }
};


module.exports = {
    hitApi              : hitApi           ,
};