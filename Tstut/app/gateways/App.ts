import * as express from 'express';
import {UserRouter} from './UserRouter';
import {RedisRouter} from './RedisRouter';
import {AuthenticationRouter} from "./AuthenticationRouter";

var cors = require('cors');

let path = require('path')
//aquire body parser
const bodyparser=require('body-parser');
const app:express.Application=express();

// import {socketserver} from "../services/SocketService";
import {scheduleJob} from "../services/ScheduleService";

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
//set cors configuration
app.all("*",function(req:express.Request,res:express.Response,next){
    res.header("Access-Controll-Allow-Origin","*");
    res.header("Access-Controll-Allow-Methods","GET,PUT,DELETE,OPTIONS,POST");
    res.header("Access-Controll-Headers",
        "Content-Type,Accept,X-Access-Token,X-Key"
    );
    if(req.method=="OPTIONS"){
        res.status(200).end();
    }else{
        next();
    }
});
app.use(cors());

app.use(AuthenticationRouter);
app.use(UserRouter);
app.use('/redis', RedisRouter);
// scheduleJob("testmessages");
app.get('/test',(req:express.Request, res: express.Response)=>{
    res.send('working '+Date());
})
app.use((error, req, res,next) => {
    res.status(error.statusCode || 500).send(error);
});
export{app};
