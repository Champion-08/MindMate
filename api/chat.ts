import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { message, topic, learningStyle, masteryLevel, history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.status(200).json({ 
      content: `I'm MindMate, your learning tutor. You asked: "${message}". (Gemini API key not configured — add GEMINI_API_KEY to Vercel environment variables to enable real AI responses.)` 
    });
  }

  const prompt = `You are MindMate, an adaptive AI learning tutor. Student learning style: ${learningStyle || 'Examples first'}. Topic: ${topic || 'General'}. Mastery: ${masteryLevel || 0}%. Adapt explanations to their style. Use markdown code blocks for code. Be concise and educational.\n\nConversation:\n${(history || []).map((m: any) => `${m.role}: ${m.content}`).join('\n')}\n\nStudent: ${message}\nTutor:`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    return res.status(200).json({ content });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
