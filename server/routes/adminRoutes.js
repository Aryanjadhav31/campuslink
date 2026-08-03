const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getUsers,
  createUser,
  deleteUser,
  resetPassword,
  changeUserRole,
  getAuditLogs
} = require('../controllers/adminController');

// All admin routes require authentication AND admin role
router.use(protect);
router.use(adminOnly);

router.get('/users', getUsers);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/password', resetPassword);
router.patch('/users/:id/role', changeUserRole);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
