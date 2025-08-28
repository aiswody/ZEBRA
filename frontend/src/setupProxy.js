const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // '/api'로 시작하는 모든 요청을 Django 서버로 전달
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000', // Django 서버 주소
      changeOrigin: true,
    })
  );
  // '/chatbot'으로 시작하는 모든 요청을 Django 서버로 전달
  app.use(
    '/chatbot',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000', // Django 서버 주소
      changeOrigin: true,
    })
  );
};