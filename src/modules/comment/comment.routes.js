const express = require('express');
const router = express.Router();
const commentService = require('./comment.service');

router.get('/article/:articleId', (req, res) => {
  const comments = commentService.getCommentsByArticle(req.params.articleId);
  res.json({ success: true, data: comments });
});

router.get('/:id', (req, res) => {
  const comment = commentService.getCommentById(req.params.id);
  if (!comment) {
    return res.status(404).json({ success: false, message: '评论不存在' });
  }
  res.json({ success: true, data: comment });
});

router.post('/', (req, res) => {
  try {
    const comment = commentService.createComment(req.body);
    res.status(201).json({ success: true, data: comment });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.delete('/:id', (req, res) => {
  const deleted = commentService.deleteComment(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '评论不存在' });
  }
  res.json({ success: true, message: '删除成功' });
});

router.post('/:id/like', (req, res) => {
  const comment = commentService.likeComment(req.params.id);
  if (!comment) {
    return res.status(404).json({ success: false, message: '评论不存在' });
  }
  res.json({ success: true, data: { likes: comment.likes } });
});

router.get('/notifications/user/:userId', (req, res) => {
  const notifications = commentService.getUserNotifications(req.params.userId);
  res.json({ success: true, data: notifications });
});

router.get('/notifications/user/:userId/unread-count', (req, res) => {
  const count = commentService.getUnreadNotificationCount(req.params.userId);
  res.json({ success: true, data: { count } });
});

router.post('/notifications/:id/read', (req, res) => {
  const notif = commentService.markNotificationAsRead(req.params.id);
  if (!notif) {
    return res.status(404).json({ success: false, message: '通知不存在' });
  }
  res.json({ success: true, data: notif });
});

router.post('/notifications/user/:userId/read-all', (req, res) => {
  commentService.markAllNotificationsAsRead(req.params.userId);
  res.json({ success: true, message: '已全部标记为已读' });
});

module.exports = router;
