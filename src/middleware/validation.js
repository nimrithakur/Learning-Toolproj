/**
 * Validation middleware for API requests
 */

/**
 * Validate YouTube video URL
 */
export const validateVideoUrl = (req, res, next) => {
    const { videoUrl } = req.body;

    if (!videoUrl) {
        return res.status(400).json({
            success: false,
            error: 'Video URL is required'
        });
    }

    if (typeof videoUrl !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'Video URL must be a string'
        });
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    
    if (!youtubeRegex.test(videoUrl)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid YouTube URL format. Please provide a valid YouTube video link.'
        });
    }

    next();
};

/**
 * Validate pasted transcript
 */
export const validateTranscript = (req, res, next) => {
    const { transcript } = req.body;

    if (!transcript) {
        return res.status(400).json({
            success: false,
            error: 'Transcript is required'
        });
    }

    if (typeof transcript !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'Transcript must be a string'
        });
    }

    // Check minimum length (at least 100 characters)
    if (transcript.trim().length < 100) {
        return res.status(400).json({
            success: false,
            error: 'Transcript is too short. Please provide at least 100 characters of content.'
        });
    }

    // Check maximum length (max 50,000 characters to avoid token limits)
    if (transcript.length > 50000) {
        return res.status(400).json({
            success: false,
            error: 'Transcript is too long. Please limit to 50,000 characters.'
        });
    }

    next();
};
