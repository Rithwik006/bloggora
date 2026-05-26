const { Post, User, Comment } = require('../models');

const getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [{ model: User, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
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
        { model: User, attributes: ['name'] },
        { 
          model: Comment, 
          include: [{ model: User, attributes: ['name'] }] 
        }
      ]
    });
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.create({
      title,
      content,
      userId: req.user.id
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findByPk(req.params.id);

    if (post) {
      if (post.userId !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      post.title = title || post.title;
      post.content = content || post.content;
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

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost };
