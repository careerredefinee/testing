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

// ✅ Get text model (defaults to free, stable model)
const getTextModel = () => {
  const client = getClient();
  if (!client) return null;
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash"; // free model
  return client.getGenerativeModel({ model: modelName });
};

// ✅ Health Check
export const health = async (req, res) => {
  const ready = !!getClient();
  return res.status(200).json({
    status: "ok",
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
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
    if (!model)
      return res
        .status(503)
        .json({ status: "error", message: "AI service not configured" });

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

    return res.status(200).json({
      status: "success",
      data: { reply: text },
    });
  } catch (err) {
    console.error("AI chat error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "AI chat failed", details: err.message });
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
    if (!model)
      return res
        .status(503)
        .json({ status: "error", message: "AI service not configured" });

    const systemPrompt = `You are a helpful coding assistant. Generate only ${language} code unless asked otherwise. Provide concise, production-ready code with brief comments.`;
    const result = await model.generateContent(`${systemPrompt}\n\nTask: ${prompt}`);
    const code = result?.response?.text?.() || "No code generated.";

    return res.status(200).json({
      status: "success",
      data: { code, language },
    });
  } catch (err) {
    console.error("AI code error:", err);
    return res.status(500).json({
      status: "error",
      message: "AI code generation failed",
      details: err.message,
    });
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
    if (!model)
      return res
        .status(503)
        .json({ status: "error", message: "AI service not configured" });

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
    return res.status(200).json({
      status: "success",
      data: { result: text, analysisType },
    });
  } catch (err) {
    console.error("AI document analysis error:", err);
    return res.status(500).json({
      status: "error",
      message: "AI document analysis failed",
      details: err.message,
    });
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
