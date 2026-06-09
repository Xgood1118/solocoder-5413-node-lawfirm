const express = require('express');
const router = express.Router();
const viewService = require('./view.service');

router.get('/user/:userId', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const views = viewService.getUserViews(req.params.userId, limit);
  res.json({ success: true, data: views });
});

router.get('/user/:userId/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const views = viewService.getRecentUniqueArticles(req.params.userId, limit);
  res.json({ success: true, data: views });
});

router.delete('/:id', (req, res) => {
  const deleted = viewService.deleteView(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '阅读记录不存在' });
  }
  res.json({ success: true, message: '删除成功' });
});

router.delete('/user/:userId/all', (req, res) => {
  viewService.clearUserViews(req.params.userId);
  res.json({ success: true, message: '已清空阅读历史' });
});

module.exports = router;
