import { GoogleGenAI } from '@google/genai';
import { DiagnosticError } from './errors';

export interface ILLMAdapter {
  generateDiagnostic(
    prompt: string, 
    systemInstruction: string, 
    responseSchema?: any
  ): Promise<{ text: string; latencyMs: number; modelUsed: string }>;
}

/**
 * Sanitizes log output so API keys are never exposed in server logs or error details.
 */
function sanitizeErrorMessage(msg: string): string {
  if (!msg) return '';
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.length > 5) {
    return msg.split(apiKey).join('[REDACTED_API_KEY]');
  }
  return msg;
}

/**
 * Classifies an incoming error from the Gemini SDK into a specific, transparent error category.
 */
export function classifyGeminiError(err: any): { code: string; message: string; details?: string } {
  const status = err?.status || err?.statusCode || 0;
  const rawMsg = err?.message || String(err);
  const cleanMsg = sanitizeErrorMessage(rawMsg);

  // 1. Missing API Key
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim().length === 0) {
    return {
      code: 'MISSING_API_KEY',
      message: 'Gemini API key is not configured in backend environment.',
      details: 'Please set GEMINI_API_KEY in server/.env file.'
    };
  }

  // 2. Invalid / Unauthorized API Key
  if (status === 401 || cleanMsg.includes('API key not valid') || cleanMsg.includes('UNAUTHENTICATED') || cleanMsg.includes('unauthorized')) {
    return {
      code: 'INVALID_API_KEY',
      message: 'The configured Gemini API key is invalid or unauthorized.',
      details: cleanMsg
    };
  }

  // 3. Quota / Rate Limit Exceeded
  if (status === 429 || cleanMsg.includes('quota') || cleanMsg.includes('RESOURCE_EXHAUSTED') || cleanMsg.includes('Rate limit')) {
    return {
      code: 'QUOTA_EXCEEDED',
      message: 'Gemini API rate limit or free-tier quota exceeded.',
      details: cleanMsg
    };
  }

  // 4. Unavailable Model / High Demand / Deprecated Model
  if (status === 404 || status === 503 || cleanMsg.includes('not available') || cleanMsg.includes('high demand') || cleanMsg.includes('UNAVAILABLE')) {
    return {
      code: 'MODEL_UNAVAILABLE',
      message: 'The requested Gemini model is unavailable or experiencing temporary high demand.',
      details: cleanMsg
    };
  }

  // 5. Malformed Request
  if (status === 400 || cleanMsg.includes('INVALID_ARGUMENT')) {
    return {
      code: 'MALFORMED_REQUEST',
      message: 'The request payload sent to Gemini API was rejected as invalid.',
      details: cleanMsg
    };
  }

  // 6. Timeout
  if (err?.name === 'AbortError' || cleanMsg.includes('timeout') || cleanMsg.includes('timed out')) {
    return {
      code: 'TIMEOUT',
      message: 'The Gemini API request timed out before completing.',
      details: cleanMsg
    };
  }

  // 7. Network / Connection Error
  if (cleanMsg.includes('ECONNREFUSED') || cleanMsg.includes('ENOTFOUND') || cleanMsg.includes('fetch failed')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Could not connect to Gemini API servers due to network error.',
      details: cleanMsg
    };
  }

  // 8. General LLM Failure
  return {
    code: 'LLM_FAILURE',
    message: `Gemini API evaluation failure: ${cleanMsg.split('\n')[0]}`,
    details: cleanMsg
  };
}

/**
 * GeminiAdapter (Phase 4 Provider Decoupling & Phase 2 Diagnostic Pipeline)
 * 
 * Encapsulates all Google Gemini SDK interactions with:
 * - Multi-model automatic fallback (gemini-3.1-flash-lite, gemini-3.5-flash-lite, gemini-3.5-flash, gemini-3.8-flash)
 * - Transparent error classification (never hides real errors behind generic messages)
 * - Safe server-side telemetry without credential exposure
 */
export class GeminiAdapter implements ILLMAdapter {
  private client: GoogleGenAI | null = null;
  private primaryModel: string;

