import { INWORLD_CONFIG } from '@/constants/inworld';

const MIN_CHUNK_SIZE = 500;
const MAX_CHUNK_SIZE = 1900;
const MAX_CONCURRENT_REQUESTS = 1;

interface TextChunk {
    text: string;
    start: number;
    end: number;
}

function findBreakPoint(text: string, minPos: number, maxPos: number): number {
    const searchText = text.slice(0, maxPos);

    let idx = searchText.lastIndexOf('\n\n');
    if (idx >= minPos) return idx + 2;

    idx = searchText.lastIndexOf('\n');
    if (idx >= minPos) return idx + 1;

    const sentenceMatch = searchText.match(/[.!?]["']?\s+|[.!?]["']?$/g);
    if (sentenceMatch) {
        for (let i = searchText.length; i >= minPos; i--) {
            const char = searchText[i];
            const nextChar = searchText[i + 1];
            if (['.', '!', '?'].includes(char)) {
                if (!nextChar || /\s/.test(nextChar)) {
                    return i + 1;
                }
            }
        }
    }

    idx = searchText.lastIndexOf(' ');
    if (idx >= minPos) return idx + 1;

    return maxPos;
}

function chunkText(text: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    let currentPos = 0;

    while (currentPos < text.length) {
        const remaining = text.slice(currentPos);

        if (remaining.length <= MAX_CHUNK_SIZE) {
            chunks.push({
                text: remaining.trim(),
                start: currentPos,
                end: text.length
            });
            break;
        }

        const breakPoint = findBreakPoint(remaining, MIN_CHUNK_SIZE, MAX_CHUNK_SIZE);
        const chunkContent = remaining.slice(0, breakPoint).trim();

        if (chunkContent) {
            chunks.push({
                text: chunkContent,
                start: currentPos,
                end: currentPos + breakPoint
            });
        }
        currentPos += breakPoint;
    }
    return chunks;
}

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function b64Encode(input: string): string {
    let output = '';
    for (
        let block = 0, charCode, i = 0, map = base64Chars;
        input.charAt(i | 0) || (map = '=', i % 1);
        output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
    ) {
        charCode = input.charCodeAt((i += 3 / 4));
        if (charCode > 0xff) {
            throw new Error(
                "'btoa' failed: The string to be encoded contains characters outside of the Latin1 range."
            );
        }
        block = (block << 8) | charCode;
    }
    return output;
}

const getAuthHeader = () => {
    const token = b64Encode(`${INWORLD_CONFIG.KEY}:${INWORLD_CONFIG.SECRET}`);
    return `Basic ${token}`;
};

export async function synthesizeInworldSpeech(
    text: string,
    voiceId: string,
    options: {
        pitch?: number;
        speed?: number;
    } = {}
) {
    try {
        const chunks = chunkText(text);
        console.log(`[TTS] Processing ${chunks.length} chunks...`);

        const synthesizeChunk = async (chunkText: string) => {
            const body = {
                text: chunkText,
                voiceId,
                modelId: INWORLD_CONFIG.TTS_MODEL,
                speakingRate: options.speed || 1.0,
                pitch: options.pitch || 1.0,
                audioEncoding: 'MP3',
            };

            const response = await fetch(`${INWORLD_CONFIG.BASE_URL}/voice`, {
                method: 'POST',
                headers: {
                    'Authorization': getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Inworld API Error: ${errorText}`);
            }

            const data = await response.json();
            return data.audioContent; // This is base64 string
        };

        if (chunks.length === 1) {
            return await synthesizeChunk(chunks[0].text);
        } else {
            // Processing only the first chunk for now to ensure validity
            const audio = await synthesizeChunk(chunks[0].text);
            return audio;
        }
    } catch (error) {
        console.error('synthesizeInworldSpeech error:', error);
        throw error;
    }
}

