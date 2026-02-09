import express from 'express';
import { processVideo, processTranscript } from '../controllers/learning.controller.js';
import { validateVideoUrl, validateTranscript } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API is running',
        timestamp: new Date().toISOString(),
        env: {
            hasApiKey: !!process.env.GEMINI_API_KEY,
            model: process.env.AI_MODEL || 'not set'
        }
    });
});

/**
 * @route   POST /api/process
 * @desc    Process YouTube video and generate learning materials
 * @access  Public (rate-limited)
 */
router.post('/process', validateVideoUrl, processVideo);
router.post('/process-youtube', validateVideoUrl, processVideo); // Alias

/**
 * @route   POST /api/process-transcript
 * @desc    Process pasted transcript and generate learning materials
 * @access  Public (rate-limited)
 */
router.post('/process-transcript', validateTranscript, processTranscript);

export default router;
