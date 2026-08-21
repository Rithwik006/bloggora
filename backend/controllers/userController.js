const { User, Post, Follow } = require('../models');
const { Op } = require('sequelize');

// Search users by name or username
const searchUsers = async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q.trim()) {
      return res.json([]);
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { username: { [Op.like]: `%${q}%` } }
        ]
      },
      attributes: ['id', 'name', 'username', 'avatarUrl', 'bio', 'isPrivate'],
      limit: 20
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User Profile by Username
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const user = await User.findOne({
      where: { username: username.toLowerCase().trim() },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isSelf = currentUserId === user.id;

    // Check follow relationship
    let followRecord = null;
    if (currentUserId && !isSelf) {
      followRecord = await Follow.findOne({
        where: {
          followerId: currentUserId,
          followingId: user.id
        }
      });
    }

    const isFollowing = followRecord ? followRecord.status === 'approved' : false;
    const followStatus = followRecord ? followRecord.status : 'none';

    // Count followers and following
    const followersCount = await Follow.count({ where: { followingId: user.id, status: 'approved' } });
    const followingCount = await Follow.count({ where: { followerId: user.id, status: 'approved' } });

    // Check privacy permission
    const canViewContent = isSelf || !user.isPrivate || isFollowing;

    let userPosts = [];
    if (canViewContent) {
      userPosts = await Post.findAll({
        where: {
          userId: user.id,
          isArchived: false
        },
        include: [{ model: User, attributes: ['id', 'name', 'username', 'avatarUrl'] }],
        order: [['createdAt', 'DESC']]
      });
    }

    res.json({
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        isPrivate: user.isPrivate,
        followersCount,
        followingCount,
        isSelf,
        isFollowing,
        followStatus
      },
      canViewContent,
      posts: userPosts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Follow / Unfollow User
const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (parseInt(targetUserId) === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingFollow = await Follow.findOne({
      where: { followerId: currentUserId, followingId: targetUser.id }
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      return res.json({ message: 'Unfollowed user', followStatus: 'none' });
    } else {
      // Follow
      const status = targetUser.isPrivate ? 'pending' : 'approved';
      await Follow.create({
        followerId: currentUserId,
        followingId: targetUser.id,
        status
      });
      return res.json({
        message: status === 'pending' ? 'Follow request sent' : 'Following user',
        followStatus: status
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchUsers,
  getUserProfile,
  followUser
};
