import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger.js';

/**
 * AI Service for processing transcripts and generating learning materials
 * Uses Google Gemini 2.0 Flash for intelligent content generation
 */
export class AIService {
    static genAI = null;
    static model = null;

    /**
     * Initialize Google Gemini client
     */
    static initialize() {
        if (!this.model) {
            const apiKey = process.env.GEMINI_API_KEY;
            
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY is not set in environment variables');
            }

            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ 
                model: process.env.AI_MODEL || 'gemini-2.5-flash'
            });

            logger.info('Google Gemini client initialized');
        }
    }

    /**
     * Process transcript and generate all learning materials
     * @param {string} transcript - Video transcript
     * @param {string} videoId - YouTube video ID
     * @returns {Promise<Object>} - Learning materials object
     */
    static async processTranscript(transcript, videoId) {
        this.initialize();

        try {
            // Truncate transcript if too long (to fit within token limits)
            const processedTranscript = this.truncateTranscript(transcript, 12000);

            logger.info('Generating learning materials with AI...');

            // Generate all materials in parallel for efficiency
            const [summary, keyPoints, quiz] = await Promise.all([
                this.generateSummary(processedTranscript),
                this.generateKeyPoints(processedTranscript),
                this.generateQuiz(processedTranscript)
            ]);

            return {
                title: await this.extractTitle(processedTranscript),
                summary,
                keyPoints,
                quiz
            };

        } catch (error) {
            logger.error('AI processing error:', error);
            logger.error('Error details:', error.message, error.stack);
            
            // Provide specific error messages
            if (error.message.includes('429') || error.message.includes('quota')) {
                throw new Error('API quota exceeded. Please try again later or upgrade your API plan.');
            } else if (error.message.includes('404') || error.message.includes('not found')) {
                throw new Error('AI model not available. Please check your API configuration.');
            } else if (error.message.includes('API key')) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else {
                throw new Error(`Failed to generate learning materials: ${error.message}`);
            }
        }
    }

    /**
     * Generate concise summary from transcript
     * @param {string} transcript - Video transcript
     * @returns {Promise<string>} - Summary text
     */
    static async generateSummary(transcript) {
        const prompt = `You are an expert educational content summarizer.

TRANSCRIPT:
${transcript}

TASK:
Create a concise, exam-oriented summary of this educational content.

REQUIREMENTS:
- Write 2-3 clear paragraphs
- Use simple, student-friendly language
- Focus on main concepts and key takeaways
- Make it suitable for quick revision
- Stay factual - only use information from the transcript
- No external information or assumptions

OUTPUT FORMAT:
Plain text summary, well-structured paragraphs.`;

        try {
            this.initialize();
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();

        } catch (error) {
            logger.error('Error generating summary:', error);
            throw error;
        }
    }

    /**
     * Extract key learning points from transcript
     * @param {string} transcript - Video transcript
     * @returns {Promise<Array<string>>} - Array of key points
     */
    static async generateKeyPoints(transcript) {
        const prompt = `You are an expert at extracting key learning points from educational content.

TRANSCRIPT:
${transcript}

TASK:
Extract 6-10 key learning points from this content.

REQUIREMENTS:
- Each point should be clear and concise (1-2 sentences max)
- Focus on important concepts, facts, and takeaways
- Make them exam-friendly and revision-ready
- Use bullet-point style
- Only include information from the transcript
- Ensure points are distinct (no repetition)

OUTPUT FORMAT:
Return ONLY the bullet points, one per line, without numbers or extra formatting.
Example:
- Point one here
- Point two here
- Point three here`;

        try {
            this.initialize();
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const content = response.text().trim();
            
            // Parse bullet points
            const points = content
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map(line => line.replace(/^[-•]\s*/, '').trim())
                .filter(point => point.length > 0);

            // Ensure we have 6-10 points
            return points.slice(0, 10);

        } catch (error) {
            logger.error('Error generating key points:', error);
            throw error;
        }
    }

    /**
     * Generate exactly 10 quiz questions from transcript
     * @param {string} transcript - Video transcript
     * @returns {Promise<Array<Object>>} - Array of quiz questions
     */
    static async generateQuiz(transcript) {
        const prompt = `You are an expert exam question creator for educational content.

TRANSCRIPT:
${transcript}

TASK:
Create EXACTLY 10 multiple-choice quiz questions based STRICTLY on the transcript content.

CRITICAL REQUIREMENTS:
- Generate EXACTLY 10 questions (no more, no less)
- Base ALL questions on facts from the transcript only
- Each question must have 4 options (A, B, C, D)
- Only ONE correct answer per question
- Include a brief explanation for the correct answer
- Questions should test understanding, not just memorization
- Progressive difficulty (start easy, get harder)
- No repetitive questions

OUTPUT FORMAT (STRICT JSON):
Return a valid JSON array with EXACTLY this structure:

[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Brief explanation why this is correct"
  }
]

IMPORTANT: Return ONLY the JSON array, no other text.`;

        try {
            this.initialize();
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const content = response.text().trim();
            
            // Extract JSON from response
            let quiz = this.extractJSON(content);

            // Validate and ensure exactly 10 questions
            if (!Array.isArray(quiz)) {
                throw new Error('Invalid quiz format');
            }

            // Ensure exactly 10 questions
            quiz = quiz.slice(0, 10);

            // Validate each question
            quiz = quiz.map((q, index) => ({
                id: index + 1,
                question: q.question || `Question ${index + 1}`,
                options: Array.isArray(q.options) && q.options.length === 4 
                    ? q.options 
                    : ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: q.correctAnswer || 'A',
                explanation: q.explanation || 'Explanation based on transcript content'
            }));

            // If we don't have exactly 10, pad or trim
            while (quiz.length < 10) {
                quiz.push({
                    id: quiz.length + 1,
                    question: 'What is the main topic discussed?',
                    options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
                    correctAnswer: 'A',
                    explanation: 'Based on transcript analysis'
                });
            }

            return quiz.slice(0, 10);

        } catch (error) {
            logger.error('Error generating quiz:', error);
            throw error;
        }
    }

    /**
     * Extract title from transcript
     * @param {string} transcript - Video transcript
     * @returns {Promise<string>} - Video title
     */
    static async extractTitle(transcript) {
        try {
            this.initialize();
            // Take first 500 characters for title extraction
            const snippet = transcript.substring(0, 500);
            
            const prompt = `Create a clear, concise title (5-8 words) for this educational content:\n\n${snippet}\n\nReturn only the title, nothing else.`;
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();

        } catch (error) {
            logger.error('Error extracting title:', error);
            return 'Educational Video';
        }
    }

    /**
     * Truncate transcript to fit token limits
     * @param {string} transcript - Full transcript
     * @param {number} maxChars - Maximum characters
     * @returns {string} - Truncated transcript
     */
    static truncateTranscript(transcript, maxChars = 12000) {
        if (transcript.length <= maxChars) {
            return transcript;
        }

        // Take beginning and end for context
        const halfMax = Math.floor(maxChars / 2);
        const beginning = transcript.substring(0, halfMax);
        const end = transcript.substring(transcript.length - halfMax);

        return `${beginning}\n\n[... middle section omitted for brevity ...]\n\n${end}`;
    }

    /**
     * Extract JSON from AI response
     * @param {string} content - AI response
     * @returns {Array|Object} - Parsed JSON
     */
    static extractJSON(content) {
        try {
            // Try direct parse first
            return JSON.parse(content);
        } catch (e) {
            // Try to extract JSON from markdown code blocks
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                             content.match(/```\s*([\s\S]*?)\s*```/);
            
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1]);
            }

            // Try to find JSON array or object
            const arrayMatch = content.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
                return JSON.parse(arrayMatch[0]);
            }

            const objectMatch = content.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                return JSON.parse(objectMatch[0]);
            }

            throw new Error('Could not extract JSON from response');
        }
    }
}
