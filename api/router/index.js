'use strict';

const Router = require('koa-router');
const groupon = require('../controllers/groupon');

const router = new Router();

router
  .get('/groupon', groupon.processExcel)
  .post('/groupon_file', groupon.processExcelByFile)
  .get('/sp', groupon.getSp)
  .post('/order', groupon.modifyOrder)
  .get('/ld', groupon.getLd)
  .get('/groupon_uuid', groupon.getGrouponByUUid)
  .post('/template', groupon.getTemplate);

exports = module.exports = router;
