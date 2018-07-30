import {Router,Request, Response, NextFunction}  from 'express';
import * as AuthenticationService from '../services/AuthenticationService';

let AuthenticationRouter = Router();

AuthenticationRouter.post('/api/authenticate', async(req: Request, res: Response, next: NextFunction) => {
    try{
        let toke = await AuthenticationService.authenticate(req.body.name, req.body.password);
        let token = {token:toke, name:req.body.name}
        res.json(token).status(200);
    } catch(error) {
        console.log('this is error', error);
        next(error);
    }
});
AuthenticationRouter.get('/api/test', (req: Request, res: Response, next: NextFunction)=> {
    console.log('request reached here');
    res.send('working perfectly ' + Date());
});

export {AuthenticationRouter}