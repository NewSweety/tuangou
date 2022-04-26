'use strict';

const Router = require('koa-router');
const groupon = require('../controllers/groupon');

const router = new Router();

router
  .get('/groupon', groupon.processExcel)
  .get('/sp', groupon.getSp)
  .post('/order', groupon.modifyOrder)
  .get('/ld', groupon.getLd)
  .get('/login', groupon.validateToken);

exports = module.exports = router;
