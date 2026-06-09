require('dotenv').config();
const path = require('path');

const config = {
  port: process.env.PORT || 3000,
  articlesDir: path.resolve(process.env.ARTICLES_DIR || './data/articles'),
  versionsDir: path.resolve(process.env.VERSIONS_DIR || './data/versions'),
  exportDir: path.resolve(process.env.EXPORT_DIR || './data/exports'),
  lawFirmName: '明光律师事务所',
};

module.exports = config;
