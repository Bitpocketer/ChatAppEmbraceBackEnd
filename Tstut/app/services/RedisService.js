"use strict";
exports.__esModule = true;
var redis = require('redis');
var RedisService = /** @class */ (function () {
    function RedisService() {
        this.client = redis.createClient();
    }
    RedisService.prototype.visitCounter = function () {
        return this.client.lpushAsync('somelist', 1).then(function (res) {
            return;
        })["catch"](function (e) { return console.log(e); });
    };
    return RedisService;
}());
exports.RedisService = RedisService;
