const path = require('path')
module.exports = {
  css: {
    extract: false  // 样式内联js
  },
  outputDir: path.resolve(__dirname, './lib'),
  configureWebpack: {
    output: {
      filename: 'el-validate-table.min.js',
      library: 'el-validate-table',
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
  },
  chainWebpack: config => {
    config.module
      .rule('js')
      .include
      .add('/packages')
      .end()
      .use('babel')
      .loader('babel-loader')
      .tap(options => {
        return options
      })
  },
  productionSourceMap:false
}