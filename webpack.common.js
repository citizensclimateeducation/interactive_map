const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
   template: './src/index.html',
   filename: 'index.html',
   inject: 'body'
 });

module.exports = {
   entry: './src/main.js',
   output: {
       path: path.resolve(__dirname, 'build'),
       filename: 'main.bundle.js'
   },
  module: {
   rules: [
         { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
         { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
         { test: /\.scss$/, loader: 'style-loader!css-loader!sass-loader' },
         { test: /\.css$/, loader: 'style-loader!css-loader?importLoaders=1' },
         { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
         { test: /\.ico$/, loader: 'file-loader?name=[name].[ext]' }
      ],
   },

   plugins: [HtmlWebpackPluginConfig]
};