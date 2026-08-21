const { Post, User, Comment, Follow, Bookmark } = require('../models');
const { Op } = require('sequelize');

const getPosts = async (req, res) => {
  try {
    const { category, tag, search } = req.query;
    const where = { isArchived: false };

    if (category && category !== 'All') {
      where.category = category;
    }

    if (tag) {
      where.tags = { [Op.like]: `%${tag}%` };
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } }
      ];
    }

    const posts = await Post.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'username', 'avatarUrl', 'isPrivate']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Filter out posts from private accounts unless requested by followed user or self
    const currentUserId = req.user ? req.user.id : null;
    const filteredPosts = [];

    for (const post of posts) {
      if (!post.User || !post.User.isPrivate || post.userId === currentUserId) {
        filteredPosts.push(post);
      } else if (currentUserId) {
        const follow = await Follow.findOne({
          where: { followerId: currentUserId, followingId: post.userId, status: 'approved' }
        });
        if (follow) {
          filteredPosts.push(post);
        }
      }
    }

    // Attach isBookmarked flag if user is logged in
    let userBookmarkPostIds = new Set();
    if (currentUserId) {
      const userBookmarks = await Bookmark.findAll({
        where: { userId: currentUserId },
        attributes: ['postId']
      });
      userBookmarkPostIds = new Set(userBookmarks.map(b => b.postId));
    }

    const postsWithBookmarks = filteredPosts.map(p => {
      const plain = p.toJSON();
      plain.isBookmarked = userBookmarkPostIds.has(p.id);
      return plain;
    });

    res.json(postsWithBookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Algorithmic Feed: For You content based on User Profile & Past Engagement
const getRecommendations = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    let userInterests = [];

    if (currentUserId) {
      const user = await User.findByPk(currentUserId);
      if (user && user.interests) {
        try {
          userInterests = JSON.parse(user.interests);
        } catch (e) {
          userInterests = [];
        }
      }
    }

    // Get all public non-archived posts in reverse chronological order
    const posts = await Post.findAll({
      where: { isArchived: false },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'username', 'avatarUrl', 'isPrivate']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Filter out private user posts
    const eligiblePosts = [];
    for (const post of posts) {
      if (!post.User || !post.User.isPrivate || post.userId === currentUserId) {
        eligiblePosts.push(post);
      } else if (currentUserId) {
        const follow = await Follow.findOne({
          where: { followerId: currentUserId, followingId: post.userId, status: 'approved' }
        });
        if (follow) {
          eligiblePosts.push(post);
        }
      }
    }

    // Attach bookmark info
    let userBookmarkPostIds = new Set();
    if (currentUserId) {
      const userBookmarks = await Bookmark.findAll({
        where: { userId: currentUserId },
        attributes: ['postId']
      });
      userBookmarkPostIds = new Set(userBookmarks.map(b => b.postId));
    }

    // Score posts based on interest tag overlap & recency boost
    const scoredPosts = eligiblePosts.map((post) => {
      let score = 0;
      let tags = [];
      try {
        tags = JSON.parse(post.tags || '[]');
      } catch (e) {
        tags = [];
      }

      if (userInterests.includes(post.category)) {
        score += 5;
      }

      tags.forEach(t => {
        if (userInterests.includes(t)) {
          score += 3;
        }
      });

      const plain = post.toJSON();
      plain.isBookmarked = userBookmarkPostIds.has(post.id);

      return { post: plain, score };
    });

    scoredPosts.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.createdAt) - new Date(a.post.createdAt);
    });

    res.json(scoredPosts.map(sp => sp.post));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// X-Style Feed: Following Feed
const getFollowingPosts = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get list of users the current user follows
    const follows = await Follow.findAll({
      where: { followerId: currentUserId, status: 'approved' },
      attributes: ['followingId']
    });

    const followingUserIds = follows.map(f => f.followingId);
    followingUserIds.push(currentUserId); // include user's own posts

    const posts = await Post.findAll({
      where: {
        userId: { [Op.in]: followingUserIds },
        isArchived: false
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'username', 'avatarUrl', 'isPrivate']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const userBookmarks = await Bookmark.findAll({
      where: { userId: currentUserId },
      attributes: ['postId']
    });
    const userBookmarkPostIds = new Set(userBookmarks.map(b => b.postId));

    const postsWithBookmarks = posts.map(p => {
      const plain = p.toJSON();
      plain.isBookmarked = userBookmarkPostIds.has(p.id);
      return plain;
    });

    res.json(postsWithBookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getArchivedPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: {
        userId: req.user.id,
        isArchived: true
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'username', 'avatarUrl']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleArchive = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    post.isArchived = !post.isArchived;
    await post.save();

    res.json({
      message: post.isArchived ? 'Post archived successfully' : 'Post restored from archive',
      isArchived: post.isArchived,
      post
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bookmark controllers
const toggleBookmark = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existing = await Bookmark.findOne({ where: { userId, postId } });

    if (existing) {
      await existing.destroy();
      return res.json({ message: 'Bookmark removed', isBookmarked: false });
    } else {
      await Bookmark.create({ userId, postId });
      return res.json({ message: 'Post bookmarked successfully', isBookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookmarkedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookmarks = await Bookmark.findAll({
      where: { userId },
      include: [
        {
          model: Post,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'username', 'avatarUrl', 'isPrivate']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const posts = bookmarks
      .map(b => b.Post)
      .filter(p => p && !p.isArchived)
      .map(p => {
        const plain = p.toJSON();
        plain.isBookmarked = true;
        return plain;
      });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'avatarUrl', 'isPrivate'] },
        { 
          model: Comment, 
          include: [{ model: User, attributes: ['id', 'name', 'username', 'avatarUrl'] }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (post) {
      if (post.Comments) {
        post.Comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      const plain = post.toJSON();
      if (req.user) {
        const bm = await Bookmark.findOne({ where: { userId: req.user.id, postId: post.id } });
        plain.isBookmarked = Boolean(bm);
      }
      res.json(plain);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, coverImage, category, tags, allowComments, isArchived } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const formattedTags = Array.isArray(tags) ? JSON.stringify(tags) : (typeof tags === 'string' ? JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)) : '[]');

    const post = await Post.create({
      title,
      content,
      coverImage: coverImage || '',
      category: category || 'General',
      tags: formattedTags,
      allowComments: allowComments !== undefined ? Boolean(allowComments) : true,
      isArchived: Boolean(isArchived),
      userId: req.user.id
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { title, content, coverImage, category, tags, allowComments, isArchived } = req.body;
    const post = await Post.findByPk(req.params.id);

    if (post) {
      if (post.userId !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      if (title !== undefined) post.title = title;
      if (content !== undefined) post.content = content;
      if (coverImage !== undefined) post.coverImage = coverImage;
      if (category !== undefined) post.category = category;
      if (tags !== undefined) {
        post.tags = Array.isArray(tags) ? JSON.stringify(tags) : (typeof tags === 'string' ? JSON.stringify(tags.split(',').map(t => t.trim()).filter(Boolean)) : '[]');
      }
      if (allowComments !== undefined) post.allowComments = Boolean(allowComments);
      if (isArchived !== undefined) post.isArchived = Boolean(isArchived);

      await post.save();
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (post) {
      if (post.userId !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      await post.destroy();
      res.json({ message: 'Post removed' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
