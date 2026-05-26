const { Comment, Post } = require('../models');

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      text,
      postId,
      userId: req.user.id
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);

    if (comment) {
      if (comment.userId !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      await comment.destroy();
      res.json({ message: 'Comment removed' });
    } else {
      res.status(404).json({ message: 'Comment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addComment, deleteComment };
