const express = require('express');
const router = express.Router();
const { 
  createPost, 
  getPosts, 
  getPostById, 
  updatePostStatus, 
  deletePost,
  getAnalytics
} = require('../controllers/postController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate); // All post routes require authentication

router.post('/', createPost);
router.get('/', getPosts);
router.get('/analytics', getAnalytics);
router.get('/:id', getPostById);
router.patch('/:id/status', updatePostStatus);
router.delete('/:id', deletePost);

module.exports = router;

