process.env.NODE_ENV = 'development';
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
module.exports = merge(common, {
    mode: 'development',
    devServer: {
        inline: true,
        contentBase: __dirname + '/build',
        port: 3000
    },
});