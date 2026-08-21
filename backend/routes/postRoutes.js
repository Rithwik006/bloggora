const express = require('express');
const router = express.Router();
const {
  getPosts,
  getRecommendations,
  getFollowingPosts,
  getArchivedPosts,
  toggleArchive,
  toggleBookmark,
  getBookmarkedPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.route('/')
  .get(optionalAuth, getPosts)
  .post(protect, createPost);

router.get('/recommendations', optionalAuth, getRecommendations);
router.get('/following', protect, getFollowingPosts);
router.get('/my-archive', protect, getArchivedPosts);
router.get('/bookmarked', protect, getBookmarkedPosts);
router.patch('/:id/archive', protect, toggleArchive);
router.post('/:id/bookmark', protect, toggleBookmark);

router.route('/:id')
  .get(optionalAuth, getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

module.exports = router;
