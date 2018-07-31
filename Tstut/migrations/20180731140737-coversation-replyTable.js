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
  db.createTable("conversation_reply", {
    "cr_id" :{type: "integer REFERENCES conversation"},
      "message": {type: "string"},
      "ip": {type: "string"},
      "time": {type: "datetime"},
      "status": {type: "integer"},
      "c_id": {type: "integer REFERENCES conversation"},
      "sender": {type: "string"},
      "recipient": {type: "string"}

  });
};

exports.down = function(db) {
  return db.dropTable("conversation_reply");
};

exports._meta = {
  "version": 1
};
