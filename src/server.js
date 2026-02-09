import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import learningRouter from './routes/learning.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

// ES Module __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables - for local development
// Vercel will use environment variables from dashboard
dotenv.config({ path: path.join(__dirname, '../.env') });

// Log environment status for debugging
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('AI_MODEL:', process.env.AI_MODEL);

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        error: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

// ========================================
// ROUTES
// ========================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Learning API routes
app.use('/api', learningRouter);

// Root route - API info
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Learning Tool API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            processYouTube: 'POST /api/process-youtube',
            processTranscript: 'POST /api/process-transcript'
        }
    });
});

// ========================================
// ERROR HANDLING
// ========================================

app.use(errorHandler);

// ========================================
// SERVER STARTUP
// ========================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎓 Smart Video Learning Tool - Server Running          ║
║                                                           ║
║   📍 URL: http://localhost:${PORT}                       ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}               ║
║   🤖 AI Model: ${process.env.AI_MODEL || 'gemini-2.5-flash'}           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
        console.warn(`
⚠️  WARNING: GEMINI_API_KEY not found in .env file!
   Please add your API key to continue.
        `);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
