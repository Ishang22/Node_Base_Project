let  appConstant = require('../Config/appConstant'),
     controller  = require('../Controller');



function setPathOfRequest(dataToSend,pathname) {

    pathname= pathname.split('/');

    if(pathname[1]===appConstant.Path.USER)
    {
        return  controller.userController[pathname[2]]();
    }
    else if(pathname[1]===appConstant.Path.ADMIN)
    {
        return  controller.adminController[pathname[2]](dataToSend);
    }

};


module.exports={
    setPathOfRequest: setPathOfRequest,
};