import { GoogleGenAI } from '@google/genai';

// Lazy-initialize client so env can be loaded later (e.g., from config.env)
const getClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

const getTextModelName = () => process.env.GEMINI_TEXT_MODEL || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const getImageModelName = () => process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

export const health = async (req, res) => {
  const ready = !!getClient();
  res.status(200).json({ status: 'ok', model: getTextModelName(), imageModel: getImageModelName(), ready });
};

export const chat = async (req, res) => {
  try {
    const { message, tool, context } = req.body;
    if (!message) return res.status(400).json({ status: 'fail', message: 'message is required' });
    const client = getClient();
    if (!client) return res.status(503).json({ status: 'error', message: 'AI service not configured' });

    const prompt = [
      context ? `Context: ${context}` : null,
      tool ? `Tool: ${tool}` : null,
      `User: ${message}`
    ].filter(Boolean).join('\n');

    const result = await client.models.generateContent({
      model: getTextModelName(),
      contents: prompt,
    });
    const cand = result?.candidates?.[0];
    let text = '';
    if (cand?.content?.parts) {
      text = cand.content.parts.map(p => p.text || '').join('').trim();
    }
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
    const client = getClient();
    if (!client) return res.status(503).json({ status: 'error', message: 'AI service not configured' });

    const system = `You are a helpful coding assistant. Generate only ${language} code unless explicitly asked otherwise. Provide concise, production-quality code with comments where helpful.`;
    const result = await client.models.generateContent({
      model: getTextModelName(),
      contents: `${system}\n\nTask: ${prompt}`,
    });
    const parts = result?.candidates?.[0]?.content?.parts || [];
    const code = parts.map(p => p.text || '').join('').trim();
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
    const client = getClient();
    if (!client) return res.status(503).json({ status: 'error', message: 'AI service not configured' });

    const instructionMap = {
      summary: 'Provide a concise summary (5-7 sentences).',
      'key-points': 'List key points as bullet points.',
      'action-items': 'Extract actionable next steps as a checklist.',
      sentiment: 'Analyze sentiment and justify briefly.',
      qa: 'Create 5 Q&A pairs that test understanding.',
    };

    const instruction = instructionMap[analysisType] || instructionMap.summary;
    const result = await client.models.generateContent({
      model: getTextModelName(),
      contents: `Analyze the following content. ${instruction}\n\nCONTENT:\n${content}`,
    });
    const parts = result?.candidates?.[0]?.content?.parts || [];
    const text = parts.map(p => p.text || '').join('').trim();
    return res.status(200).json({ status: 'success', data: { result: text, analysisType } });
  } catch (err) {
    console.error('AI document analysis error:', err);
    res.status(500).json({ status: 'error', message: 'AI document analysis failed' });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { prompt, style = 'realistic' } = req.body || {};
    if (!prompt) return res.status(400).json({ status: 'fail', message: 'prompt is required' });
    const client = getClient();
    if (!client) return res.status(503).json({ status: 'error', message: 'AI service not configured' });

    const finalPrompt = `${prompt}\n\nStyle: ${style}`;
    const response = await client.models.generateContent({
      model: getImageModelName(),
      contents: finalPrompt,
    });

    const parts = response?.candidates?.[0]?.content?.parts || [];
    let imageDataBase64 = '';
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageDataBase64 = part.inlineData.data;
        break;
      }
    }
    if (!imageDataBase64) {
      // Some models may return a text part with a URL; try text fallback
      const textOut = parts.map(p => p.text || '').join('').trim();
      return res.status(200).json({ status: 'success', data: { imageDataUrl: textOut || null } });
    }
    const dataUrl = `data:image/png;base64,${imageDataBase64}`;
    return res.status(200).json({ status: 'success', data: { imageDataUrl: dataUrl } });
  } catch (err) {
    console.error('AI image error:', err);
    res.status(500).json({ status: 'error', message: 'AI image generation failed' });
  }
};

export const generateMusic = async (req, res) => {
  return res.status(501).json({ status: 'error', message: 'Music generation not implemented yet' });
};

export const generateVideo = async (req, res) => {
  return res.status(501).json({ status: 'error', message: 'Video generation not implemented yet' });
};
