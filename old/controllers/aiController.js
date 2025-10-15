import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy-initialize client so env can be loaded later (e.g., from config.env)
const getClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  return new GoogleGenerativeAI(key);
};

const getTextModel = () => {
  const client = getClient();
  if (!client) return null;
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  return client.getGenerativeModel({ model: modelName });
};

export const health = async (req, res) => {
  const ready = !!getClient();
  res.status(200).json({ status: 'ok', model: process.env.GEMINI_MODEL || 'gemini-1.5-flash', ready });
};

export const chat = async (req, res) => {
  try {
    const { message, tool, context } = req.body;
    if (!message) return res.status(400).json({ status: 'fail', message: 'message is required' });
    const model = getTextModel();
    if (!model) return res.status(503).json({ status: 'error', message: 'AI service not configured' });

    const prompt = [
      context ? `Context: ${context}` : null,
      tool ? `Tool: ${tool}` : null,
      `User: ${message}`
    ].filter(Boolean).join('\n');

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ status: 'success', data: { reply: text } });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ status: 'error', message: 'AI chat failed' });
  }
};

export const generateCode = async (req, res) => {
  try {
    const { prompt, language = 'javascript' } = req.body;
    if (!prompt) return res.status(400).json({ status: 'fail', message: 'prompt is required' });
    const model = getTextModel();
    if (!model) return res.status(503).json({ status: 'error', message: 'AI service not configured' });

    const system = `You are a helpful coding assistant. Generate only ${language} code unless explicitly asked otherwise. Provide concise, production-quality code with comments where helpful.`;
    const result = await model.generateContent(`${system}\n\nTask: ${prompt}`);
    const code = result?.response?.text?.() || '';
    return res.status(200).json({ status: 'success', data: { code, language } });
  } catch (err) {
    console.error('AI code error:', err);
    res.status(500).json({ status: 'error', message: 'AI code generation failed' });
  }
};

export const analyzeDocument = async (req, res) => {
  try {
    const { content, analysisType = 'summary' } = req.body;
    if (!content) return res.status(400).json({ status: 'fail', message: 'content is required' });
    const model = getTextModel();
    if (!model) return res.status(503).json({ status: 'error', message: 'AI service not configured' });

    const instructionMap = {
      summary: 'Provide a concise summary (5-7 sentences).',
      'key-points': 'List key points as bullet points.',
      'action-items': 'Extract actionable next steps as a checklist.',
      sentiment: 'Analyze sentiment and justify briefly.',
      qa: 'Create 5 Q&A pairs that test understanding.',
    };

    const instruction = instructionMap[analysisType] || instructionMap.summary;
    const result = await model.generateContent(`Analyze the following content. ${instruction}\n\nCONTENT:\n${content}`);
    const text = result?.response?.text?.() || '';
    return res.status(200).json({ status: 'success', data: { result: text, analysisType } });
  } catch (err) {
    console.error('AI document analysis error:', err);
    res.status(500).json({ status: 'error', message: 'AI document analysis failed' });
  }
};

export const generateImage = async (req, res) => {
  // Placeholder: The current SDK may require different flows for image gen. Implement later.
  return res.status(501).json({ status: 'error', message: 'Image generation not implemented yet' });
};

export const generateMusic = async (req, res) => {
  return res.status(501).json({ status: 'error', message: 'Music generation not implemented yet' });
};

export const generateVideo = async (req, res) => {
  return res.status(501).json({ status: 'error', message: 'Video generation not implemented yet' });
};
