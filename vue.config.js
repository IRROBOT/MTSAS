let path = require("path");
let webpack = require("webpack");
function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  //代理--解决跨域问题
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          "^/api": "/api",
        },
      },
    },
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set("@", resolve("src"))
      .set("vue", resolve("./node_modules/vue"));
  },
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        "window.Quill": "quill/dist/quill.js",
        Quill: "quill/dist/quill.js",
      }),
      new webpack.DefinePlugin({
        // 定义全局变量
        "global.env": {
          SERVER_BASE: JSON.stringify("http://localhost:3000"),
          DOMAIN_NAME: JSON.stringify("http://localhost:8080"),
        },
      }),
    ],
  },
  lintOnSave:false
};
