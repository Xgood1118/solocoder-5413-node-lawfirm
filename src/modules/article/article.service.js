const store = require('../../store/memory');
const fileStorage = require('../../utils/fileStorage');
const invertedIndex = require('../../search/invertedIndex');
const userService = require('../user/user.service');
const tagService = require('../tag/tag.service');
const { PIN_STATUS, RANKING_WEIGHTS, ARTICLE_TYPES } = require('../../constants');

class ArticleService {
  getAllArticles() {
    return store.getAll(store.articles);
  }

  getArticleById(id) {
    return store.getById(store.articles, id);
  }

  getArticleWithContent(id) {
    const article = this.getArticleById(id);
    if (!article) return null;
    const content = fileStorage.readArticleContent(id);
    return { ...article, content };
  }

  createArticle(data) {
    const { title, author, authorId, type, tagIds = [], content = '', summary = '' } = data;

    if (!title || !authorId || !type) {
      throw new Error('标题、作者ID、文章类型不能为空');
    }

    const tags = tagIds.map((id) => tagService.getTagById(id)).filter(Boolean);

    const article = store.create(store.articles, {
      title,
      author,
      authorId,
      type,
      tagIds,
      tags: tags.map((t) => ({ id: t.id, name: t.name, level: t.level })),
      summary,
      views: 0,
      likes: 0,
      comments: 0,
      versions: [],
      isPinned: false,
      pinInfo: null,
    });

    fileStorage.writeArticleContent(article.id, content);
    invertedIndex.indexArticle(article, content);

    return article;
  }

  updateArticle(id, data) {
    const existing = this.getArticleById(id);
    if (!existing) return null;

    const oldContent = fileStorage.readArticleContent(id);
    const versionId = store.generateId();
    const version = {
      id: versionId,
      articleId: id,
      version: existing.versions.length + 1,
      createdAt: Date.now(),
    };
    fileStorage.saveVersion(id, versionId, oldContent);

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.tagIds !== undefined) {
      const tags = data.tagIds.map((tid) => tagService.getTagById(tid)).filter(Boolean);
      updateData.tagIds = data.tagIds;
      updateData.tags = tags.map((t) => ({ id: t.id, name: t.name, level: t.level }));
    }

    const newVersions = [...existing.versions, version];
    updateData.versions = newVersions;

    const updated = store.update(store.articles, id, updateData);

    if (data.content !== undefined) {
      fileStorage.writeArticleContent(id, data.content);
    }

    const newContent = data.content !== undefined ? data.content : oldContent;
    invertedIndex.updateArticle(updated, newContent);

