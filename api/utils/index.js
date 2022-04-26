'use strict';

const config = require('../configs');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

/**
 * 设置http响应信息
 * @param {*} ctx http上下文
 * @param {*} statusCode http status code
 * @param {*} responseCode 响应码
 * @param {*} responseDesc 响应信息
 * @param {*} resultDate 返回数据
 */
function setHttpResponse(
  ctx,
  statusCode,
  responseCode,
  responseDesc,
  resultDate
) {
  ctx.response.status = statusCode;
  ctx.body = {
    responseCode: responseCode,
    responseDesc: responseDesc
  };
  Object.assign(ctx.body, resultDate);
}

exports = module.exports = {
  setHttpResponse
};
