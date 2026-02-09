# Learning Tool Backend

Backend API for Smart Video Learning Tool - AI-powered video transcript processing

## 🚀 Deployment on Vercel

This backend is configured to deploy on Vercel.

### Environment Variables Required

Set these in your Vercel project settings:

```env
GEMINI_API_KEY=your-google-gemini-api-key
NODE_ENV=production
AI_MODEL=gemini-2.5-flash
AI_TEMPERATURE=0.7
MAX_TOKENS=2000
CACHE_TTL=3600
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Deploy to Vercel

1. **Via Vercel CLI:**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Via GitHub Integration:**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically deploy on each push

3. **Important**: Don't forget to add all environment variables in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add each variable from your `.env` file

## 📡 API Endpoints

- `POST /api/process-youtube` - Process YouTube video
- `POST /api/process-transcript` - Process pasted transcript

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start
```

## 📦 Tech Stack

- Node.js + Express
- Google Gemini AI
- YouTube Transcript API
- Rate Limiting & Caching

## 🔧 Configuration

The backend is configured with:
- CORS enabled for all origins (configure for production)
- Rate limiting: 100 requests per 15 minutes
- Response caching with configurable TTL
- Comprehensive error handling and logging

## 🔒 Security Notes

- Never commit `.env` file to Git
- Always set environment variables in Vercel dashboard
- Update CORS settings for production use
- Monitor API usage and costs
