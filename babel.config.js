module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      [
        '@babel/preset-env',
        {}
      // ],
      // [
      //   "@babel/preset-typescript",
      //    {
      //        "isTSX": true, // 必须设置，否者编译tsx时会报错
      //        "allowNamespaces": true,
      //  "allExtensions": true // 必须设置，否者编译.vue 文件中ts 代码会报错
      //    }
      ]
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          absoluteRuntime: false,
          corejs: 3,
          helpers: true,
          regenerator: true
        }
      ]
    ]
  }
}
