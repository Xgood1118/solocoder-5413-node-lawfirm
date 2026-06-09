const express = require('express');
const router = express.Router();
const searchService = require('./search.service');

router.get('/', (req, res) => {
  const { q, authorId, type, startTime, endTime, tagIds, page = 1, pageSize = 20 } = req.query;

  const filters = {};
  if (authorId) filters.authorId = authorId;
  if (type) filters.type = type;
  if (startTime) filters.startTime = startTime;
  if (endTime) filters.endTime = endTime;
  if (tagIds) {
    filters.tagIds = Array.isArray(tagIds) ? tagIds : [tagIds];
  }

  let results;
  if (q) {
    results = searchService.fullTextSearch(q, filters);
  } else {
    results = searchService.advancedSearch(filters);
  }

  const start = (page - 1) * pageSize;
  const end = start + parseInt(pageSize);
  const paginated = results.slice(start, end);

  res.json({
    success: true,
    data: paginated,
    total: results.length,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
  });
});

router.get('/aggregate', (req, res) => {
  const { q, level = 1 } = req.query;
  const result = searchService.searchAndAggregateByTagLevel(q, parseInt(level));
  res.json({ success: true, data: result });
});

module.exports = router;
