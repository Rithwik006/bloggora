const { Comment, Post, User } = require('../models');

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { postId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text cannot be empty' });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.allowComments) {
      return res.status(403).json({ message: 'Comments are disabled for this post by the author' });
    }

    const comment = await Comment.create({
      text,
      postId,
      userId: req.user.id
    });

    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'name', 'username', 'avatarUrl'] }]
    });

    res.status(201).json(fullComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id, {
      include: [{ model: Post }]
    });

    if (comment) {
      const isCommentAuthor = comment.userId === req.user.id;
      const isPostAuthor = comment.Post && comment.Post.userId === req.user.id;

      if (!isCommentAuthor && !isPostAuthor) {
        return res.status(401).json({ message: 'Not authorized to delete this comment' });
      }

      await comment.destroy();
      res.json({ message: 'Comment removed successfully' });
    } else {
      res.status(404).json({ message: 'Comment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addComment, deleteComment };
