import { YoutubeTranscript } from 'youtube-transcript';
import { logger } from '../utils/logger.js';

/**
 * Service for extracting and processing YouTube video transcripts
 */
export class TranscriptService {
    /**
     * Fetch transcript for a YouTube video
     * @param {string} videoId - YouTube video ID
     * @returns {Promise<string>} - Cleaned transcript text
     */
    static async getTranscript(videoId) {
        try {
            logger.info(`Fetching transcript for video: ${videoId}`);

            // Fetch transcript segments
            const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

            if (!transcriptData || transcriptData.length === 0) {
                throw new Error('No transcript available');
            }

            // Combine all text segments
            const fullTranscript = transcriptData
                .map(segment => segment.text)
                .join(' ');

            // Clean the transcript
            const cleanedTranscript = this.cleanTranscript(fullTranscript);

            logger.info(`Transcript fetched: ${cleanedTranscript.length} characters`);

            return cleanedTranscript;

        } catch (error) {
            logger.error(`Error fetching transcript for ${videoId}:`, error.message);

            // Provide specific error messages
            if (error.message.includes('Transcript is disabled')) {
                throw new Error('Transcripts are disabled for this video');
            } else if (error.message.includes('Could not find')) {
                throw new Error('Video not found or transcripts not available');
            } else {
                throw new Error('Failed to fetch transcript. Please ensure the video has captions enabled.');
            }
        }
    }

    /**
     * Clean and normalize transcript text
     * @param {string} text - Raw transcript text
     * @returns {string} - Cleaned text
     */
    static cleanTranscript(text) {
        return text
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove special characters and artifacts
            .replace(/\[.*?\]/g, '')
            .replace(/\(.*?\)/g, '')
            // Remove music/sound notations
            .replace(/♪/g, '')
            // Trim
            .trim();
    }

    /**
     * Segment transcript into chunks for better AI processing
     * @param {string} transcript - Full transcript
     * @param {number} maxLength - Maximum chunk length
     * @returns {Array<string>} - Array of transcript chunks
     */
    static segmentTranscript(transcript, maxLength = 8000) {
        const words = transcript.split(' ');
        const chunks = [];
        let currentChunk = '';

        for (const word of words) {
            if ((currentChunk + word).length > maxLength) {
                chunks.push(currentChunk.trim());
                currentChunk = word + ' ';
            } else {
                currentChunk += word + ' ';
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    /**
     * Get transcript statistics
     * @param {string} transcript - Transcript text
     * @returns {Object} - Statistics object
     */
    static getStats(transcript) {
        const words = transcript.split(/\s+/).length;
        const characters = transcript.length;
        const estimatedMinutes = Math.ceil(words / 150); // Average reading speed

        return {
            words,
            characters,
            estimatedReadingTime: `${estimatedMinutes} min`
        };
    }
}
