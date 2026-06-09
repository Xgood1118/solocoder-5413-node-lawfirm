const tokenizer = require('./tokenizer');
const { SEARCH_WEIGHTS } = require('../constants');

class InvertedIndex {
  constructor() {
    this.titleIndex = new Map();
    this.tagIndex = new Map();
    this.contentIndex = new Map();
    this.titleFreq = new Map();
    this.tagFreq = new Map();
    this.contentFreq = new Map();
  }

  addToIndex(indexMap, freqMap, articleId, tokens, weightField) {
    const freq = {};
    for (const token of tokens) {
      if (!indexMap.has(token)) {
        indexMap.set(token, new Set());
      }
      indexMap.get(token).add(articleId);
      freq[token] = (freq[token] || 0) + 1;
    }
    freqMap.set(articleId, freq);
  }

  indexArticle(article, content) {
    const { id, title, tags = [] } = article;

    const titleTokens = tokenizer.tokenize(title);
    this.addToIndex(this.titleIndex, this.titleFreq, id, titleTokens, 'title');

    const tagTokens = [];
    for (const tag of tags) {
      tagTokens.push(...tokenizer.tokenize(tag.name || tag));
    }
    this.addToIndex(this.tagIndex, this.tagFreq, id, tagTokens, 'tag');

    const contentTokens = tokenizer.tokenize(content);
    this.addToIndex(this.contentIndex, this.contentFreq, id, contentTokens, 'content');
  }

  removeArticle(articleId) {
    const removeFromMap = (map, freqMap) => {
      for (const [token, ids] of map.entries()) {
        ids.delete(articleId);
        if (ids.size === 0) {
          map.delete(token);
        }
      }
      freqMap.delete(articleId);
    };
    removeFromMap(this.titleIndex, this.titleFreq);
    removeFromMap(this.tagIndex, this.tagFreq);
    removeFromMap(this.contentIndex, this.contentFreq);
  }

  updateArticle(article, content) {
    this.removeArticle(article.id);
    this.indexArticle(article, content);
  }

  search(query) {
    const queryTokens = tokenizer.tokenizeLongSentence(query);
    if (queryTokens.length === 0) {
      return [];
    }

    const scores = new Map();

    const calculateScore = (indexMap, freqMap, weight) => {
      for (const token of queryTokens) {
        const matchingIds = indexMap.get(token);
        if (matchingIds) {
          for (const articleId of matchingIds) {
            const freq = (freqMap.get(articleId) && freqMap.get(articleId)[token]) || 0;
            const currentScore = scores.get(articleId) || 0;
            scores.set(articleId, currentScore + weight * (1 + freq * 0.1));
          }
        }
      }
    };

    calculateScore(this.titleIndex, this.titleFreq, SEARCH_WEIGHTS.TITLE);
    calculateScore(this.tagIndex, this.tagFreq, SEARCH_WEIGHTS.TAG);
    calculateScore(this.contentIndex, this.contentFreq, SEARCH_WEIGHTS.CONTENT);

    const results = Array.from(scores.entries())
      .map(([articleId, score]) => ({ articleId, score }))
      .sort((a, b) => b.score - a.score);

    return results;
  }
}

module.exports = new InvertedIndex();
