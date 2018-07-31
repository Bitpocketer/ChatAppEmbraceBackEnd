import * as express from 'express';
import {UserRouter} from './gateways/UserRouter';
import {RedisRouter} from './gateways/RedisRouter';
import {AuthenticationRouter} from "./gateways/AuthenticationRouter";
import {socketserver} from "./services/SocketService";
import {scheduleJob} from "./services/ScheduleService";

var cors = require('cors');

let path = require('path')
//aquire body parser
const bodyparser=require('body-parser');
const app:express.Application=express();
const port:number= 3000;

var http = require('http');
var io = require('socket.io');
//register body parser with app
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
//before authentication
app.get('/',(req, res)=>{
    res.sendFile(path.join(__dirname ,'../build/index.html'));
})
// scheduleJob("testmessages");
app.use(AuthenticationRouter);

//Register routes with the app

app.use(UserRouter);
app.use('/redis', RedisRouter);


app.use((error, req, res,next) => {
    res.status(error.statusCode || 500).send(error);
});

let server = http.createServer(app)
socketserver(server);
server.listen(port , ()=>{ console.log('server runing on port '+port)});

export{app}
