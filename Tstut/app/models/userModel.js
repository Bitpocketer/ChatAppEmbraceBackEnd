"use strict";
exports.__esModule = true;
var knex_1 = require("../helpers/database/knex");
var bcrypt = require("bcrypt-nodejs");
;
var User = /** @class */ (function () {
    function User() {
    }
    User.getusers = function () {
        var user = knex_1.knex.select('*').from('users');
        // console.log('fetched users',user);
        return user;
    };
    //function to create new user
    User.create = function (first_name, last_name, email, password) {
        var user = new User();
        user.first_name = first_name;
        user.last_name = last_name;
        user.email = email;
        user.password = hash(password);
        return user;
    };
    return User;
}());
exports.User = User;
function hash(password) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}
