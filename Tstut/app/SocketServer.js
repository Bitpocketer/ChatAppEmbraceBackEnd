"use strict";
exports.__esModule = true;
var http = require('http');
var express = require("express");
var app = express();
var router = express.Router();
var bodyparser = require('body-parser');
var socket = require('socket.io');
var cors = require('cors');
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
app.use(cors());
router.get('/test', function (req, res) {
    console.log('request recieved in socket server');
    res.send('socketserver is runing');
});
app.use('/test', router);
exports.server = http.createServer(app);
var io = require('socket.io')(exports.server);
var publicroom = io.of('/public');
require('./services/SocketService')(publicroom);
exports.server.listen(4000, function () {
    console.log('socket server listening on ' + 4000);
});
