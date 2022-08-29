module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'standard-with-typescript'
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    'vue'
  ],
  rules: {
    'vue/multi-word-component-names': ['off', {}],
    '@typescript-eslint/no-unused-vars': ['off']
  }
}
