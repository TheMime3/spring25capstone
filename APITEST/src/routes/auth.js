import express from 'express';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generateTokens } from '../utils/tokens.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      throw new ApiError('All fields are required', 400);
    }

    if (password.length < 6) {
      throw new ApiError('Password must be at least 6 characters', 400);
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ApiError('Email already registered', 400);
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    // Create refresh token
    const refreshTokenData = await User.createRefreshToken(user.id);
    
    // Generate access token
    const { accessToken } = generateTokens(user.id);

    // Log the registration event
    await User.logAuditEvent(user.id, 'register', req);

    res.status(201).json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        createdAt: user.created_at
      },
      accessToken,
      refreshToken: refreshTokenData.token
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError('Email and password are required', 400);
    }

    const user = await User.findByEmail(email);
    if (!user || !(await User.comparePassword(user.password, password))) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Create refresh token
    const refreshTokenData = await User.createRefreshToken(user.id);
    
    // Generate access token
    const { accessToken } = generateTokens(user.id);

    // Log the login event
    await User.logAuditEvent(user.id, 'login', req);

    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        createdAt: user.created_at
      },
      accessToken,
      refreshToken: refreshTokenData.token
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ApiError('Refresh token is required', 400);
    }

    const tokenData = await User.findRefreshToken(refreshToken);
    if (!tokenData) {
      throw new ApiError('Invalid or expired refresh token', 401);
    }

    const user = await User.findById(tokenData.user_id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Delete the used refresh token
    await User.deleteRefreshToken(refreshToken);

    // Create new tokens
    const newRefreshTokenData = await User.createRefreshToken(user.id);
    const { accessToken } = generateTokens(user.id);

    // Log the token refresh event
    await User.logAuditEvent(user.id, 'token_refresh', req);

    res.json({
      accessToken,
      refreshToken: newRefreshTokenData.token
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    if (refreshToken) {
      await User.deleteRefreshToken(refreshToken);
    }

    if (userId) {
      await User.logAuditEvent(userId, 'logout', req);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;