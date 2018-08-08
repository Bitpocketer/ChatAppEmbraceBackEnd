let http = require('http');
import * as express from  'express';
let app: express.Application = express();
let router: express.Router = express.Router();
let bodyparser = require('body-parser');
let socket = require('socket.io');


var cors = require('cors');
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

router.get('/test', (req: express.Request, res: express.Response)=>{
    console.log('request recieved in socket server');
    res.send('socketserver is runing');
})


app.use('/test',router);
app.use((error, req, res, next)=>{
    res.status(error.statusCode || 500).send(error)
})
export let server = http.createServer(app);
let io = require('socket.io')(server);

require('./services/SocketService')(io);
server.listen(4000,()=>{
    console.log('socket server listening on '+4000);
})
