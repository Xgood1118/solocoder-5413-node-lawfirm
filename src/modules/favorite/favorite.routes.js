const express = require('express');
const router = express.Router();
const favoriteService = require('./favorite.service');

router.get('/user/:userId', (req, res) => {
  const favorites = favoriteService.getUserFavorites(req.params.userId);
  res.json({ success: true, data: favorites });
});

router.get('/check', (req, res) => {
  const { userId, articleId } = req.query;
  const isFav = favoriteService.isFavorited(userId, articleId);
  res.json({ success: true, data: { isFavorited: isFav } });
});

router.post('/', (req, res) => {
  const { userId, articleId } = req.body;
  if (!userId || !articleId) {
    return res.status(400).json({ success: false, message: '用户ID和文章ID不能为空' });
  }
  const favorite = favoriteService.addFavorite(userId, articleId);
  res.status(201).json({ success: true, data: favorite });
});

router.delete('/', (req, res) => {
  const { userId, articleId } = req.body;
  const deleted = favoriteService.removeFavorite(userId, articleId);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '收藏不存在' });
  }
  res.json({ success: true, message: '取消收藏成功' });
});

router.get('/article/:articleId/count', (req, res) => {
  const count = favoriteService.getFavoriteCountByArticle(req.params.articleId);
  res.json({ success: true, data: { count } });
});

module.exports = router;
