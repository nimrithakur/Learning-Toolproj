import { logger } from '../utils/logger.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Log the full error for debugging - console.error for Vercel logs
    console.error('Error occurred:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    logger.error('Error occurred:', err);
    logger.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));

    // Default error
    let statusCode = 500;
    let message = 'An unexpected error occurred. Please try again.';

    // Handle specific error types
    if (err.message.includes('transcript')) {
        statusCode = 404;
        message = err.message;
    } else if (err.message.includes('Invalid')) {
        statusCode = 400;
        message = err.message;
    } else if (err.message.includes('API key') || err.message.includes('GEMINI_API_KEY')) {
        statusCode = 500;
        message = 'Server configuration error. Please contact support.';
    } else if (err.message.includes('quota')) {
        statusCode = 429;
        message = 'API quota exceeded. Please try again later.';
    } else if (err.message.includes('rate limit')) {
        statusCode = 429;
        message = 'Too many requests. Please try again later.';
    } else if (err.message.includes('not available') || err.message.includes('not found for API version')) {
        statusCode = 503;
        message = 'AI service temporarily unavailable. Please try again.';
    } else if (err.status === 404 && err.message.includes('model')) {
        statusCode = 503;
        message = 'AI model configuration error. Please contact support.';
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            details: err.message 
        })
    });
};