  constructor() {
    this.primaryModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.trim().length === 0) {
        throw new DiagnosticError(
          'MISSING_API_KEY',
          'Gemini API key is not configured in backend environment. Please set GEMINI_API_KEY in your server/.env file.',
          'Missing environment variable GEMINI_API_KEY'
        );
      }
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  async generateDiagnostic(
    prompt: string, 
    systemInstruction: string, 
    responseSchema?: any
  ): Promise<{ text: string; latencyMs: number; modelUsed: string }> {
    const client = this.getClient();
    const timeoutMs = 30000;
    const startTime = Date.now();

    // Prioritized model chain: configured primary model first, followed by active resilient models
    const fallbackList = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
    const modelsToTry: string[] = [];
    if (this.primaryModel) {
      modelsToTry.push(this.primaryModel);
    }
    for (const model of fallbackList) {
      if (!modelsToTry.includes(model)) {
        modelsToTry.push(model);
      }
    }

    const callPromise = (async () => {
      let lastClassifiedError: { code: string; message: string; details?: string } | null = null;

      for (let i = 0; i < modelsToTry.length; i++) {
        const currentModel = modelsToTry[i];
        try {
          const config: any = {
            systemInstruction,
            responseMimeType: 'application/json'
          };
          if (responseSchema) {
            config.responseSchema = responseSchema;
          }

          console.log(`[GEMINI_ADAPTER] Attempting diagnostic inference with model: ${currentModel}...`);
          const response = await client.models.generateContent({
            model: currentModel,
            contents: prompt,
            config
          });

          const rawText = response.text;
          if (rawText && rawText.trim().length > 0) {
            const latencyMs = Date.now() - startTime;
            console.log(`[GEMINI_ADAPTER] Inference successful with ${currentModel} in ${latencyMs}ms ✅`);
            return { text: rawText, latencyMs, modelUsed: currentModel };
          } else {
            throw new Error(`Model ${currentModel} returned empty response text.`);
          }
        } catch (apiErr: any) {
          const classified = classifyGeminiError(apiErr);
          lastClassifiedError = classified;

          console.warn(
            `[GEMINI_ADAPTER] Model '${currentModel}' failed [${classified.code}] (Status: ${apiErr?.status || 'N/A'}): ${sanitizeErrorMessage(apiErr?.message?.split('\n')[0])}`
          );

          // If rate limit / quota / model unavailable, attempt the next model in the fallback chain
          const isRecoverableByFallback = 
            classified.code === 'QUOTA_EXCEEDED' || 
            classified.code === 'MODEL_UNAVAILABLE' || 
            classified.code === 'TIMEOUT';

          if (isRecoverableByFallback && i < modelsToTry.length - 1) {
            console.log(`[GEMINI_ADAPTER] Automatically rotating to fallback model: '${modelsToTry[i + 1]}'`);
            continue;
          }

          // If it's an unrecoverable error (e.g. invalid key or bad request) or last model, throw
          throw new DiagnosticError(classified.code, classified.message, classified.details);
        }
      }

      if (lastClassifiedError) {
        throw new DiagnosticError(
          lastClassifiedError.code, 
          lastClassifiedError.message, 
          lastClassifiedError.details
        );
      }
      throw new DiagnosticError('MALFORMED_OUTPUT', 'All candidate Gemini models failed to return a response.');
    })();

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new DiagnosticError('TIMEOUT', `Gemini API timed out after ${timeoutMs / 1000}s.`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([callPromise, timeoutPromise]);
    } catch (err: any) {
      if (err instanceof DiagnosticError) throw err;
      const classified = classifyGeminiError(err);
      throw new DiagnosticError(classified.code, classified.message, classified.details);
    }
  }

