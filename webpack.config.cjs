const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    filename: 'gazpar-card.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: ''
  },
  module: {
    rules: [
     {
       test: /\.(png|svg|jpg|jpeg|gif)$/i,
       type: 'asset/inline',
     },
    ],
  },  
  resolve: {
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules']
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version),
      COMPATIBLE_INTEGRATION_VERSION: JSON.stringify(require("./package.json").compatibleIntegrationVersion),
    }),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      inject: false
    })
  ],
  performance: {
    maxAssetSize: 400000,
    maxEntrypointSize: 400000,
  },
};
