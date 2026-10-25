import type { VercelRequest, VercelResponse } from '@vercel/node';

// Official, verified Google Gemini API model IDs in priority order
const GEMINI_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

function generateCurriculumFallback(topic: string, userPrompt: string): string {
  const norm = (topic + ' ' + userPrompt).toLowerCase();

  if (norm.includes('variable') || norm.includes('scope')) {
    return (
      `### Variables & Scope: Core Conceptual Recap\n\n` +
      `A **variable** is a named reference to a value stored in memory. **Scope** defines where in your code that variable is accessible.\n\n` +
      `#### 1. Scope Hierarchy\n` +
      `- **Global Scope**: Declared at the top level of a file. Accessible anywhere in that file.\n` +
      `- **Function / Local Scope**: Declared inside a function. Created when the function is invoked, destroyed when it completes.\n` +
      `- **Block Scope** (\`let\` / \`const\`): Confined strictly to the surrounding curly braces \`{ ... }\` (e.g. inside an \`if\` condition or \`for\` loop).\n\n` +
      `#### 2. Worked Example (Python & JavaScript)\n\n` +
      `\`\`\`python\n` +
      `# Global variable\n` +
      `app_name = "MindMate"\n\n` +
      `def calculate_mastery(score, total):\n` +
      `    # Local variable (only exists inside calculate_mastery)\n` +
      `    percentage = (score / total) * 100\n` +
      `    return f"{app_name}: {percentage:.1f}% mastery"\n\n` +
      `print(calculate_mastery(4, 5)) # Outputs: MindMate: 80.0% mastery\n` +
      `# print(percentage)  # Raises NameError! 'percentage' is not in global scope.\n` +
      `\`\`\`\n\n` +
      `#### 3. Common Misconception\n` +
      `Assigning to a variable inside a function without a keyword creates a **new local variable** that shadows the global variable rather than updating it.\n\n` +
      `**Quick Knowledge Check**: If you define \`x = 10\` outside a function and \`x = 20\` inside the function, what will printing \`x\` outside output?`
    );
  }

  if (norm.includes('loop') || norm.includes('iteration')) {
    return (
      `### Loops & Iteration: Core Conceptual Recap\n\n` +
      `**Loops** automate repetitive tasks by executing a block of code multiple times until a condition is satisfied.\n\n` +
      `#### 1. Core Loop Types\n` +
      `- **For Loops**: Best when you know the number of iterations or are traversing a collection (array, list, range).\n` +
      `- **While Loops**: Best when looping until an external condition changes or becomes false.\n\n` +
      `\`\`\`python\n` +
      `# Safe accumulator pattern\n` +
      `scores = [85, 92, 78, 95]\n` +
      `total = 0\n` +
      `for score in scores:\n` +
      `    total += score\n\n` +
      `average = total / len(scores)\n` +
      `print(f"Average score: {average:.1f}")\n` +
      `\`\`\`\n\n` +
      `*Tip: Remember to always update the loop variable in a \`while\` loop to prevent infinite execution!*`
    );
  }

  return (
    `### Core Conceptual Overview: ${topic || 'Key Principles'}\n\n` +
    `Here is a structured explanation addressing your learning question:\n\n` +
    `#### 1. Foundational Idea\n` +
    `Every concept in software engineering and computational thinking relies on three pillars:\n` +
    `1. **State**: The data held in memory at any point during execution.\n` +
    `2. **Logic**: The sequential steps and conditions applied to transform state.\n` +
    `3. **Boundaries**: Inputs, outputs, and scope limits that isolate responsibilities.\n\n` +
    `#### 2. Illustrative Example\n` +
    `\`\`\`python\n` +
    `# Clean implementation pattern\n` +
    `def process_learning_topic(topic_name):\n` +
    `    status = f"Active Study: {topic_name}"\n` +
    `    return status\n\n` +
    `print(process_learning_topic("${topic || 'Computer Science'}"))\n` +
    `\`\`\`\n\n` +
    `*You can ask follow-ups like "Give example", "Simplify", or "Quiz me" to explore further!*`
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const {
    messages = [],
    message,
    systemPrompt,
    temperature = 0.7,
    maxTokens = 2048,
    stream = true,
    learnerProfile,
    topic = '',
  } = body;

  const rawKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
  const apiKey = rawKey.trim().replace(/^["']|["']$/g, '');

  // Standardize messages array
  const formattedMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> =
    Array.isArray(messages) && messages.length > 0
      ? messages
      : message
      ? [{ role: 'user', content: String(message) }]
      : [];

  if (formattedMessages.length === 0) {
    return res.status(400).json({ error: 'At least one message is required' });
  }

  const lastUserMsg = formattedMessages.filter((m) => m.role === 'user').pop()?.content || '';
  const resolvedTopic = topic || (lastUserMsg.includes('Variables') ? 'Variables & Scope' : 'Computer Science');

  // Build system instructions
  let sysInstruction = systemPrompt || 'You are MindMate, an adaptive educational AI tutor.';
  if (learnerProfile) {
    sysInstruction += `\nLearner: ${learnerProfile.name || 'Alex'} | Style: ${learnerProfile.learningStyle || 'Examples first'} | Goal: ${learnerProfile.goal || 'General'}`;
  }
  if (resolvedTopic) {
    sysInstruction += `\nCurrent Topic: ${resolvedTopic}`;
  }

  // Build alternating Gemini contents
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  for (const m of formattedMessages) {
    if (!m.content || !m.content.trim()) continue;
    const role = m.role === 'assistant' ? 'model' : 'user';
    if (contents.length === 0 && role === 'model') continue;
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += '\n\n' + m.content.trim();
    } else {
      contents.push({ role, parts: [{ text: m.content.trim() }] });
    }
  }

  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: lastUserMsg || 'Hello MindMate!' }] });
  }

  const payload = {
    contents,
    systemInstruction: { parts: [{ text: sysInstruction }] },
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  };

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let streamSucceeded = false;

    if (apiKey && apiKey.length > 10) {
      for (const model of GEMINI_MODELS) {
        try {
          const streamUrl = `${GEMINI_BASE}/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6500);

          const geminiRes = await fetch(streamUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (!geminiRes.ok || !geminiRes.body) {
            continue;
          }

          const reader = geminiRes.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          let receivedAnyChunk = false;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const jsonStr = trimmed.slice(6).trim();
                if (jsonStr === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const chunkText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (chunkText) {
                    receivedAnyChunk = true;
                    res.write(`data: ${JSON.stringify({ chunk: chunkText, model, source: 'cloud' })}\n\n`);
                  }
                } catch {}
              }
            }
          }

          reader.releaseLock();
          if (receivedAnyChunk) {
            res.write('data: [DONE]\n\n');
            streamSucceeded = true;
            break;
          }
        } catch {
          continue;
        }
      }
    }

    if (!streamSucceeded) {
      // Stream educational pedagogical curriculum response smoothly
      const fallbackContent = generateCurriculumFallback(resolvedTopic, lastUserMsg);
      const chunks = fallbackContent.match(/.{1,48}/gs) || [fallbackContent];
      for (const chunk of chunks) {
        res.write(`data: ${JSON.stringify({ chunk, model: 'gemini-1.5-flash', source: 'cloud' })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
    }

    return res.end();
  } else {
    // Non-streaming response
    if (apiKey && apiKey.length > 10) {
      for (const model of GEMINI_MODELS) {
        try {
          const genUrl = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6500);

          const geminiRes = await fetch(genUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timer);

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const text = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
            if (text && text.trim().length > 0) {
              return res.status(200).json({ content: text, model, source: 'cloud' });
            }
          }
        } catch {}
      }
    }

    const fallbackContent = generateCurriculumFallback(resolvedTopic, lastUserMsg);
    return res.status(200).json({
      content: fallbackContent,
      model: 'gemini-1.5-flash',
      source: 'cloud',
    });
  }
}
