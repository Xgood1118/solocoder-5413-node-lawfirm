const store = require('../../store/memory');
const articleService = require('../article/article.service');
const userService = require('../user/user.service');

class CommentService {
  getCommentsByArticle(articleId) {
    const commentIds = store.articleCommentIndex.get(articleId) || [];
    const comments = commentIds
      .map((id) => store.getById(store.comments, id))
      .filter(Boolean)
      .sort((a, b) => a.createdAt - b.createdAt);
    return comments;
  }

  getCommentById(id) {
    return store.getById(store.comments, id);
  }

  createComment(data) {
    const { articleId, userId, userName, content, replyTo } = data;

    if (!articleId || !userId || !content) {
      throw new Error('文章ID、用户ID、评论内容不能为空');
    }

    const comment = store.create(store.comments, {
      articleId,
      userId,
      userName,
      content,
      replyTo: replyTo || null,
      likes: 0,
    });

    if (!store.articleCommentIndex.has(articleId)) {
      store.articleCommentIndex.set(articleId, []);
    }
    store.articleCommentIndex.get(articleId).push(comment.id);

    articleService.updateCommentCount(articleId, 1);

    const mentionedUsers = this.extractMentions(content);
    for (const mentionedUser of mentionedUsers) {
      this.createMentionNotification(mentionedUser, comment);
    }

    if (replyTo) {
      const parentComment = this.getCommentById(replyTo);
      if (parentComment && parentComment.userId !== userId) {
        this.createReplyNotification(parentComment.userId, comment);
      }
    }

    return comment;
  }

  extractMentions(content) {
    const mentionRegex = /@(\S+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      const userName = match[1].replace(/[，。！？、；：,.!?;:]/g, '');
      const user = userService.getUserByName(userName);
      if (user) {
        mentions.push(user);
      }
    }
    return mentions;
  }

  createMentionNotification(user, comment) {
    const notification = store.create(store.notifications, {
      userId: user.id,
      type: 'mention',
      articleId: comment.articleId,
      commentId: comment.id,
      fromUserId: comment.userId,
      fromUserName: comment.userName,
      content: comment.content,
      read: false,
      createdAt: Date.now(),
    });

    if (!store.userNotificationIndex.has(user.id)) {
      store.userNotificationIndex.set(user.id, []);
    }
    store.userNotificationIndex.get(user.id).push(notification.id);
  }

  createReplyNotification(userId, comment) {
    const notification = store.create(store.notifications, {
      userId,
      type: 'reply',
      articleId: comment.articleId,
      commentId: comment.id,
      fromUserId: comment.userId,
      fromUserName: comment.userName,
      content: comment.content,
      read: false,
      createdAt: Date.now(),
    });

    if (!store.userNotificationIndex.has(userId)) {
      store.userNotificationIndex.set(userId, []);
    }
    store.userNotificationIndex.get(userId).push(notification.id);
  }

  deleteComment(id) {
    const comment = store.getById(store.comments, id);
    if (!comment) return false;

    const articleComments = store.articleCommentIndex.get(comment.articleId) || [];
    const idx = articleComments.indexOf(id);
    if (idx > -1) {
      articleComments.splice(idx, 1);
    }

    articleService.updateCommentCount(comment.articleId, -1);

    return store.delete(store.comments, id);
  }

  likeComment(id) {
    const comment = store.getById(store.comments, id);
    if (!comment) return null;
    return store.update(store.comments, id, { likes: comment.likes + 1 });
  }

  getUserNotifications(userId) {
    const notifIds = store.userNotificationIndex.get(userId) || [];
    const notifications = notifIds
      .map((id) => store.getById(store.notifications, id))
      .filter(Boolean)
      .sort((a, b) => b.createdAt - a.createdAt);
    return notifications;
  }

  getUnreadNotificationCount(userId) {
    const notifications = this.getUserNotifications(userId);
    return notifications.filter((n) => !n.read).length;
  }

  markNotificationAsRead(notificationId) {
    const notif = store.getById(store.notifications, notificationId);
    if (!notif) return null;
    return store.update(store.notifications, notificationId, { read: true });
  }

  markAllNotificationsAsRead(userId) {
    const notifIds = store.userNotificationIndex.get(userId) || [];
    for (const id of notifIds) {
      store.update(store.notifications, id, { read: true });
    }
    return true;
  }
}

module.exports = new CommentService();
