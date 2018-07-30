"use strict";
exports.__esModule = true;
var express_1 = require("express");
//create Router object for making api endpoints
var UserRouter = express_1.Router();
exports.UserRouter = UserRouter;
//api endpoint for creating new user, taking request payload from body
// UserRouter.post('users', (req: Request, res: Response, next: NextFunction)=>{
//     try{
//         //send response from here, generate response payload from the userservice module
//         res.send( User.create(req.body));
//
//     }catch (error) {
//     next(error);
//     }
// });
UserRouter.get('/index', function (req, res, next) {
    try {
        res.status(200).sendFile('htmlfile path');
    }
    catch (error) {
        next(error);
    }
});
UserRouter.get('/test', function (req, res, next) {
    console.log('request in test received');
    res.status(200).send(Date());
});
