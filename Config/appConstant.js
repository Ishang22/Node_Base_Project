'use strict';



let Path = {
  USER  :'user',
  ADMIN :'admin'
};


let userType = {
    user:"user",
    admin:"admin"
};

const STATUS_MSG = {
    ERROR: {
        ADMIN_NOT_FOUND: {
            statusCode: 404,
            customMessage: 'Admin is not registered with us',
            type: 'ADMIN_NOT_FOUND'
        },
        USER_NOT_FOUND: {
            statusCode: 404,
            customMessage: 'User is not registered with us',
            type: 'USER_NOT_FOUND'
        },
        INVALID_TOKEN: {
            statusCode:401,
            customMessage : 'Your session have been expired. Please login again!',
            type : 'INVALID_TOKEN'
        },
        SOMETHING_WENT_WRONG:{
            statusCode:400,
            customMessage : 'Something Went Wrong',
            type : 'SOMETHING_WENT_WRONG'
        },
        DUPLICATE_EMAIL: {
            statusCode:400,
            customMessage : 'Email already exists',
            type : 'DUPLICATE_EMAIL'
        },
    },
}
let APP_CONSTANTS = {
    Path     : Path,
    userType : userType,
    STATUS_MSG: STATUS_MSG
};

module.exports = APP_CONSTANTS;

