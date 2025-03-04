module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential',
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
      "vue/no-use-v-if-with-v-for": "off"
  },
  overrides: [
    {
         files: ['*'],
         rules: {
          'vue/no-mutating-props': 'off', //Disable rule only for vue files
          'vue/comment-directive': 'off',
         }
     }
 ]
}
