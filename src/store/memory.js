const { v4: uuidv4 } = require('uuid');

class MemoryStore {
  constructor() {
    this.articles = new Map();
    this.users = new Map();
    this.tags = new Map();
    this.comments = new Map();
    this.favorites = new Map();
    this.views = new Map();
    this.notifications = new Map();
    this.pins = new Map();
    this.articleCommentIndex = new Map();
    this.userFavoriteIndex = new Map();
    this.userViewIndex = new Map();
    this.userNotificationIndex = new Map();
  }

  generateId() {
    return uuidv4().replace(/-/g, '').substring(0, 16);
  }

  getAll(map) {
    return Array.from(map.values());
  }

  getById(map, id) {
    return map.get(id) || null;
  }

  create(map, data) {
    const id = this.generateId();
    const record = { id, createdAt: Date.now(), updatedAt: Date.now(), ...data };
    map.set(id, record);
    return record;
  }

  update(map, id, data) {
    const existing = map.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: Date.now() };
    map.set(id, updated);
    return updated;
  }

  delete(map, id) {
    return map.delete(id);
  }
}

module.exports = new MemoryStore();
