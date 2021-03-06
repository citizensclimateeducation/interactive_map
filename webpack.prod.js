process.env.NODE_ENV = 'production';
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
module.exports = merge(common, {
   devtool: "eval",
   entry: ["babel-polyfill", "./src/main.js"],
    mode: 'production',
});