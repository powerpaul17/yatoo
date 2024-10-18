const path = require('path');

const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DefinePlugin = require('webpack').DefinePlugin;
const WorkboxPlugin = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const devMode = process.env.NODE_ENV !== 'production';

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: './src/main.ts',
  mode: devMode ? 'development' : 'production',
  devtool: devMode ? 'eval' : false,
  devServer: {
    static: './dist',
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: true
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/i,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    moduleIds: 'deterministic'
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
    ...(devMode ? [] : [new MiniCssExtractPlugin()]),
    new DefinePlugin({
      COMMIT_HASH: JSON.stringify(process.env.COMMIT_HASH),
      VERSION: JSON.stringify(process.env.VERSION),
      'process.env.TEST': JSON.stringify(process.env.TEST),
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: '*', context: path.resolve(__dirname, 'icons/favicons') }
      ]
    })
  ]
};
