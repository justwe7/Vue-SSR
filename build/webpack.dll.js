const webpack = require('webpack')
const { resolve } = require('./utils')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  context: __dirname,
  mode: 'production',
  entry: {
    // vue_lib: [
    // ],
    common_lib: [
      'vue',
      'vue-router',
      'vuex',
      'vuex-router-sync',
      'axios',
      'lodash'
    ]
  },
  output: {
    path: resolve('../public/dll/'),
    filename: '[name].dll.js',
    library: '[name]_dll'
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: resolve('../public/dll')
    }),
    new webpack.DllPlugin({
      path: resolve('../public/dll/', '[name].dll.manifest.json'),
      name: '[name]_dll'
    })
  ]
};
