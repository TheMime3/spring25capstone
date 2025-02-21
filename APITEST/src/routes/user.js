import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  res.json(user);
});

router.put('/profile', authenticateToken, async (req, res) => {
  const { name, email } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (email) updates.email = email;

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json(user);
});

router.put('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError('Current password and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new ApiError('New password must be at least 6 characters', 400);
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

export default router;