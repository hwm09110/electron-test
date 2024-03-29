'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const MinifyPlugin = require('babel-minify-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

let mainConfig = {
  devtool: 'eval-cheap-module-source-map',
  entry: {
    main: path.join(__dirname, '../src/main/index.js'),
  },
  // externals: [...Object.keys(dependencies || {})],
  module: {
    rules: [
      // {
      //   test: /\.(js)$/,
      //   enforce: 'pre',
      //   exclude: /node_modules/,
      //   use: {
      //     loader: 'eslint-loader',
      //     options: {
      //       formatter: require('eslint-friendly-formatter'),
      //     },
      //   },
      // },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            // presets: [['@babel/preset-env', { targets: 'defaults' }]],
            presets: [['@babel/preset-env', { targets: { node: 7 } }]],
          },
        },
        // exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
    ],
  },
  node: {
    // __dirname: process.env.NODE_ENV !== 'production',
    // __filename: process.env.NODE_ENV !== 'production',
    __dirname: false,
    __filename: false,
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/main'),
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, '../src/main/preload.js'),
        to: path.join(__dirname, '../dist/main/preload.js'),
      },
    ]),
  ],
  resolve: {
    extensions: ['.js', '.json', '.node'],
  },
  target: 'electron-main',
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`,
    }),
  )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(
    new MinifyPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
  )
}

module.exports = mainConfig
