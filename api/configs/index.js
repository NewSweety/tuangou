'use strict';

const fs = require('fs');

let config = {
  database: {
    DBTYPE: 'mysql',
    DBNAME: 'application',
    DBUSER: 'root',
    DBPASS: 'uh5p@5VE!BKxgk@h%am73!',
    DBHOST: '100.110.194.12',
    // DBHOST: 'localhost',
    DBPORT: '3360'
  },
  responseCode: {
    success: 0,
    internalError: 2,
    notFoundError: 3,
    formatError: 4,
    passwordError: 5
  },
  token: 'admin'
};

exports = module.exports = config;
