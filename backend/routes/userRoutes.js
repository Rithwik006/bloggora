const express = require('express');
const router = express.Router();
const { searchUsers, getUserProfile, followUser } = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/search', searchUsers);
router.get('/profile/:username', optionalAuth, getUserProfile);
router.post('/:id/follow', protect, followUser);

module.exports = router;
