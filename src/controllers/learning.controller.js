import { TranscriptService } from '../services/transcript.service.js';
import { AIService } from '../services/ai.service.js';
import { CacheManager } from '../utils/cache.js';
import { logger } from '../utils/logger.js';

/**
 * Main controller for processing YouTube videos
 * Orchestrates transcript extraction and AI processing
 */
export const processVideo = async (req, res, next) => {
    const startTime = Date.now();
    
    try {
        const { videoUrl } = req.body;
        
        // Extract video ID from URL
        const videoId = extractVideoId(videoUrl);
        
        if (!videoId) {
            return res.status(400).json({
                success: false,
                error: 'Invalid YouTube URL. Please provide a valid video URL.'
            });
        }

        logger.info(`Processing video: ${videoId}`);

        // Check cache first
        const cachedResult = CacheManager.get(videoId);
        if (cachedResult) {
            logger.info(`Cache hit for video: ${videoId}`);
            return res.json({
                success: true,
                data: cachedResult,
                cached: true
            });
        }

        // Step 1: Fetch transcript
        logger.info('Fetching transcript...');
        const transcript = await TranscriptService.getTranscript(videoId);
        
        if (!transcript || transcript.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No transcript available for this video. Please try a video with captions/subtitles enabled.'
            });
        }

        // Step 2: Process with AI
        logger.info('Processing with AI...');
        const aiResult = await AIService.processTranscript(transcript, videoId);

        // Step 3: Build response
        const result = {
            videoId,
            videoUrl,
            title: aiResult.title || 'Educational Video',
            summary: aiResult.summary,
            keyPoints: aiResult.keyPoints,
            quiz: aiResult.quiz,
            metadata: {
                transcriptLength: transcript.length,
                processingTime: Date.now() - startTime,
                generatedAt: new Date().toISOString()
            }
        };

        // Cache the result (1 hour TTL)
        CacheManager.set(videoId, result);

        logger.info(`Successfully processed video ${videoId} in ${Date.now() - startTime}ms`);

        res.json({
            success: true,
            data: result,
            cached: false
        });

    } catch (error) {
        logger.error('Error processing video:', error);
        next(error);
    }
};

/**
 * Process transcript directly (without YouTube URL)
 * Generate quiz and learning materials from pasted transcript
 */
export const processTranscript = async (req, res, next) => {
    const startTime = Date.now();
    
    try {
        const { transcript } = req.body;
        
        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Transcript is required'
            });
        }

        logger.info('Processing pasted transcript...');

        // Generate unique ID for caching (hash of transcript)
        const transcriptId = generateTranscriptHash(transcript);

        // Check cache first
        const cachedResult = CacheManager.get(`transcript_${transcriptId}`);
        if (cachedResult) {
            logger.info(`Cache hit for transcript: ${transcriptId}`);
            return res.json({
                success: true,
                data: cachedResult,
                cached: true
            });
        }

        // Process with AI
        logger.info('Processing transcript with AI...');
        const aiResult = await AIService.processTranscript(transcript, null);

        // Build response
        const result = {
            title: aiResult.title || 'Custom Transcript',
            summary: aiResult.summary,
            keyPoints: aiResult.keyPoints,
            quiz: aiResult.quiz,
            metadata: {
                transcriptLength: transcript.length,
                processingTime: Date.now() - startTime,
                generatedAt: new Date().toISOString()
            }
        };

        // Cache the result (1 hour TTL)
        CacheManager.set(`transcript_${transcriptId}`, result);

        logger.info(`Successfully processed transcript in ${Date.now() - startTime}ms`);

        res.json({
            success: true,
            data: result,
            cached: false
        });

    } catch (error) {
        logger.error('Error processing transcript:', error);
        next(error);
    }
};

/**
 * Generate a simple hash for transcript caching
 */
function generateTranscriptHash(transcript) {
    // Simple hash function for caching purposes
    let hash = 0;
    const str = transcript.substring(0, 1000); // Use first 1000 chars for hash
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractVideoId(url) {
    try {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    } catch (error) {
        return null;
    }
}
