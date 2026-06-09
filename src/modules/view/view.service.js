const store = require('../../store/memory');

class ViewService {
  recordView(userId, articleId) {
    const view = store.create(store.views, {
      userId,
      articleId,
      viewedAt: Date.now(),
    });

    if (!store.userViewIndex.has(userId)) {
      store.userViewIndex.set(userId, []);
    }
    store.userViewIndex.get(userId).push(view.id);

    return view;
  }

  getUserViews(userId, limit = 50) {
    const viewIds = store.userViewIndex.get(userId) || [];
    const views = viewIds
      .map((id) => store.getById(store.views, id))
      .filter(Boolean)
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, limit);
    return views;
  }

  getViewByUserAndArticle(userId, articleId) {
    const viewIds = store.userViewIndex.get(userId) || [];
    for (const id of viewIds) {
      const view = store.getById(store.views, id);
      if (view && view.articleId === articleId) {
        return view;
      }
    }
    return null;
  }

  deleteView(viewId) {
    const view = store.getById(store.views, viewId);
    if (view) {
      const userViews = store.userViewIndex.get(view.userId) || [];
      const idx = userViews.indexOf(viewId);
      if (idx > -1) {
        userViews.splice(idx, 1);
      }
    }
    return store.delete(store.views, viewId);
  }

  clearUserViews(userId) {
    const viewIds = store.userViewIndex.get(userId) || [];
    for (const id of viewIds) {
      store.delete(store.views, id);
    }
    store.userViewIndex.delete(userId);
    return true;
  }

  getRecentUniqueArticles(userId, limit = 20) {
    const views = this.getUserViews(userId, 100);
    const seen = new Set();
    const unique = [];
    for (const view of views) {
      if (!seen.has(view.articleId)) {
        seen.add(view.articleId);
        unique.push(view);
        if (unique.length >= limit) break;
      }
    }
    return unique;
  }
}

module.exports = new ViewService();
