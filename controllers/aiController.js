import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Lazy init client (safe for all environments)
const getClient = () => {
  const key = process.env.GEMINI_API_KEY || ""; // required for Gemini
  if (!key) return null;
  try {
    return new GoogleGenerativeAI(key);
  } catch (err) {
    console.error("Failed to initialize Gemini client:", err);
    return null;
  }
};

// ✅ Model selection (set from server.js)
let MODEL_NAME = "gemini-1.5-flash"; // default; overridden by server
export const setModelName = (name) => {
  if (typeof name === 'string' && name.trim()) {
    MODEL_NAME = name.trim();
  }
};

// ✅ Get text model
const getTextModel = () => {
  const client = getClient();
  if (!client) return null;
  return client.getGenerativeModel({ model: MODEL_NAME });
};

// ✅ Health Check
export const health = async (req, res) => {
  const ready = !!getClient();
  return res.status(200).json({
    status: "ok",
    model: MODEL_NAME,
    ready,
  });
};

// ✅ Chat Endpoint
export const chat = async (req, res) => {
  try {
    const { message, tool, context } = req.body;
    if (!message)
      return res
        .status(400)
        .json({ status: "fail", message: "message is required" });

    const model = getTextModel();
    // Fallback if no model configured
    if (!model) {
      const fb = [
        context ? `Context: ${context}` : null,
        tool ? `Tool: ${tool}` : null,
        `You asked: ${message}`,
        `Reply: Here's a brief, friendly answer based on your prompt. Please provide more details if needed.`
      ].filter(Boolean).join("\n");
      return res.status(200).json({ status: "success", data: { reply: fb } });
    }

    const prompt = [
      context ? `Context: ${context}` : null,
      tool ? `Tool: ${tool}` : null,
      `User: ${message}`,
    ]
      .filter(Boolean)
      .join("\n");

    const result = await model.generateContent(prompt);
    const text =
      result?.response?.text?.() ||
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response.";

    return res.status(200).json({ status: "success", data: { reply: text } });
  } catch (err) {
    console.error("AI chat error:", err);
    // Graceful fallback on error
    return res.status(200).json({
      status: "success",
      data: { reply: `Temporary fallback reply. Error details hidden. You asked: ${req.body?.message || ''}` }
    });
  }
};

// ✅ Code Generation
export const generateCode = async (req, res) => {
  try {
    const { prompt, language = "javascript" } = req.body;
    if (!prompt)
      return res
        .status(400)
        .json({ status: "fail", message: "prompt is required" });

    const model = getTextModel();
    if (!model) {
      const code = `// Fallback ${language} snippet\n// Task: ${prompt}\n` + (language.toLowerCase() === 'javascript'
        ? `function solution(input){\n  // TODO: implement\n  return input;\n}\n`
        : `# TODO: implement\n`);
      return res.status(200).json({ status: "success", data: { code, language } });
    }

    const systemPrompt = `You are a helpful coding assistant. Generate only ${language} code unless asked otherwise. Provide concise, production-ready code with brief comments.`;
    const result = await model.generateContent(`${systemPrompt}\n\nTask: ${prompt}`);
    const code = result?.response?.text?.() || "No code generated.";

    return res.status(200).json({ status: "success", data: { code, language } });
  } catch (err) {
    console.error("AI code error:", err);
    const language = req.body?.language || 'javascript';
    const prompt = req.body?.prompt || '';
    const code = `// Fallback ${language} snippet due to temporary issue\n// Task: ${prompt}`;
    return res.status(200).json({ status: "success", data: { code, language } });
  }
};

// ✅ Document Analysis
export const analyzeDocument = async (req, res) => {
  try {
    const { content, analysisType = "summary" } = req.body;
    if (!content)
      return res
        .status(400)
        .json({ status: "fail", message: "content is required" });

    const model = getTextModel();
    if (!model) {
      // Simple heuristic fallback summary/key-points
      const text = String(content);
      const lines = text.split(/\r?\n/).filter(Boolean).slice(0, 5);
      let result;
      if (analysisType === 'key-points') {
        result = lines.map(l => `- ${l}`).join('\n');
      } else if (analysisType === 'action-items') {
        result = lines.map((l, i) => `${i+1}. ${l}`).join('\n');
      } else {
        result = lines.slice(0, 3).join(' ');
      }
      return res.status(200).json({ status: "success", data: { result, analysisType } });
    }

    const instructionMap = {
      summary: "Provide a concise summary (5-7 sentences).",
      "key-points": "List key points as bullet points.",
      "action-items": "Extract actionable next steps as a checklist.",
      sentiment: "Analyze sentiment (positive/negative/neutral) with reasoning.",
      qa: "Create 5 Q&A pairs that test understanding.",
    };

    const instruction = instructionMap[analysisType] || instructionMap.summary;
    const result = await model.generateContent(
      `Analyze the following content.\n${instruction}\n\nCONTENT:\n${content}`
    );

    const text = result?.response?.text?.() || "No analysis result.";
    return res.status(200).json({ status: "success", data: { result: text, analysisType } });
  } catch (err) {
    console.error("AI document analysis error:", err);
    const { content, analysisType = 'summary' } = req.body || {};
    const snippet = String(content || '').slice(0, 200);
    const result = analysisType === 'key-points'
      ? snippet.split(/\s+/).slice(0, 20).map(w => `- ${w}`).join('\n')
      : snippet;
    return res.status(200).json({ status: "success", data: { result, analysisType } });
  }
};

// 🚫 Placeholders (to be implemented later)
export const generateImage = async (req, res) => {
  return res
    .status(501)
    .json({ status: "error", message: "Image generation not implemented yet" });
};

export const generateMusic = async (req, res) => {
  return res
    .status(501)
    .json({ status: "error", message: "Music generation not implemented yet" });
};

export const generateVideo = async (req, res) => {
  return res
    .status(501)
    .json({ status: "error", message: "Video generation not implemented yet" });
};
