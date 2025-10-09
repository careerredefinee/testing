import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize client lazily so env can be loaded first
const getClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
};

// Attempt a generate call with a specific model; if model is not found (404), return null to allow fallback
const tryGenerate = async (modelId, text) => {
  const client = getClient();
  if (!client) return { error: 'AI service not configured' };
  try {
    const model = client.getGenerativeModel({ model: modelId });
    const result = await model.generateContent(text);
    return { result };
  } catch (e) {
    // SDK throws GoogleGenerativeAIFetchError with status
    if (e?.status === 404) return { notFound: true };
    // other errors should bubble up
    return { exception: e };
  }
};

// Generate with fallback model sequence
const generateWithFallback = async (prompt) => {
  const preferred = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();
  const candidates = [preferred, 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-pro'];

  for (const modelId of candidates) {
    const { result, notFound, exception, error } = await tryGenerate(modelId, prompt);
    if (result) return { modelId, result };
    if (error) return { error };
    if (exception && !notFound) return { exception };
    // if notFound, continue to try next candidate
  }
  return { error: 'No supported Gemini model found for your API key/project. Set GEMINI_MODEL to a supported model.' };
};

export const health = async (req, res) => {
  const ready = !!getClient();
  const configuredModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  return res.status(200).json({ status: 'success', ready, model: configuredModel });
};

export const chat = async (req, res) => {
  try {
    const { message, tool, context } = req.body || {};
    if (!message) return res.status(400).json({ status: 'fail', message: 'message is required' });

    const prompt = [
      context ? `Context: ${context}` : null,
      tool ? `Tool: ${tool}` : null,
      `User: ${message}`
    ].filter(Boolean).join('\n');

    const out = await generateWithFallback(prompt);
    if (out.error) return res.status(503).json({ status: 'error', message: out.error });
    if (out.exception) {
      console.error('AI chat error:', out.exception);
      return res.status(500).json({ status: 'error', message: 'AI chat failed' });
    }
    const text = out.result?.response?.text?.() || out.result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({ status: 'success', data: { reply: text, model: out.modelId } });
  } catch (err) {
    console.error('AI chat error:', err);
    return res.status(500).json({ status: 'error', message: 'AI chat failed' });
  }
};

export const generateCode = async (req, res) => {
  try {
    const { prompt, language = 'javascript' } = req.body || {};
    if (!prompt) return res.status(400).json({ status: 'fail', message: 'prompt is required' });

    const system = `You are a helpful coding assistant. Generate only ${language} code unless explicitly asked otherwise. Provide concise, production-quality code with comments where helpful.`;
    const out = await generateWithFallback(`${system}\n\nTask: ${prompt}`);
    if (out.error) return res.status(503).json({ status: 'error', message: out.error });
    if (out.exception) {
      console.error('AI code error:', out.exception);
      return res.status(500).json({ status: 'error', message: 'AI code generation failed' });
    }
    const code = out.result?.response?.text?.() || '';
    return res.status(200).json({ status: 'success', data: { code, language, model: out.modelId } });
  } catch (err) {
    console.error('AI code error:', err);
    return res.status(500).json({ status: 'error', message: 'AI code generation failed' });
  }
};

export const analyzeDocument = async (req, res) => {
  try {
    const { content, analysisType = 'summary' } = req.body || {};
    if (!content) return res.status(400).json({ status: 'fail', message: 'content is required' });

    const instructionMap = {
      summary: 'Provide a concise summary (5-7 sentences).',
      'key-points': 'List key points as bullet points.',
      'action-items': 'Extract actionable next steps as a checklist.',
      sentiment: 'Analyze sentiment and justify briefly.',
      qa: 'Create 5 Q&A pairs that test understanding.',
    };

    const instruction = instructionMap[analysisType] || instructionMap.summary;
    const out = await generateWithFallback(`Analyze the following content. ${instruction}\n\nCONTENT:\n${content}`);
    if (out.error) return res.status(503).json({ status: 'error', message: out.error });
    if (out.exception) {
      console.error('AI document analysis error:', out.exception);
      return res.status(500).json({ status: 'error', message: 'AI document analysis failed' });
    }
    const text = out.result?.response?.text?.() || '';
    return res.status(200).json({ status: 'success', data: { result: text, analysisType, model: out.modelId } });
  } catch (err) {
    console.error('AI document analysis error:', err);
    return res.status(500).json({ status: 'error', message: 'AI document analysis failed' });
  }
};

export const generateImage = async (req, res) => {
  return res.status(501).json({ status: 'error', message: 'Image generation not implemented yet' });
};

export const generateMusic = async (req, res) => {
  return res.status(501).json({ status: 'error', message: 'Music generation not implemented yet' });
};

export const generateVideo = async (req, res) => {
  return res.status(501).json({ status: 'error', message: 'Video generation not implemented yet' });
};
