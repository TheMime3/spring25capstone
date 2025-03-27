import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError('User not found', 404);
    }
    
    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      createdAt: user.created_at
    });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;
    const updates = {};

    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;
    if (email) {
      // Check if email is already taken
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        throw new ApiError('Email already in use', 400);
      }
      updates.email = email;
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError('No updates provided', 400);
    }

    // Update user
    const updateFields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const updateValues = [...Object.values(updates), req.user.id];
    
    await pool.query(
      `UPDATE users SET ${updateFields} WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const user = await User.findById(req.user.id);
    
    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      createdAt: user.created_at
    });
  } catch (error) {
    next(error);
  }
});

// Questionnaire endpoints
router.post('/questionnaire', authenticateToken, async (req, res, next) => {
  try {
    const { responses } = req.body;
    const userId = req.user.id;
    
    if (!responses) {
      throw new ApiError('Questionnaire responses are required', 400);
    }

    // Check if user already has a questionnaire
    const [existingQuestionnaire] = await pool.query(
      'SELECT id FROM questionnaires WHERE user_id = ?',
      [userId]
    );

    const questionnaireId = existingQuestionnaire.length > 0 
      ? existingQuestionnaire[0].id 
      : uuidv4();
    
    const now = new Date();
    const responsesJson = JSON.stringify(responses);

    if (existingQuestionnaire.length > 0) {
      // Update existing questionnaire
      await pool.query(
        'UPDATE questionnaires SET responses = ?, updated_at = ? WHERE id = ?',
        [responsesJson, now, questionnaireId]
      );
    } else {
      // Create new questionnaire
      await pool.query(
        'INSERT INTO questionnaires (id, user_id, responses, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [questionnaireId, userId, responsesJson, now, now]
      );
    }

    res.status(existingQuestionnaire.length > 0 ? 200 : 201).json({
      id: questionnaireId,
      userId,
      responses,
      updatedAt: now
    });
  } catch (error) {
    next(error);
  }
});

router.get('/questionnaire', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const [questionnaires] = await pool.query(
      'SELECT * FROM questionnaires WHERE user_id = ?',
      [userId]
    );

    if (questionnaires.length === 0) {
      throw new ApiError('Questionnaire not found', 404);
    }

    const questionnaire = questionnaires[0];
    
    res.json({
      id: questionnaire.id,
      userId: questionnaire.user_id,
      responses: JSON.parse(questionnaire.responses),
      createdAt: questionnaire.created_at,
      updatedAt: questionnaire.updated_at
    });
  } catch (error) {
    next(error);
  }
});

export default router;