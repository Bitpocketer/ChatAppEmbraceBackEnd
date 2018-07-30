let connectionString = process.env.DATABASE_URL;
let databasePassword = process.env.DATABASE_PASS;
import * as Bookshelf from 'bookshelf';
// var knex = require('knex')({
//     client: 'mysql',
//     version: '5.6',
//     connection: {
//         host: 'localhost',
//         port: '3306',
//         user: 'root',
//         password: 'root',
//         database: 'chatter',
//         charset: 'utf8'
//     },
//     debug: true
// });
export var knex = require('knex')({
    client: 'pg',
    connection: connectionString,
    searchPath: ['knex', 'public'],
});