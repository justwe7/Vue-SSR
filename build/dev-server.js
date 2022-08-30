const Webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackConfig = require('./webpack.dev.js')
/* const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();
const compiler = Webpack(smp.wrap(webpackConfig)) */

const compiler = Webpack(webpackConfig)
const devServerOptions = { ...webpackConfig.devServer }
const server = new WebpackDevServer(devServerOptions, compiler)

const runServer = async () => {
  console.log('Starting server...')
  await server.start();
};

runServer()
