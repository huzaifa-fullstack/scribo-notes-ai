const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('./logger');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                logger.info(`Google OAuth attempt for email: ${profile.emails[0].value}`);

                // Check if user already exists
                let user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Update Google ID if not set
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.avatar = profile.photos[0]?.value;
                        await user.save();
                    }

                    logger.info(`Existing user logged in via Google: ${user.email}`);
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    avatar: profile.photos[0]?.value,
                    isEmailVerified: true,
                    password: Math.random().toString(36).slice(-8), // Random password
                });

                logger.info(`New user created via Google OAuth: ${user.email}`);
                done(null, user);
            } catch (error) {
                logger.error('Google OAuth error:', error);
                done(error, null);
            }
        }
    )
);

module.exports = passport;