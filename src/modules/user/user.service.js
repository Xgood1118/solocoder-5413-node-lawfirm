const store = require('../../store/memory');
const { USER_ROLES } = require('../../constants');

class UserService {
  getAllUsers() {
    return store.getAll(store.users).filter((u) => !u.isDeparted);
  }

  getUserById(id) {
    return store.getById(store.users, id);
  }

  getUserByName(name) {
    for (const user of store.users.values()) {
      if (user.name === name && !user.isDeparted) {
        return user;
      }
    }
    return null;
  }

  createUser(data) {
    const user = store.create(store.users, {
      name: data.name,
      role: data.role || USER_ROLES.LAWYER,
      email: data.email || '',
      phone: data.phone || '',
      department: data.department || '',
      isDeparted: false,
      departedAt: null,
    });
    return user;
  }

  updateUser(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.department !== undefined) updateData.department = data.department;
    return store.update(store.users, id, updateData);
  }

  deleteUser(id) {
    return store.delete(store.users, id);
  }

  departUser(id) {
    const user = store.getById(store.users, id);
    if (!user) return null;

    store.update(store.users, id, {
      isDeparted: true,
      departedAt: Date.now(),
    });

    this.archiveUserData(id);

    return this.getUserById(id);
  }

  archiveUserData(userId) {
    const archivedFavorites = [];
    for (const fav of store.favorites.values()) {
      if (fav.userId === userId) {
        archivedFavorites.push({ ...fav, archived: true, archivedAt: Date.now() });
        store.delete(store.favorites, fav.id);
      }
    }

    const userFavIndex = store.userFavoriteIndex.get(userId) || [];
    store.userFavoriteIndex.delete(userId);

    const userViewIndex = store.userViewIndex.get(userId) || [];
    for (const viewId of userViewIndex) {
      store.delete(store.views, viewId);
    }
    store.userViewIndex.delete(userId);

    return {
      archivedFavorites,
      archivedViewsCount: userViewIndex.length,
    };
  }

  getArchivedFavorites() {
    const archived = [];
    for (const fav of store.favorites.values()) {
      if (fav.archived) {
        archived.push(fav);
      }
    }
    return archived;
  }

  isSeniorLawyer(userId) {
    const user = this.getUserById(userId);
    return user && (user.role === USER_ROLES.SENIOR_LAWYER || user.role === USER_ROLES.ADMIN);
  }

  isAdmin(userId) {
    const user = this.getUserById(userId);
    return user && user.role === USER_ROLES.ADMIN;
  }

  isAssistant(userId) {
    const user = this.getUserById(userId);
    return user && user.role === USER_ROLES.ASSISTANT;
  }

  canPin(userId) {
    return this.isSeniorLawyer(userId);
  }

  canApprovePin(userId) {
    return this.isAssistant(userId) || this.isAdmin(userId);
  }
}

module.exports = new UserService();
