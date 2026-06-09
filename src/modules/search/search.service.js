const invertedIndex = require('../../search/invertedIndex');
const articleService = require('../article/article.service');
const tagService = require('../tag/tag.service');

class SearchService {
  fullTextSearch(query, filters = {}) {
    if (!query || query.trim() === '') {
      return articleService.advancedSearch(filters);
    }

    const searchResults = invertedIndex.search(query);
    let articleIds = searchResults.map((r) => r.articleId);
    const scoreMap = new Map(searchResults.map((r) => [r.articleId, r.score]));

    if (Object.keys(filters).length > 0) {
      const filtered = articleService.advancedSearch(filters);
      const filteredIds = new Set(filtered.map((a) => a.id));
      articleIds = articleIds.filter((id) => filteredIds.has(id));
    }

    const articles = articleIds
      .map((id) => {
        const article = articleService.getArticleById(id);
        if (article) {
          return { ...article, score: scoreMap.get(id) || 0 };
        }
        return null;
      })
      .filter(Boolean);

    return articles;
  }

  advancedSearch(filters) {
    return articleService.advancedSearch(filters);
  }

  searchAndAggregateByTagLevel(query, level) {
    const results = this.fullTextSearch(query);
    const tagCount = new Map();

    for (const article of results) {
      const articleTags = article.tagIds || [];
      const mergedTags = tagService.mergeTagsByLevel(articleTags, level);
      for (const tagId of mergedTags) {
        tagCount.set(tagId, (tagCount.get(tagId) || 0) + 1);
      }
    }

    const tagStats = Array.from(tagCount.entries())
      .map(([tagId, count]) => {
        const tag = tagService.getTagById(tagId);
        return tag ? { tag, count } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.count - a.count);

    return { results, tagStats };
  }
}

module.exports = new SearchService();
