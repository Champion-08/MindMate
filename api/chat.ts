import type { VercelRequest, VercelResponse } from '@vercel/node';

// Verified against Google Generative Language API
const GEMINI_MODELS = [
  'gemini-3.5-flash',       // Primary: verified available and working
  'gemini-2.5-flash',       // Fallback 1: verified in available model catalog
  'gemini-flash-latest',    // Fallback 2: latest alias
  'gemini-2.5-flash-lite',  // Fallback 3: lightweight alternative
];

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface ModelCallResult {
  ok: boolean;
  text?: string;
  status?: number;
  errorMsg?: string;
  isFatal?: boolean;
}

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string
): Promise<ModelCallResult> {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;

  let res: Response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch (e: any) {
    const isTimeout = e?.name === 'AbortError';
    return {
      ok: false,
      errorMsg: isTimeout ? 'Request timed out' : `Network error: ${e?.message || 'unknown'}`,
      isFatal: false,
    };
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg: string = (data as any)?.error?.message || `HTTP ${res.status}`;
    // 400, 401, 403, 429 are credential, format or quota issues - fatal for current request
    const isFatal = res.status === 400 || res.status === 401 || res.status === 403 || res.status === 429;
    return { ok: false, status: res.status, errorMsg: msg, isFatal };
  }

  const candidate = (data as any)?.candidates?.[0];
  if (candidate?.finishReason === 'SAFETY') {
    return {
      ok: false,
      errorMsg: 'Response filtered for safety. Please rephrase your question.',
      isFatal: true,
    };
  }

  const parts = candidate?.content?.parts;
  const text = Array.isArray(parts) ? parts.map((p: any) => p.text || '').join('') : '';

  if (!text.trim()) {
    return { ok: false, errorMsg: 'Empty response returned by model.', isFatal: false };
  }

  return { ok: true, text };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, topic, learningStyle, masteryLevel, history } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Valid message string is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      content:
        'AI tutor is currently offline. Please configure GEMINI_API_KEY in your deployment environment variables.',
    });
  }

  // Format previous conversation context
  const historyText = Array.isArray(history)
    ? history
        .filter((m: any) => m && m.role && m.content)
        .slice(-8)
        .map((m: { role: string; content: string }) =>
          m.role === 'user' ? `Student: ${m.content}` : `Tutor: ${m.content}`
        )
        .join('\n')
    : '';

  const systemInstructions = [
    'You are MindMate, an adaptive AI tutor for computer science.',
    `Learning style preference: ${learningStyle || 'Examples first'}.`,
    `Current topic: ${topic || 'General'}.`,
    `Mastery level: ${masteryLevel ?? 48}%.`,
    'Guidelines:',
    '- If student asks to simplify, break down previous explanations into intuitive, everyday analogies.',
    '- If student asks for examples, provide clear, concise code blocks.',
    '- Format code inside ``` markdown blocks.',
    '- Keep explanations conversational, structured, and easy to read.',
  ].join('\n');

  const prompt = [
    systemInstructions,
    historyText ? `\nRecent Conversation:\n${historyText}` : '',
    `\nStudent: ${message.trim()}`,
    '\nTutor:',
  ].join('\n');

  let lastError = '';

  for (const model of GEMINI_MODELS) {
    const result = await callGemini(apiKey, model, prompt);

    if (result.ok && result.text) {
      return res.status(200).json({
        content: result.text,
        model,
      });
    }

    lastError = result.errorMsg || 'Unknown provider error';

    // Stop immediately if error is an auth failure or quota limit
    if (result.isFatal) {
      break;
    }
  }

  // Sanitized user-friendly error response (never leaks API key or internal stack)
  let userMessage = 'I could not generate a response right now. Please try again in a moment.';
  if (lastError.includes('quota') || lastError.includes('429')) {
    userMessage = 'Daily AI usage quota reached. Please try again shortly or check back tomorrow.';
  } else if (lastError.includes('API_KEY') || lastError.includes('API key') || lastError.includes('403')) {
    userMessage = 'API configuration error. Please verify GEMINI_API_KEY in deployment settings.';
  } else if (lastError.includes('safety') || lastError.includes('SAFETY')) {
    userMessage = lastError;
  }

  return res.status(200).json({
    content: userMessage,
    status: 'error_fallback',
  });
}
