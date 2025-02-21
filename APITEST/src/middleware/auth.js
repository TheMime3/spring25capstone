import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError('Authentication required', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError('Token expired', 401);
    }
    throw new ApiError('Invalid token', 401);
  }
};