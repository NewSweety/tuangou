'use strict';

const fs = require('fs');

let config = {
  database: {
    DBTYPE: 'mysql',
    DBNAME: 'application',
    DBUSER: 'root',
    DBPASS: 'uh5p@5VE!BKxgk@h%am73!',
    DBHOST: '100.99.128.84',
    DBPORT: '3360'
    // DBPASS: 'root',
    // DBHOST: '10.0.0.184',
    // DBPORT: '3306'
  },
  responseCode: {
    success: 0,
    internalError: 2,
    notFoundError: 3,
    formatError: 4,
    passwordError: 5
  }
};

exports = module.exports = config;
