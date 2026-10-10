import type { VercelRequest, VercelResponse } from '@vercel/node';

// Centralized model config — update here only, not throughout the codebase
const GEMINI_MODELS = [
  'gemini-2.0-flash',        // Primary: current stable Flash model
  'gemini-2.0-flash-lite',   // Fallback 1: lighter variant
  'gemini-1.5-flash-latest', // Fallback 2: aliased latest 1.5
  'gemini-pro',              // Fallback 3: classic stable
];

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

async function callGemini(
  apiKey: string,
  model: string,
  prompt: string
): Promise<{ ok: boolean; text?: string; status?: number; errorMsg?: string; notFound?: boolean }> {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    });
  } catch (e: any) {
    return { ok: false, errorMsg: `Network error: ${e?.message}` };
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg: string = (data as any)?.error?.message || `HTTP ${res.status}`;
    const notFound = res.status === 404 || msg.toLowerCase().includes('not found');
    return { ok: false, status: res.status, errorMsg: msg, notFound };
  }

  // Handle safety blocks
  const candidate = (data as any)?.candidates?.[0];
  if (candidate?.finishReason === 'SAFETY') {
    return { ok: false, errorMsg: 'Response blocked by safety filter. Please rephrase.' };
  }

  const text: string = candidate?.content?.parts?.[0]?.text || '';
  if (!text) return { ok: false, errorMsg: 'Empty response from model.' };

  return { ok: true, text };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, topic, learningStyle, masteryLevel, history } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message is required' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[chat] GEMINI_API_KEY not set');
    return res.status(200).json({
      content:
        'AI tutor is not configured yet. Add **GEMINI_API_KEY** to Vercel Environment Variables and redeploy. Get a free key at https://aistudio.google.com/app/apikey',
    });
  }

  // Build prompt
  const historyText = Array.isArray(history)
    ? history
        .slice(-8) // last 8 messages for context window efficiency
        .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
        .join('\n')
    : '';

  const systemContext = [
    'You are MindMate, a friendly and adaptive AI learning tutor for computer science students.',
    `Learning style preference: ${learningStyle || 'Examples first'}.`,
    `Current topic: ${topic || 'General CS concepts'}.`,
    `Student mastery level: ${masteryLevel ?? 0}% (0=beginner, 100=expert). Adjust complexity accordingly.`,
    'Rules: Use code blocks for all code. Be concise. Encourage the student. Avoid jargon unless the student is advanced.',
  ].join(' ');

  const prompt = [
    systemContext,
    historyText ? `\n\nPrevious conversation:\n${historyText}` : '',
    `\n\nStudent: ${message}`,
    '\nTutor:',
  ]
    .filter(Boolean)
    .join('');

  // Try models in order — skip only on 404/not-found, abort on auth errors
  let lastError = '';
  for (const model of GEMINI_MODELS) {
    const result = await callGemini(apiKey, model, prompt);

    if (result.ok && result.text) {
      console.log(`[chat] Success with model: ${model}`);
      return res.status(200).json({ content: result.text, model });
    }

    lastError = result.errorMsg || 'Unknown error';
    console.warn(`[chat] Model ${model} failed: ${lastError}`);

    // Auth/quota errors — no point trying other models
    if (result.status === 400 || result.status === 403 || result.status === 429) {
      break;
    }

    // Only continue to fallback if model was not found (404)
    if (!result.notFound) break;
  }

  // All models failed — return sanitized error (no key exposed)
  console.error('[chat] All models failed. Last error:', lastError);
  return res.status(200).json({
    content: `I'm having trouble right now. ${
      lastError.includes('quota') || lastError.includes('429')
        ? 'API quota exceeded — please try again in a moment.'
        : lastError.includes('API_KEY') || lastError.includes('403')
        ? 'API key issue — please check your GEMINI_API_KEY in Vercel settings.'
        : 'Please try again shortly.'
    }`,
  });
}