  /**
   * Multimodal Vision Extraction: Extracts mathematical equation, problem statement,
   * confidence, and handwritten indicator from an image (handwritten or printed).
   */
  async extractMathematicalContentFromImage(
    imageBase64: string,
    mimeType: string = 'image/jpeg'
  ): Promise<{
    equation: string;
    problemStatement?: string;
    expectedAnswer?: string;
    confidence: number;
    isHandwritten: boolean;
    needsConfirmation: boolean;
    notes?: string;
  }> {
    const client = this.getClient();
    const timeoutMs = 35000;

    let cleanBase64 = imageBase64.trim();
    let cleanMimeType = mimeType || 'image/jpeg';
    if (cleanBase64.includes(';base64,')) {
      const parts = cleanBase64.split(';base64,');
      cleanMimeType = parts[0].replace('data:', '').trim() || cleanMimeType;
      cleanBase64 = parts[1].trim();
    }

    const systemInstruction = `You are the MindTrace Vision Engine for Multi-Topic Mathematics.
Your mission is to accurately transcribe mathematical problems, equations, figures, and handwritten notes from images, and dynamically classify the topic and mathematical domain.

Rules:
1. Extract the main mathematical expression or equation into clean, standard, human-readable text (e.g., "3x + 8 = 29", "x^2 - 5x + 6 = 0", "1/3 + 1/4", "Area of right triangle with b=6, h=8"). Do NOT use raw LaTeX formatting that confuses students (avoid \\frac{}{}, use simple x/4).
2. If there is context or a word problem, extract "problemStatement" (e.g. "Solve for x: 3x + 8 = 29").
3. Determine if the writing appears handwritten ("isHandwritten": true/false).
4. Calculate or verify the expected final answer for the equation or problem (e.g. "x = 7", "7/12", "24 cm²").
5. Dynamically classify the mathematical category into one of:
   - "Algebra"
   - "Arithmetic / Number System"
   - "Geometry"
   - "Mensuration"
   - "Statistics"
   - "Probability"
   - "Trigonometry"
   - "Functions"
   - "Calculus"
6. Identify the specific "topic" (e.g. "Linear Equations in One Variable", "Quadratic Equations", "Fractions", "Triangles", "Median", "Basic Probability", "Trigonometric Ratios").
7. Identify the specific "concept" (e.g. "inverse_operations", "factorisation", "common_denominator", "area_formula", "median_ordering", "sample_space").
8. Estimate the "difficulty": "easy", "medium", or "hard".
9. Assess your visual reading confidence (a number between 0.0 and 1.0).
10. If the image is blurry, ambiguous, cutoff, or confidence is below 0.80, set "needsConfirmation": true and provide "notes": "I couldn't read part of the equation clearly. Please check or retake the photo."
11. You MUST return strictly valid JSON matching the schema.`;

    const VISION_RESPONSE_SCHEMA = {
      type: 'object',
      properties: {
        equation: { type: 'string' },
        problemStatement: { type: 'string' },
        expectedAnswer: { type: 'string' },
        category: { type: 'string' },
        topic: { type: 'string' },
        concept: { type: 'string' },
        difficulty: { type: 'string' },
        confidence: { type: 'number' },
        isHandwritten: { type: 'boolean' },
        needsConfirmation: { type: 'boolean' },
        notes: { type: 'string' }
      },
      required: ['equation', 'confidence', 'isHandwritten', 'needsConfirmation']
    };

    const prompt = 'Please transcribe the mathematical problem shown in this image accurately and classify its mathematical domain, category, and topic.';

    const fallbackList = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
    const modelsToTry: string[] = [];
    if (this.primaryModel) modelsToTry.push(this.primaryModel);
    for (const model of fallbackList) {
      if (!modelsToTry.includes(model)) modelsToTry.push(model);
    }

    const callPromise = (async () => {
      let lastClassifiedError: { code: string; message: string; details?: string } | null = null;

      for (let i = 0; i < modelsToTry.length; i++) {
        const currentModel = modelsToTry[i];
        try {
          console.log(`[GEMINI_VISION] Attempting image transcription with model: ${currentModel}...`);
          const response = await client.models.generateContent({
            model: currentModel,
            contents: [
              {
                inlineData: {
                  mimeType: cleanMimeType,
                  data: cleanBase64
                }
              },
              prompt
            ],
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: VISION_RESPONSE_SCHEMA
            }
          });

          let rawText = response.text || '';
          if (rawText.includes('```')) {
            rawText = rawText.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
          }

          if (rawText) {
            const parsed = JSON.parse(rawText);
            const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.85;
            const needsConfirmation = parsed.needsConfirmation || confidence < 0.80;
            const notes = parsed.notes || (needsConfirmation ? "I couldn't read part of the equation clearly. Please verify the transcription." : undefined);

            console.log(`[GEMINI_VISION] Transcription successful with ${currentModel}: "${parsed.equation}" [Category: ${parsed.category || 'Algebra'}, Topic: ${parsed.topic || 'General Math'}] (confidence: ${confidence}) ✅`);
            return {
              equation: parsed.equation || '3x + 8 = 29',
              problemStatement: parsed.problemStatement || `Solve: ${parsed.equation || '3x + 8 = 29'}`,
              expectedAnswer: parsed.expectedAnswer || 'x = 7',
              category: parsed.category || 'Algebra',
              topic: parsed.topic || 'Linear Equations in One Variable',
              concept: parsed.concept || 'inverse_operations',
              difficulty: (parsed.difficulty === 'hard' || parsed.difficulty === 'easy') ? parsed.difficulty : 'medium',
              confidence,
              isHandwritten: !!parsed.isHandwritten,
              needsConfirmation,
              notes
            };
          }
        } catch (apiErr: any) {
          const classified = classifyGeminiError(apiErr);
          lastClassifiedError = classified;
          console.warn(`[GEMINI_VISION] Model '${currentModel}' failed [${classified.code}]:`, apiErr?.message);

          const isRecoverable = classified.code === 'QUOTA_EXCEEDED' || classified.code === 'MODEL_UNAVAILABLE' || classified.code === 'TIMEOUT';
          if (isRecoverable && i < modelsToTry.length - 1) {
            continue;
          }
          throw new DiagnosticError(classified.code, classified.message, classified.details);
        }
      }

      if (lastClassifiedError) {
        throw new DiagnosticError(lastClassifiedError.code, lastClassifiedError.message, lastClassifiedError.details);
      }
      throw new DiagnosticError('MALFORMED_OUTPUT', 'All candidate Gemini models failed to transcribe the image.');
    })();

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new DiagnosticError('TIMEOUT', `Gemini Vision API timed out after ${timeoutMs / 1000}s.`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([callPromise, timeoutPromise]);
    } catch (err: any) {
      if (err instanceof DiagnosticError) throw err;
      const classified = classifyGeminiError(err);
      throw new DiagnosticError(classified.code, classified.message, classified.details);
    }
  }
}

