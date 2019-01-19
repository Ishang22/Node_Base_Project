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
        }

    },
}
let APP_CONSTANTS = {
    Path     : Path,
    userType : userType,
    STATUS_MSG: STATUS_MSG
};

module.exports = APP_CONSTANTS;

