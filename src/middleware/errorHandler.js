import { logger } from '../utils/logger.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    logger.error('Error occurred:', err);

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
    } else if (err.message.includes('API key')) {
        statusCode = 500;
        message = 'Server configuration error. Please contact support.';
    } else if (err.message.includes('quota')) {
        statusCode = 429;
        message = 'API quota exceeded. Please try again later.';
    } else if (err.message.includes('rate limit')) {
        statusCode = 429;
        message = 'Too many requests. Please try again later.';
    } else if (err.message.includes('not available')) {
        statusCode = 503;
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
