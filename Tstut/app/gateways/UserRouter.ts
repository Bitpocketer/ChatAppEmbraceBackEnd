import {Request, Response, NextFunction, Router} from 'express';
import {User} from '../models/userModel';
import {UserOrmModel} from '../orms/UserOrmModel';
import {isAliasAvailable} from "../services/AuthorizationService";
import * as UserService from '../services/UserService';

export const UserRouter:Router = Router();

UserRouter.post('/api/create', isAliasAvailable(), async(req: Request, res: Response, next: NextFunction) => {
    try{
        // res.send(User.create(req.body.name, req.body.email, req.body.password));
        let user = User.create(req.body.name, req.body.email, req.body.password);

        res.send(await new UserOrmModel(user).save().then( UserChatter=> {
            let u = User.fromDb(UserChatter.toJSON());
            console.log('returning from router', u);
        return User.fromDb(UserChatter.toJSON())
        }));

    } catch (error) {
        console.log(`i'm sleepy `,error);
        next(error);
    }
});

UserRouter.get('/api/userconversation/:alias', async (req: Request, res: Response , next: NextFunction ) => {
    try {

        console.log('in route', req.params);
        console.log('returning userconversations', await UserService.getUserConversations(req.params.alias));
        res.json(await UserService.getUserConversations(req.params.alias)).status(200);
    } catch(error) {
        res.send(error).status(400);
    }
});

UserRouter.post('/api/userconversationsfromredis', async (req: Request, res: Response, next: NextFunction) => {
    console.log('redis userconversation req.body',req.body);
    //send response from redis, if redis has no current conversation record of this user, fetch from database
    try {

        let userOfflineMessages = await UserService.getUserOfflineMessages(req.body.alias);

        if(userOfflineMessages.length!=0) {
            // console.log('userOfflinemessages from redis', userOfflineMessages);
            // console.log('redisconversation found');
            res.json(userOfflineMessages).status(200);
        }
        else {
            console.log('redis conversation not found, requesting database')
        res.json(await UserService.getUserConversations(req.body.alias)).status(200);
        }


    } catch (error) {
        res.send(error).status(400);
    }
})

UserRouter.post('/api/getmessages', async(req: Request, res: Response, next: NextFunction)=>{
    // console.log('alias in req.body', req.body.alias);
    // console.log('recipient in req.body', req.body.recipient);
    res.json(await UserService.getMessages(req.body.alias, req.body.recipient))
})


UserRouter.get('/test', (req: Request, res: Response, next: NextFunction) => {
    console.log('request in test received');
    res.status(200).send(Date());
});

UserRouter.post('/guest', (req: Request, res: Response, next: NextFunction) => {
    console.log('guest reqbody ', req);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, x-auth");
    res.json('sending nick back from server ' +req.body.name)
})



