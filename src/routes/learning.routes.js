import express from 'express';
import { processVideo, processTranscript } from '../controllers/learning.controller.js';
import { validateVideoUrl, validateTranscript } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/process
 * @desc    Process YouTube video and generate learning materials
 * @access  Public (rate-limited)
 */
router.post('/process', validateVideoUrl, processVideo);

/**
 * @route   POST /api/process-transcript
 * @desc    Process pasted transcript and generate learning materials
 * @access  Public (rate-limited)
 */
router.post('/process-transcript', validateTranscript, processTranscript);

export default router;
