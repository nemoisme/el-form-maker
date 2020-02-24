const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin');
module.exports = {
  mode: 'development',
  entry: {
    main: path.resolve(__dirname, '../src/main.js')
  },
  output: {
    filename: '[name].[hash:8].js',
    path: path.resolve(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: ['vue-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        use: ['file-loader']
      },
      {
        test: /\.js$/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader', {
          loader: 'postcss-loader',
          options: {
            plugins: [require('autoprefixer')]
          }
        }]
      },
      {
        test: /\.less$/,
        use: ['vue-style-loader', 'css-loader', {
          loader: 'postcss-loader',
          options: {
            plugins: [require('autoprefixer')]
          }
        }, 'less-loader']
      }

    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './../src/index.html'),
      filename: 'index.html'
    }),
    new VueLoaderPlugin()
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js',
      '@': path.resolve(__dirname, '../src')
    },
    extensions: ['*', '.js', '.json', '.vue']
  },
  devServer: {
    port: 3000,
    hot: true,
    contentBase: '../dist'
  }
}