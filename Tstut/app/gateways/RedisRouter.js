"use strict";
exports.__esModule = true;
var express_1 = require("express");
var RedisService_1 = require("../services/RedisService");
exports.RedisRouter = express_1.Router();
exports.RedisRouter.post('/incrementvisit', function (req, res, next) {
    try {
        console.log('request in Redisrouter recieved');
        res.send(new RedisService_1.RedisService().visitCounter());
    }
    catch (error) {
        next(error);
    }
});
exports.RedisRouter.get('/redistest', function (req, res, next) {
    console.log('redistest recieved');
    res.send('redis test okay');
});
