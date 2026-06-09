const store = require('../../store/memory');
const { TAG_LEVELS } = require('../../constants');

class TagService {
  constructor() {
    this.initialized = false;
  }

  initDefaultTags() {
    if (this.initialized) return;

    const level1Tags = [
      { name: '民商', level: 1, parentId: null },
      { name: '刑事', level: 1, parentId: null },
      { name: '行政', level: 1, parentId: null },
      { name: '知产', level: 1, parentId: null },
    ];

    const l1Ids = {};
    for (const tag of level1Tags) {
      const created = store.create(store.tags, tag);
      l1Ids[tag.name] = created.id;
    }

    const level2Tags = [
      { name: '合同纠纷', level: 2, parentName: '民商' },
      { name: '侵权', level: 2, parentName: '民商' },
      { name: '婚姻家事', level: 2, parentName: '民商' },
      { name: '公司治理', level: 2, parentName: '民商' },
      { name: '刑法总论', level: 2, parentName: '刑事' },
      { name: '刑法分论', level: 2, parentName: '刑事' },
      { name: '刑事诉讼', level: 2, parentName: '刑事' },
      { name: '行政复议', level: 2, parentName: '行政' },
      { name: '行政诉讼', level: 2, parentName: '行政' },
      { name: '著作权', level: 2, parentName: '知产' },
      { name: '商标权', level: 2, parentName: '知产' },
      { name: '专利权', level: 2, parentName: '知产' },
    ];

    const l2Ids = {};
    for (const tag of level2Tags) {
      const created = store.create(store.tags, {
        name: tag.name,
        level: tag.level,
        parentId: l1Ids[tag.parentName],
      });
      l2Ids[tag.name] = created.id;
    }

    const level3Tags = [
      { name: '买卖合同纠纷', level: 3, parentName: '合同纠纷' },
      { name: '借款合同纠纷', level: 3, parentName: '合同纠纷' },
      { name: '租赁合同纠纷', level: 3, parentName: '合同纠纷' },
      { name: '服务合同纠纷', level: 3, parentName: '合同纠纷' },
      { name: '交通事故', level: 3, parentName: '侵权' },
      { name: '医疗损害', level: 3, parentName: '侵权' },
      { name: '人身损害', level: 3, parentName: '侵权' },
      { name: '离婚诉讼', level: 3, parentName: '婚姻家事' },
      { name: '财产分割', level: 3, parentName: '婚姻家事' },
      { name: '子女抚养', level: 3, parentName: '婚姻家事' },
      { name: '股权转让', level: 3, parentName: '公司治理' },
      { name: '公司清算', level: 3, parentName: '公司治理' },
      { name: '盗窃罪', level: 3, parentName: '刑法分论' },
      { name: '诈骗罪', level: 3, parentName: '刑法分论' },
      { name: '故意伤害罪', level: 3, parentName: '刑法分论' },
    ];

    for (const tag of level3Tags) {
      store.create(store.tags, {
        name: tag.name,
        level: tag.level,
        parentId: l2Ids[tag.parentName],
      });
    }

    this.initialized = true;
  }

  getAllTags() {
    return store.getAll(store.tags);
  }

  getTagById(id) {
    return store.getById(store.tags, id);
  }

  getTagByName(name) {
    for (const tag of store.tags.values()) {
      if (tag.name === name) {
        return tag;
      }
    }
    return null;
  }

  getTagsByLevel(level) {
    return store.getAll(store.tags).filter((t) => t.level === level);
  }

  getChildTags(parentId) {
    return store.getAll(store.tags).filter((t) => t.parentId === parentId);
  }

  createTag(data) {
    const { name, level, parentId } = data;
    if (!name || !level) {
      throw new Error('标签名称和级别不能为空');
    }
    if (level > 1 && !parentId) {
      throw new Error('二级及以下标签必须指定父标签');
    }
    if (level > TAG_LEVELS.LEVEL_3) {
      throw new Error('标签最多三级');
    }
    return store.create(store.tags, { name, level, parentId: parentId || null });
  }

  updateTag(id, data) {
    return store.update(store.tags, id, data);
  }

  deleteTag(id) {
    const tag = this.getTagById(id);
    if (!tag) return false;

    const children = this.getChildTags(id);
    for (const child of children) {
      this.deleteTag(child.id);
    }

    return store.delete(store.tags, id);
  }

  getTagTree() {
    const level1 = this.getTagsByLevel(1);
    const buildTree = (parentId) => {
      const children = this.getChildTags(parentId);
      return children.map((child) => ({
        ...child,
        children: buildTree(child.id),
      }));
    };

    return level1.map((tag) => ({
      ...tag,
      children: buildTree(tag.id),
    }));
  }

  getTagPath(tagId) {
    const path = [];
    let current = this.getTagById(tagId);
    while (current) {
      path.unshift(current);
      current = current.parentId ? this.getTagById(current.parentId) : null;
    }
    return path;
  }

  getTagAndDescendants(tagId) {
    const tag = this.getTagById(tagId);
    if (!tag) return [];

    const result = [tagId];
    const children = this.getChildTags(tagId);
    for (const child of children) {
      result.push(...this.getTagAndDescendants(child.id));
    }
    return result;
  }

  mergeTagsByLevel(tagIds, targetLevel) {
    const result = new Set();
    for (const tagId of tagIds) {
      const tag = this.getTagById(tagId);
      if (!tag) continue;

      if (tag.level === targetLevel) {
        result.add(tagId);
      } else if (tag.level > targetLevel) {
        let current = tag;
        while (current && current.level > targetLevel) {
          current = current.parentId ? this.getTagById(current.parentId) : null;
        }
        if (current && current.level === targetLevel) {
          result.add(current.id);
        }
      } else {
        const descendants = this.getTagAndDescendants(tagId);
        for (const descId of descendants) {
          const desc = this.getTagById(descId);
          if (desc && desc.level === targetLevel) {
            result.add(descId);
          }
        }
      }
    }
    return Array.from(result);
  }

  matchTagsAtAnyLevel(tagIds, filterTagIds) {
    if (!filterTagIds || filterTagIds.length === 0) return true;

    const allMatchTagIds = new Set();
    for (const filterTagId of filterTagIds) {
      const descendants = this.getTagAndDescendants(filterTagId);
      descendants.forEach((id) => allMatchTagIds.add(id));
    }

    return tagIds.some((tagId) => allMatchTagIds.has(tagId));
  }
}

module.exports = new TagService();