    return updated;
  }

  deleteArticle(id) {
    const existing = this.getArticleById(id);
    if (!existing) return false;
    invertedIndex.removeArticle(id);
    return store.delete(store.articles, id);
  }

  getArticleVersions(id) {
    const article = this.getArticleById(id);
    if (!article) return [];
    return article.versions;
  }

  getArticleVersionContent(id, versionId) {
    return fileStorage.readVersion(id, versionId);
  }

  incrementViews(id) {
    const article = this.getArticleById(id);
    if (!article) return null;
    return store.update(store.articles, id, { views: article.views + 1 });
  }

  likeArticle(id) {
    const article = this.getArticleById(id);
    if (!article) return null;
    return store.update(store.articles, id, { likes: article.likes + 1 });
  }

  updateCommentCount(id, delta) {
    const article = this.getArticleById(id);
    if (!article) return null;
    const newCount = Math.max(0, article.comments + delta);
    return store.update(store.articles, id, { comments: newCount });
  }

  getArticlesByType(type) {
    return store.getAll(store.articles).filter((a) => a.type === type);
  }

  getArticlesByAuthor(authorId) {
    return store.getAll(store.articles).filter((a) => a.authorId === authorId);
  }

  getWeeklyRanking(limit = 10) {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return this._getRanking(oneWeekAgo, limit);
  }

  getMonthlyRanking(limit = 10) {
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return this._getRanking(oneMonthAgo, limit);
  }

  getRookieRanking(limit = 10) {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const articles = store
      .getAll(store.articles)
      .filter((a) => a.createdAt >= oneWeekAgo)
      .map((a) => ({
        ...a,
        score: a.views * RANKING_WEIGHTS.VIEWS + a.likes * RANKING_WEIGHTS.LIKES,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    return articles;
  }

  _getRanking(since, limit) {
    const articles = store
      .getAll(store.articles)
      .filter((a) => a.createdAt >= since)
      .map((a) => ({
        ...a,
        score: a.views * RANKING_WEIGHTS.VIEWS + a.likes * RANKING_WEIGHTS.LIKES,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    return articles;
  }

  requestPin(articleId, userId, reason) {
    const article = this.getArticleById(articleId);
    if (!article) {
      throw new Error('文章不存在');
    }
    if (!userService.canPin(userId)) {
      throw new Error('您没有置顶推荐权限');
    }

    const pin = store.create(store.pins, {
      articleId,
      articleTitle: article.title,
      recommendedBy: userId,
      reason,
      status: PIN_STATUS.PENDING,
      approvedBy: null,
      approvedAt: null,
      rejectReason: null,
    });

    return pin;
  }

  approvePin(pinId, userId) {
    if (!userService.canApprovePin(userId)) {
      throw new Error('您没有审核权限');
    }
    const pin = store.getById(store.pins, pinId);
    if (!pin) {
      throw new Error('置顶申请不存在');
    }
    if (pin.status !== PIN_STATUS.PENDING) {
      throw new Error('该申请已处理');
    }

    const updatedPin = store.update(store.pins, pinId, {
      status: PIN_STATUS.APPROVED,
      approvedBy: userId,
      approvedAt: Date.now(),
    });

    store.update(store.articles, pin.articleId, {
      isPinned: true,
      pinInfo: {
        pinId,
        recommendedBy: pin.recommendedBy,
        reason: pin.reason,
        approvedBy: userId,
        approvedAt: Date.now(),
      },
    });

    return updatedPin;
  }

  rejectPin(pinId, userId, rejectReason) {
    if (!userService.canApprovePin(userId)) {
      throw new Error('您没有审核权限');
    }
    const pin = store.getById(store.pins, pinId);
    if (!pin) {
      throw new Error('置顶申请不存在');
    }
    if (pin.status !== PIN_STATUS.PENDING) {
      throw new Error('该申请已处理');
    }

    return store.update(store.pins, pinId, {
      status: PIN_STATUS.REJECTED,
      approvedBy: userId,
      approvedAt: Date.now(),
      rejectReason,
    });
  }

  getPinsByStatus(status) {
    const pins = store.getAll(store.pins);
    if (status) {
      return pins.filter((p) => p.status === status);
    }
    return pins;
  }

  getPinnedArticles() {
    return store.getAll(store.articles).filter((a) => a.isPinned);
  }

  unpinArticle(articleId, userId) {
    if (!userService.canApprovePin(userId)) {
      throw new Error('您没有权限取消置顶');
    }
    const article = this.getArticleById(articleId);
    if (!article) return null;

    if (article.pinInfo && article.pinInfo.pinId) {
      store.update(store.pins, article.pinInfo.pinId, {
        status: PIN_STATUS.REJECTED,
      });
    }

    return store.update(store.articles, articleId, {
      isPinned: false,
      pinInfo: null,
    });
  }

  advancedSearch(filters) {
    let results = store.getAll(store.articles);

    if (filters.authorId) {
      results = results.filter((a) => a.authorId === filters.authorId);
    }

    if (filters.type) {
      results = results.filter((a) => a.type === filters.type);
    }

    if (filters.startTime) {
      const start = new Date(filters.startTime).getTime();
      results = results.filter((a) => a.createdAt >= start);
    }

    if (filters.endTime) {
      const end = new Date(filters.endTime).getTime();
      results = results.filter((a) => a.createdAt <= end);
    }

    if (filters.tagIds && filters.tagIds.length > 0) {
      results = results.filter((a) => {
        return tagService.matchTagsAtAnyLevel(a.tagIds || [], filters.tagIds);
      });
    }

    return results;
  }
}

module.exports = new ArticleService();
