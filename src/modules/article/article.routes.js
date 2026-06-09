const express = require('express');
const router = express.Router();
const articleService = require('./article.service');
const viewService = require('../view/view.service');

router.get('/', (req, res) => {
  const { type, authorId, page = 1, pageSize = 20 } = req.query;
  let articles = articleService.getAllArticles();

  if (type) articles = articles.filter((a) => a.type === type);
  if (authorId) articles = articles.filter((a) => a.authorId === authorId);

  const start = (page - 1) * pageSize;
  const end = start + parseInt(pageSize);
  const paginated = articles.slice(start, end);

  res.json({
    success: true,
    data: paginated,
    total: articles.length,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  });
});

router.get('/pinned', (req, res) => {
  const articles = articleService.getPinnedArticles();
  res.json({ success: true, data: articles });
});

router.get('/ranking/weekly', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const ranking = articleService.getWeeklyRanking(limit);
  res.json({ success: true, data: ranking });
});

router.get('/ranking/monthly', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const ranking = articleService.getMonthlyRanking(limit);
  res.json({ success: true, data: ranking });
});

router.get('/ranking/rookie', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const ranking = articleService.getRookieRanking(limit);
  res.json({ success: true, data: ranking });
});

router.get('/pins', (req, res) => {
  const { status } = req.query;
  const pins = articleService.getPinsByStatus(status);
  res.json({ success: true, data: pins });
});

router.get('/:id', (req, res) => {
  const { withContent, userId } = req.query;
  let article;
  if (withContent === 'true') {
    article = articleService.getArticleWithContent(req.params.id);
  } else {
    article = articleService.getArticleById(req.params.id);
  }

  if (!article) {
    return res.status(404).json({ success: false, message: '文章不存在' });
  }

  if (userId) {
    viewService.recordView(userId, req.params.id);
    articleService.incrementViews(req.params.id);
    if (withContent === 'true') {
      article = articleService.getArticleWithContent(req.params.id);
    } else {
      article = articleService.getArticleById(req.params.id);
    }
  }

  res.json({ success: true, data: article });
});

router.get('/:id/versions', (req, res) => {
  const versions = articleService.getArticleVersions(req.params.id);
  res.json({ success: true, data: versions });
});

router.get('/:id/versions/:versionId', (req, res) => {
  const content = articleService.getArticleVersionContent(req.params.id, req.params.versionId);
  res.json({ success: true, data: { content } });
});

router.post('/', (req, res) => {
  try {
    const article = articleService.createArticle(req.body);
    res.status(201).json({ success: true, data: article });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.put('/:id', (req, res) => {
  const article = articleService.updateArticle(req.params.id, req.body);
  if (!article) {
    return res.status(404).json({ success: false, message: '文章不存在' });
  }
  res.json({ success: true, data: article });
});

router.delete('/:id', (req, res) => {
  const deleted = articleService.deleteArticle(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '文章不存在' });
  }
  res.json({ success: true, message: '删除成功' });
});

router.post('/:id/like', (req, res) => {
  const article = articleService.likeArticle(req.params.id);
  if (!article) {
    return res.status(404).json({ success: false, message: '文章不存在' });
  }
  res.json({ success: true, data: { likes: article.likes } });
});

router.post('/:id/pin-request', (req, res) => {
  try {
    const { userId, reason } = req.body;
    const pin = articleService.requestPin(req.params.id, userId, reason);
    res.status(201).json({ success: true, data: pin });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.post('/pins/:pinId/approve', (req, res) => {
  try {
    const { userId } = req.body;
    const pin = articleService.approvePin(req.params.pinId, userId);
    res.json({ success: true, data: pin });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.post('/pins/:pinId/reject', (req, res) => {
  try {
    const { userId, rejectReason } = req.body;
    const pin = articleService.rejectPin(req.params.pinId, userId, rejectReason);
    res.json({ success: true, data: pin });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.post('/:id/unpin', (req, res) => {
  try {
    const { userId } = req.body;
    const article = articleService.unpinArticle(req.params.id, userId);
    res.json({ success: true, data: article });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;
