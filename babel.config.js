module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      [
        '@babel/preset-env',
        {}
      ]
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          'absoluteRuntime': false,
          'corejs': 3,
          'helpers': true,
          'regenerator': true
        }
      ]
    ]
  }
}
