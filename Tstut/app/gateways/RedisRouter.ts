import {Router, Request, Response, NextFunction} from 'express';
import {RedisService} from '../services/RedisService';

let rs = new RedisService();
let RedisRouter = Router();


RedisRouter.get('/redistest', (req: Request, res: Response, next: NextFunction) => {
    console.log('redistest recieved');
    res.send('redis test okay');
});



RedisRouter.get('/deletemessages', async(req: Request, res: Response, next: NextFunction)=>{
    try {
        res.json(new RedisService().removeMessagesFromRedis().then(res=>{ return res})).status(200);
    } catch (error) {
        next(error)
    }
})



RedisRouter.delete('/deletechatters', async (req: Request, res: Response, next: NextFunction)=>{
    try {
        console.log('hogia');
        res.json(new RedisService().removeChattersFromRedis().then((res)=>{return res;})).status(200);
    }
    catch(error) {
        res.send(error).status(500)
    }
})

export {RedisRouter};


