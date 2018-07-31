'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable("conversation", {
    "id": {type: 'int', primaryKey:true},
    "user_one": {type: 'integer REFERENCES chatusers'},
    "user_two": {type: 'integer REFERENCES chatusers'},
    "ip": 'string',
    "time": {type: 'datetime'}
  })
};

exports.down = function(db) {
  return db.dropTable("conversation");
};

exports._meta = {
  "version": 1
};
