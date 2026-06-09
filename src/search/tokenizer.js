const { CUSTOM_DICTIONARY } = require('../constants');

class Tokenizer {
  constructor() {
    this.dictionary = new Set(CUSTOM_DICTIONARY);
    this.sortedDictWords = Array.from(this.dictionary).sort((a, b) => b.length - a.length);
  }

  addWord(word) {
    if (!this.dictionary.has(word)) {
      this.dictionary.add(word);
      this.sortedDictWords = Array.from(this.dictionary).sort((a, b) => b.length - a.length);
    }
  }

  addWords(words) {
    words.forEach((w) => this.addWord(w));
  }

  tokenize(text) {
    if (!text || typeof text !== 'string') return [];

    const tokens = [];
    const used = new Set();
    let remaining = text;

    for (const word of this.sortedDictWords) {
      let idx = 0;
      while ((idx = remaining.indexOf(word, idx)) !== -1) {
        tokens.push({ word, start: idx, length: word.length, fromDict: true });
        idx += word.length;
      }
      remaining = remaining.split(word).join(' '.repeat(word.length));
    }

    const chineseRegex = /[\u4e00-\u9fa5]+/g;
    const englishRegex = /[a-zA-Z][a-zA-Z0-9]+/g;
    const numberRegex = /\d+/g;

    let match;
    while ((match = chineseRegex.exec(text)) !== null) {
      const chineseStr = match[0];
      if (chineseStr.length >= 2) {
        for (let len = 2; len <= Math.min(chineseStr.length, 4); len++) {
          for (let i = 0; i <= chineseStr.length - len; i++) {
            const subWord = chineseStr.substring(i, i + len);
            if (!this.dictionary.has(subWord)) {
              tokens.push({
                word: subWord,
                start: match.index + i,
                length: len,
                fromDict: false,
              });
            }
          }
        }
      }
      for (let i = 0; i < chineseStr.length; i++) {
        tokens.push({
          word: chineseStr[i],
          start: match.index + i,
          length: 1,
          fromDict: false,
          single: true,
        });
      }
    }

    while ((match = englishRegex.exec(text)) !== null) {
      tokens.push({
        word: match[0].toLowerCase(),
        start: match.index,
        length: match[0].length,
        fromDict: false,
      });
    }

    while ((match = numberRegex.exec(text)) !== null) {
      tokens.push({
        word: match[0],
        start: match.index,
        length: match[0].length,
        fromDict: false,
      });
    }

    const uniqueTokens = [];
    const seen = new Set();
    for (const t of tokens) {
      if (!seen.has(t.word)) {
        seen.add(t.word);
        uniqueTokens.push(t.word);
      }
    }

    return uniqueTokens;
  }

  tokenizeLongSentence(sentence) {
    const tokens = this.tokenize(sentence);
    return tokens.filter((t) => t.length >= 2);
  }
}

module.exports = new Tokenizer();
