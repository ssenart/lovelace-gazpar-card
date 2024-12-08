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
      COMPATIBLE_GAZPAR2MQTT_VERSION: JSON.stringify(require("./package.json").compatibleGazpar2MQTTVersion),
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      filename: 'daily-chart-test.html',
      template: 'tests/daily-chart-test.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      filename: 'weekly-chart-test.html',
      template: 'tests/weekly-chart-test.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      filename: 'monthly-chart-test.html',
      template: 'tests/monthly-chart-test.html',
      inject: false
    })
    ,
    new HtmlWebpackPlugin({
      filename: 'yearly-chart-test.html',
      template: 'tests/yearly-chart-test.html',
      inject: false
    })
  ],
  performance: {
    maxAssetSize: 400000,
    maxEntrypointSize: 400000,
  },
};
