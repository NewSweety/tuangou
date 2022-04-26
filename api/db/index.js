'use strict';

const sequelize = require('sequelize');
const fs = require('fs');
const config = require('../configs');

console.log('init sequelize...');

const sequelizeIns = new sequelize(
  config.database.DBNAME,
  config.database.DBUSER,
  config.database.DBPASS,
  {
    // dialect: config.database.DBTYPE,
    dialect: 'mysql',
    host: config.database.DBHOST,
    port: config.database.DBPORT,
    directory: false,
    additional: {
      timestamps: false
    },
    define: {
      timestamps: false
    },
    dialectOptions: {
      charset: 'utf8mb4'
    },
    timezone: '+08:00',
    isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
    // logging: console.log,
    logging: false,
    pool: {
      max: 1000,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const files = fs.readdirSync(__dirname + '/models');
const jsFiles = files.filter((f) => {
  return f.endsWith('.js');
}, files);

module.exports = {};

for (const f of jsFiles) {
  console.log(`import model from file ${f}...`);
  const name = f.substring(0, f.length - 3);
  module.exports[name] = require(__dirname + '/models/' + f)(
    sequelizeIns,
    sequelize
  );
}

module.exports['sequelizeIns'] = sequelizeIns;
