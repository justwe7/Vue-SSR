module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'standard'
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    // promise强制要求reject()抛出error【禁止】
    'prefer-promise-reject-errors': 'off',
    // vue 组件要求定义name【禁止】
    'vue/multi-word-component-names': ['off', {}],
    // 箭头函数保护符() 【作为回调必要时】https://eslint.org/docs/rules/arrow-parens#arrow-parens
    'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }]
  }
}
