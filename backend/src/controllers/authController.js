const User = require('../models/User');
const logger = require('../config/logger');
const crypto = require('crypto');
const emailService = require('../services/emailService');

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

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res) => {
  try {
    // User is available in req.user from passport
    const user = req.user;

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    logger.info(`Google OAuth successful for: ${user.email}`);

    // Redirect to frontend with token
    const frontendURL = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${frontendURL}/auth/callback?token=${token}`);
  } catch (error) {
    logger.error('Google callback error:', error);
    const frontendURL = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${frontendURL}/login?error=authentication_failed`);
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    logger.info(`Password reset requested for email: ${email}`);

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration attacks
    // Don't reveal whether the email exists in the database
    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Check if user is OAuth user (Google)
    if (user.googleId && !user.password) {
      logger.warn(`Password reset attempted for Google OAuth user: ${email}`);
      return res.status(400).json({
        success: false,
        error: 'This account uses Google sign-in. Please use Google to log in.'
      });
    }

    // Generate reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before storing in database (security best practice)
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set reset token and expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour from now
    await user.save();

    logger.info(`Reset token generated for user: ${email}`);

    // Send email with reset link (use the unhashed token in the URL)
    try {
      await emailService.sendPasswordResetEmail(email, resetToken, user.name);

      logger.info(`Password reset email sent successfully to: ${email}`);

      return res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully. Please check your inbox.'
      });
    } catch (emailError) {
      // If email fails, clear the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      logger.error(`Failed to send password reset email to: ${email}`, emailError);

      return res.status(500).json({
        success: false,
        error: 'Failed to send password reset email. Please try again later.'
      });
    }
  } catch (error) {
    logger.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    logger.info('Password reset attempt with token');

    // Validate inputs
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both token and new password'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Hash the token from URL to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid reset token that hasn't expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() } // Token must not be expired
    });

    if (!user) {
      logger.warn('Invalid or expired reset token');
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = password;

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    logger.info(`Password successfully reset for user: ${user.email}`);

    // Send confirmation email (don't wait for it, send in background)
    emailService.sendPasswordResetConfirmation(user.email, user.name)
      .catch(err => logger.error('Failed to send password reset confirmation:', err));

    // Generate new JWT token for auto-login
    const authToken = user.getSignedJwtToken();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.',
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};

// @desc    Send email verification link
// @route   POST /api/auth/send-verification
// @access  Private
const sendVerificationEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    // Check if user is Google OAuth user
    if (user.googleId) {
      return res.status(400).json({
        success: false,
        error: 'Google OAuth accounts are automatically verified'
      });
    }

    // Generate verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    logger.info(`Verification token generated for user: ${user.email}`);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, verificationToken, user.name);

      logger.info(`Verification email sent successfully to: ${user.email}`);

      return res.status(200).json({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.'
      });
    } catch (emailError) {
      // If email fails, clear the verification token
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save();

      logger.error(`Failed to send verification email to: ${user.email}`, emailError);

      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again later.'
      });
    }
  } catch (error) {
    logger.error('Send verification email error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};

// @desc    Verify email with token
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    logger.info('Email verification attempt with token');

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }

    // Hash the token from URL to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid verification token that hasn't expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      logger.warn('Invalid or expired verification token');
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token. Please request a new verification email.'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;

    // Clear verification token fields
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();

    logger.info(`Email successfully verified for user: ${user.email}`);

    // Send welcome email (don't wait for it, send in background)
    emailService.sendWelcomeEmail(user.email, user.name)
      .catch(err => logger.error('Failed to send welcome email:', err));

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! You now have the verified badge.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    logger.error('Verify email error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerificationEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if email is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    // Check if user is Google OAuth user
    if (user.googleId) {
      return res.status(400).json({
        success: false,
        error: 'Google OAuth accounts are automatically verified'
      });
    }

    // Check if a verification token already exists and is still valid
    if (user.emailVerificationToken && user.emailVerificationExpire > Date.now()) {
      const timeLeft = Math.ceil((user.emailVerificationExpire - Date.now()) / 1000 / 60);
      logger.info(`Valid verification token already exists for: ${user.email}, expires in ${timeLeft} minutes`);
    }

    // Generate new verification token (overwrites any existing one)
    const verificationToken = user.getEmailVerificationToken();
    await user.save();

    logger.info(`New verification token generated for user: ${user.email}`);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, verificationToken, user.name);

      logger.info(`Verification email resent successfully to: ${user.email}`);

      return res.status(200).json({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.'
      });
    } catch (emailError) {
      // If email fails, clear the verification token
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save();

      logger.error(`Failed to resend verification email to: ${user.email}`, emailError);

      return res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again later.'
      });
    }
  } catch (error) {
    logger.error('Resend verification email error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error. Please try again later.'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  googleCallback,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail
};