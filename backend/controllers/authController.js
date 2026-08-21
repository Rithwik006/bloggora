const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, bio, avatarUrl } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, username, email, and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.toLowerCase().trim();

    // Check if email or username exists
    const emailExists = await User.findOne({ where: { email: cleanEmail } });
    if (emailExists) {
      return res.status(400).json({ message: 'Account with this email already exists' });
    }

    const usernameExists = await User.findOne({ where: { username: cleanUsername } });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const user = await User.create({
      name,
      username: cleanUsername,
      email: cleanEmail,
      password,
      bio: bio || '',
      avatarUrl: avatarUrl || '',
      isPrivate: false,
      interests: JSON.stringify([])
    });

    res.status(201).json({
      _id: user.id,
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      interests: user.interests ? JSON.parse(user.interests) : [],
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: cleanEmail } });

    if (user && (await user.matchPassword(password))) {
      let userInterests = [];
      try {
        userInterests = JSON.parse(user.interests || '[]');
      } catch (e) {
        userInterests = [];
      }

      res.json({
        _id: user.id,
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isPrivate: user.isPrivate,
        interests: userInterests,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (user) {
      res.json({
        ...user.toJSON(),
        interests: JSON.parse(user.interests || '[]')
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, username, bio, avatarUrl, isPrivate, interests } = req.body;

    if (username && username.toLowerCase().trim() !== user.username) {
      const existing = await User.findOne({ where: { username: username.toLowerCase().trim() } });
      if (existing) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username.toLowerCase().trim();
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (isPrivate !== undefined) user.isPrivate = Boolean(isPrivate);
    if (interests !== undefined) user.interests = JSON.stringify(interests);

    await user.save();

    res.json({
      _id: user.id,
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      interests: JSON.parse(user.interests || '[]'),
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe, updateProfile };
