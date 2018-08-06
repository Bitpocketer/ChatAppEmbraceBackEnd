import {app} from './gateways/App';
let http = require('http');
let server = http.createServer(app)
const port:number = 3000;
server.listen( port,()=>{ console.log('server runing on port '+port)});

