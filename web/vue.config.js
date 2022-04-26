module.exports = {
  devServer: {
    host: "0.0.0.0",
    port: '8084',
    compress: true,
    proxy: {
      '/api': {
        // target: 'http://192.168.1.129',
        target: 'http://10.0.0.184:80',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/api': '/api',
        },
      },
    },
  },
  // 在exports中添加，这里很关键，不配置不行
  transpileDependencies: ['element-ui'],

  chainWebpack(config) {
    // 在chainWebpack中添加下面的代码
    config.entry('main').add('babel-polyfill'); // main是入口js文件
  },
};
