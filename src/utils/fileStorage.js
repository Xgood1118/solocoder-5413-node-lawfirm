const fs = require('fs');
const path = require('path');
const config = require('../config');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getArticleDir(articleId) {
  return path.join(config.articlesDir, articleId);
}

function getArticleContentPath(articleId) {
  return path.join(getArticleDir(articleId), 'content.md');
}

function getArticleAttachmentsDir(articleId) {
  const dir = path.join(getArticleDir(articleId), 'attachments');
  ensureDir(dir);
  return dir;
}

function getVersionDir(articleId, versionId) {
  return path.join(config.versionsDir, articleId, versionId);
}

function getVersionContentPath(articleId, versionId) {
  return path.join(getVersionDir(articleId, versionId), 'content.md');
}

function readArticleContent(articleId) {
  const contentPath = getArticleContentPath(articleId);
  if (fs.existsSync(contentPath)) {
    return fs.readFileSync(contentPath, 'utf-8');
  }
  return '';
}

function writeArticleContent(articleId, content) {
  const articleDir = getArticleDir(articleId);
  ensureDir(articleDir);
  const contentPath = getArticleContentPath(articleId);
  fs.writeFileSync(contentPath, content, 'utf-8');
  return true;
}

function saveVersion(articleId, versionId, content) {
  const versionDir = getVersionDir(articleId, versionId);
  ensureDir(versionDir);
  const contentPath = getVersionContentPath(articleId, versionId);
  fs.writeFileSync(contentPath, content, 'utf-8');
  return true;
}

function readVersion(articleId, versionId) {
  const contentPath = getVersionContentPath(articleId, versionId);
  if (fs.existsSync(contentPath)) {
    return fs.readFileSync(contentPath, 'utf-8');
  }
  return '';
}

function listVersions(articleId) {
  const articleVersionDir = path.join(config.versionsDir, articleId);
  if (fs.existsSync(articleVersionDir)) {
    return fs.readdirSync(articleVersionDir).filter((f) => {
      const stat = fs.statSync(path.join(articleVersionDir, f));
      return stat.isDirectory();
    });
  }
  return [];
}

function saveAttachment(articleId, filename, buffer) {
  const attachmentsDir = getArticleAttachmentsDir(articleId);
  const filePath = path.join(attachmentsDir, filename);
  fs.writeFileSync(filePath, buffer);
  return filename;
}

function getAttachment(articleId, filename) {
  const filePath = path.join(getArticleAttachmentsDir(articleId), filename);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath);
  }
  return null;
}

module.exports = {
  ensureDir,
  getArticleDir,
  getArticleContentPath,
  getArticleAttachmentsDir,
  readArticleContent,
  writeArticleContent,
  saveVersion,
  readVersion,
  listVersions,
  saveAttachment,
  getAttachment,
};
