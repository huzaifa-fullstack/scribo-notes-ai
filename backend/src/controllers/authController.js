const User = require('../models/User');
const logger = require('../config/logger');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    logger.info(`Registration attempt for email: ${email}`);

    // Validate required fields
    if (!name || !email || !password) {
      logger.warn(`Registration failed - missing fields for email: ${email}`);
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields (name, email, password)'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Registration failed - user already exists: ${email}`);
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token using the model method
    const token = user.getSignedJwtToken();

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });

  } catch (error) {
    logger.error(`Registration error for email: ${req.body.email}`, error);
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    logger.info(`Login attempt for email: ${email}`);

    // Validate email and password
    if (!email || !password) {
      logger.warn(`Login failed - missing credentials for email: ${email}`);
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    try {
      // Use the static method from User model
      const user = await User.findByCredentials(email, password);

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token using the model method
      const token = user.getSignedJwtToken();

      logger.info(`User logged in successfully: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user
      });

    } catch (authError) {
      logger.warn(`Login failed for email: ${email} - ${authError.message}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

  } catch (error) {
    logger.error(`Login error for email: ${req.body.email}`, error);
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // User is already attached to req by auth middleware
    const user = await User.findById(req.user.id);

    logger.info(`User profile accessed: ${user.email}`);

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (avatar) fieldsToUpdate.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    );

    logger.info(`User profile updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout
};