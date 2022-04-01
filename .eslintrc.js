module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'standard'
  ],
  // parser: '@babel/eslint-parser', // vue-eslint和babel-parser二者有冲突。编译器配置在根节点会导致vue sfc模式eslint报错
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true
    }
  },
  plugins: [
    'vue'
  ],
  rules: {
    // promise强制要求reject()抛出error【禁止】
    'prefer-promise-reject-errors': 'off',
    // vue 组件要求定义name【禁止】
    'vue/multi-word-component-names': ['off', {}]
  }
}
