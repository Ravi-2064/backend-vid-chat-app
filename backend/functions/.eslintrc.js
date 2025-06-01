module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2018,
  },
  extends: [
    "eslint:recommended",
  ],
  rules: {
    "linebreak-style": "off",
    "indent": ["error", 2],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "object-curly-spacing": ["error", "always"],
    "max-len": ["error", { "code": 100 }],
    "comma-dangle": ["error", "always-multiline"],
    "no-unused-vars": ["warn"],
    "no-trailing-spaces": "error",
    "eol-last": "error",
    "space-before-function-paren": ["error", "never"],
    "new-cap": "off",
    "no-useless-catch": "off",
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
