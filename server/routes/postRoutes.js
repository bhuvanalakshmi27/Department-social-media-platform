const express = require('express');
const router = express.Router();
const { 
  createPost,
  registerConflictPost,
  checkScheduleConflict,
  getScheduleConflicts,
  deleteScheduleConflictPost,
  getPosts, 
  getPostById, 
  updatePostStatus, 
  deletePost,
  getAnalytics
} = require('../controllers/postController');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate); // All post routes require authentication

router.post('/', createPost);
router.post('/conflicts/register', requireRole(['Student', 'Admin']), registerConflictPost);
router.get('/', getPosts);
router.get('/analytics', getAnalytics);
router.get('/schedule-conflict', checkScheduleConflict);
router.get('/conflicts', requireRole(['Student', 'Admin']), getScheduleConflicts);
router.delete('/conflicts/:id', requireRole(['Student', 'Admin']), deleteScheduleConflictPost);
router.get('/:id', getPostById);
router.patch('/:id/status', updatePostStatus);
router.delete('/:id', deletePost);

module.exports = router;

