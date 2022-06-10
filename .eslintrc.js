const parser = "babel-eslint";

module.exports = {
  root: true,
  parserOptions: {
    sourceType: "module",
    allowImportExportEverywhere: true,
    parser
  },
  extends: "./node_modules/alaya-js-linters/index.js"
};
