const packageJson = require("./package.json");

const devDependencies = Object.keys(packageJson.devDependencies || {});

module.exports = {
  settings: {
    node: {
      allowModules: devDependencies,
      resolvePaths: [__dirname],
      tryExtensions: [".js", ".ts", ".json", ".node"],
    },
  },
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "standard",
    "plugin:prettier/recommended",
    "plugin:node/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "node/no-unsupported-features/es-syntax": [
      "error",
      { ignores: ["modules"] },
    ],
    "prettier/prettier": "error",
    "spaced-comment": "off",
    // "no-console": "warn",
    "consistent-return": "off",
    "func-names": "off",
    "object-shorthand": "off",
    "no-process-exit": "off",
    "no-param-reassign": "off",
    "no-return-await": "off",
    "no-underscore-dangle": "off",
    "class-methods-use-this": "off",
    "prefer-destructuring": ["error", { object: true, array: false }],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "req|res|next|val" },
    ],
    "node/no-unpublished-require": "off",
    "node/no-missing-require": "error",
  },
};
