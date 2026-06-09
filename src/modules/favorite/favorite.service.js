const store = require('../../store/memory');

class FavoriteService {
  addFavorite(userId, articleId) {
    const existing = this.getUserFavoriteByArticle(userId, articleId);
    if (existing) {
      return existing;
    }

    const favorite = store.create(store.favorites, {
      userId,
      articleId,
      createdAt: Date.now(),
    });

    if (!store.userFavoriteIndex.has(userId)) {
      store.userFavoriteIndex.set(userId, []);
    }
    store.userFavoriteIndex.get(userId).push(favorite.id);

    return favorite;
  }

  removeFavorite(userId, articleId) {
    const favorite = this.getUserFavoriteByArticle(userId, articleId);
    if (!favorite) return false;

    store.delete(store.favorites, favorite.id);

    const userFavs = store.userFavoriteIndex.get(userId) || [];
    const idx = userFavs.indexOf(favorite.id);
    if (idx > -1) {
      userFavs.splice(idx, 1);
    }

    return true;
  }

  getUserFavorites(userId) {
    const favIds = store.userFavoriteIndex.get(userId) || [];
    const favorites = favIds
      .map((id) => store.getById(store.favorites, id))
      .filter(Boolean)
      .sort((a, b) => b.createdAt - a.createdAt);
    return favorites;
  }

  getUserFavoriteByArticle(userId, articleId) {
    const favIds = store.userFavoriteIndex.get(userId) || [];
    for (const id of favIds) {
      const fav = store.getById(store.favorites, id);
      if (fav && fav.articleId === articleId) {
        return fav;
      }
    }
    return null;
  }

  isFavorited(userId, articleId) {
    return !!this.getUserFavoriteByArticle(userId, articleId);
  }

  clearUserFavorites(userId) {
    const favIds = store.userFavoriteIndex.get(userId) || [];
    for (const id of favIds) {
      store.delete(store.favorites, id);
    }
    store.userFavoriteIndex.delete(userId);
    return true;
  }

  getFavoriteCountByArticle(articleId) {
    let count = 0;
    for (const fav of store.favorites.values()) {
      if (fav.articleId === articleId && !fav.archived) {
        count++;
      }
    }
    return count;
  }
}

module.exports = new FavoriteService();
