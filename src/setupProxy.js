const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/relayer',
    createProxyMiddleware({
      target: 'https://relayer.testnet.zama.cloud',
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        '^/relayer': '' // baştaki /relayer kısmını kaldır
      }
    })
  );
};