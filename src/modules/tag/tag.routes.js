const express = require('express');
const router = express.Router();
const tagService = require('./tag.service');

router.get('/', (req, res) => {
  const { level, tree } = req.query;
  if (tree === 'true') {
    const tagTree = tagService.getTagTree();
    return res.json({ success: true, data: tagTree });
  }
  if (level) {
    const tags = tagService.getTagsByLevel(parseInt(level));
    return res.json({ success: true, data: tags });
  }
  const tags = tagService.getAllTags();
  res.json({ success: true, data: tags });
});

router.get('/:id', (req, res) => {
  const tag = tagService.getTagById(req.params.id);
  if (!tag) {
    return res.status(404).json({ success: false, message: '标签不存在' });
  }
  res.json({ success: true, data: tag });
});

router.get('/:id/path', (req, res) => {
  const path = tagService.getTagPath(req.params.id);
  res.json({ success: true, data: path });
});

router.get('/:id/children', (req, res) => {
  const children = tagService.getChildTags(req.params.id);
  res.json({ success: true, data: children });
});

router.post('/', (req, res) => {
  try {
    const tag = tagService.createTag(req.body);
    res.status(201).json({ success: true, data: tag });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.put('/:id', (req, res) => {
  const tag = tagService.updateTag(req.params.id, req.body);
  if (!tag) {
    return res.status(404).json({ success: false, message: '标签不存在' });
  }
  res.json({ success: true, data: tag });
});

router.delete('/:id', (req, res) => {
  const deleted = tagService.deleteTag(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '标签不存在' });
  }
  res.json({ success: true, message: '删除成功' });
});

router.post('/merge', (req, res) => {
  const { tagIds, targetLevel } = req.body;
  const merged = tagService.mergeTagsByLevel(tagIds, targetLevel);
  res.json({ success: true, data: merged });
});

module.exports = router;
