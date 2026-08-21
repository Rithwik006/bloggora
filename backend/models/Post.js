const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  coverImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'General'
  },
  tags: {
    type: DataTypes.TEXT,
    defaultValue: '[]'
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  allowComments: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Post;
