"use strict";
exports.__esModule = true;
var knex = require('knex')({
    client: 'pg',
    connection: process.env.DATABASE_URL,
    //   connection: {
    //       host : 'localhost',
    //       user : 'postgres',
    //       password : 'postgres',
    //       database : 'postgres'
    //   },
    searchPath: ['knex', 'public']
});
exports.knex = knex;
