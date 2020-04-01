const base = require('./webpack.config.base')
const merge = require('webpack-merge')
const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = merge(base, {
  mode: process.env.NODE_ENV,
  //输入
  entry: {
    path: path.join(__dirname, '../examples/index.js'),
  },
  //输出
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'bundle.js'
  },
  devServer: {
    port: 3000,
    host: '127.0.0.1',
    open: true,
    hot: true,
    overlay: { erros: true }
  },
  module: {},
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: 'body',
      minify: {
        removeComments: true
      }
    })
  ]
})