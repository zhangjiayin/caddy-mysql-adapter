const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  /**
  app.use(
    createProxyMiddleware("/metrics", {
      target: "http://localhost:2019",
      changeOrigin: true,
      headers: {
        host: "localhost:2019",
        origin: null,
      },
      secure: false,
      onProxyReq: function (proxyReq, req, res) {
        proxyReq.setHeader("accept-encoding", "identity");
        proxyReq.setHeader("connection", "keep-alive");
        proxyReq.setHeader("referer", "");
        console.log(proxyReq);
      },
      onProxyRes: function (onProxyRes, req, res) {
        // console.log(res);
      },

      //   ws: true,
      pathRewrite: {
        // "^/metrics": "/config",
      },
    })
  );
  */
};
