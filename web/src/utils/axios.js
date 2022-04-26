import axios from 'axios';

/* global runConfig */
const service = axios.create({
  timeout: 300000, // request timeout
  baseURL: `${runConfig.apiurl}`,
});

export default service;
