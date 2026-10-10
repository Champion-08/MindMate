import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, topic, learningStyle, masteryLevel, history } = req.body || {};

  if (!message) return res.status(400).json({ error: 'message is required' });

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      content: `I'm MindMate, your AI tutor! You asked: "${message}"\n\nTo enable real AI responses, add **GEMINI_API_KEY** to your Vercel Environment Variables. Get a free key at https://aistudio.google.com/app/apikey`,
    });
  }

  const historyText = Array.isArray(history)
    ? history.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join('\n')
    : '';

  const prompt = [
    `You are MindMate, an adaptive AI learning tutor.`,
    `Student learning style: ${learningStyle || 'Examples first'}.`,
    `Current topic: ${topic || 'General'}.`,
    `Student mastery level: ${masteryLevel || 0}%.`,
    `Adapt explanations to their learning style. Use markdown code blocks for code examples.`,
    `Be concise, encouraging, and educational. Do not be verbose.`,
    historyText ? `\nConversation so far:\n${historyText}` : '',
    `\nStudent: ${message}`,
    `Tutor:`,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      console.error('Gemini API error:', geminiRes.status, JSON.stringify(errData));
      return res.status(200).json({
        content: `I'm having trouble connecting to the AI service right now. (Error ${geminiRes.status}: ${(errData as any)?.error?.message || 'unknown'}). Please try again in a moment.`,
      });
    }

    const data = await geminiRes.json();
    const content =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I received an empty response. Please try rephrasing your question.';

    return res.status(200).json({ content });
  } catch (error: any) {
    console.error('Chat handler error:', error?.message);
    return res.status(200).json({
      content: 'I encountered a network error. Please check your connection and try again.',
    });
  }
}
