const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/metrics",
    createProxyMiddleware({
      target: "http://127.0.0.1:2019",
      changeOrigin: true,
      logLevel: "debug",
      secure: false,
      onError: function () {
        console.log(arguments);
      },
      headers: { Connection: "keep-alive" },
      bypass: function (req, res, proxyOptions) {
        console.log("====");
      },
      pathRewrite: {
        // "^/api": "",
      },
    })
  );
};
