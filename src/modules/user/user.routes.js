const express = require('express');
const router = express.Router();
const userService = require('./user.service');

router.get('/', (req, res) => {
  const users = userService.getAllUsers();
  res.json({ success: true, data: users });
});

router.get('/:id', (req, res) => {
  const user = userService.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  res.json({ success: true, data: user });
});

router.post('/', (req, res) => {
  const { name, role, email, phone, department } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: '用户名不能为空' });
  }
  const user = userService.createUser({ name, role, email, phone, department });
  res.status(201).json({ success: true, data: user });
});

router.put('/:id', (req, res) => {
  const user = userService.updateUser(req.params.id, req.body);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  res.json({ success: true, data: user });
});

router.delete('/:id', (req, res) => {
  const deleted = userService.deleteUser(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  res.json({ success: true, message: '删除成功' });
});

router.post('/:id/depart', (req, res) => {
  const result = userService.departUser(req.params.id);
  if (!result) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  res.json({ success: true, message: '已标记离职，个人数据已归档', data: result });
});

module.exports = router;
