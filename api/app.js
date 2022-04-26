'use strict';

const koa = require('koa');
const koaBody = require('koa-body');
const cors = require('koa2-cors');
const logger = require('koa-logger');
const router = require('./router');
require('./db');

const app = new koa();

app.use(logger());

app.use(
  koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 60 * 1024 * 1024
    }
  })
);

app.use(cors());

app.use(router.routes()).use(router.allowedMethods());

app.listen(8081, () => {
  console.log('The api is running at port: 80');
});
