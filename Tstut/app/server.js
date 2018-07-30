"use strict";
exports.__esModule = true;
var express = require("express");
var UserRouter_1 = require("./gateways/UserRouter");
var RedisRouter_1 = require("./gateways/RedisRouter");
//aquire body parser
var bodyparser = require('body-parser');
var app = express();
var port = 3000;
//register body parser with app
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
//set cors configuration
app.all("*", function (req, res, next) {
    res.header("Access-Controll-Allow-Origin", "*");
    res.header("Access-Controll-Allow-Methods", "GET,PUT,DELETE,OPTIONS,POST");
    res.header("Access-Controll-Headers", "Content-Type,Accept,X-Access-Token,X-Key");
    if (req.method == "OPTIONS") {
        res.status(200).end();
    }
    else {
        next();
    }
});
//Register routes with the app
// app.use('/',dateController);
app.use('/api', UserRouter_1.UserRouter);
app.use('/redis', RedisRouter_1.RedisRouter);
// UserRouter.get('/test', (req:express.Request, res:express.Response) => { res.send('working fine')})
app.listen(port, function () {
    console.log('listeningss at app http://localhost: ' + port);
});
