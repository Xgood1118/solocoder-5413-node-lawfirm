const express = require('express');
const config = require('./config');
const { seedData } = require('./config/seed');

const userRoutes = require('./modules/user/user.routes');
const tagRoutes = require('./modules/tag/tag.routes');
const articleRoutes = require('./modules/article/article.routes');
const searchRoutes = require('./modules/search/search.routes');
const commentRoutes = require('./modules/comment/comment.routes');
const favoriteRoutes = require('./modules/favorite/favorite.routes');
const viewRoutes = require('./modules/view/view.routes');
const exportRoutes = require('./modules/export/export.routes');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '律所知识库服务运行中', timestamp: Date.now() });
});

app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/views', viewRoutes);
app.use('/api/export', exportRoutes);

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误', error: err.message });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

seedData();

app.listen(config.port, () => {
  console.log(`========================================`);
  console.log(`  律所知识库后端服务已启动`);
  console.log(`  端口: ${config.port}`);
  console.log(`  健康检查: http://localhost:${config.port}/api/health`);
  console.log(`========================================`);
});

module.exports = app;
