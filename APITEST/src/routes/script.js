import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { generateScript } from '../services/openai.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * Generate a script using OpenAI
 * POST /script/generate
 */
router.post('/generate', authenticateToken, async (req, res, next) => {
  try {
    const { scriptResponses, businessProfile, userName } = req.body;
    
    if (!scriptResponses) {
      throw new ApiError('Script responses are required', 400);
    }
    
    // Log the request
    logger.info(`Generating script for user ${req.user.id}`);
    
    // Generate the script
    const script = await generateScript({
      scriptResponses,
      businessProfile,
      userName
    });
    
    // Log success
    logger.info(`Script generated successfully for user ${req.user.id}`);
    
    // Return the generated script
    res.json({
      script,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Script generation error: ${error.message}`);
    next(error);
  }
});

export default router;