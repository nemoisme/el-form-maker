const base = require('./webpack.config.base')
const merge = require('webpack-merge')
const path = require('path')

module.exports = merge(base, {
  mode: process.env.NODE_ENV,
  entry: {
    path:path.join(__dirname, './../packages/index.js')
  },
  output: {
    path: path.resolve(__dirname, './../lib'),
    filename: 'el-form-maker.js',
    library: 'el-form-maker',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
})