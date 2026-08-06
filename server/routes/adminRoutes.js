const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getStats,
  getUsers,
  getUserDetails,
  createUser,
  deleteUser,
  resetPassword,
  changeUserRole,
  toggleVerification,
  toggleSuspend,
  getAuditLogs
} = require('../controllers/adminController');

// All admin routes require authentication AND admin role
router.use(protect);
router.use(adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id/details', getUserDetails);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/password', resetPassword);
router.patch('/users/:id/role', changeUserRole);
router.patch('/users/:id/verify', toggleVerification);
router.patch('/users/:id/suspend', toggleSuspend);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
