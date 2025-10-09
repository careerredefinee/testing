import multer from 'multer';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import Resume from '../models/Resume.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
export const uploadResume = upload.single('file');

const getModel = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const client = new GoogleGenerativeAI(key);
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  return client.getGenerativeModel({ model: modelName });
};

const extractText = async (buffer, mimetype) => {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text || '';
  }
  if (
    mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value || '';
  }
  if (mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  }
  // Fallback: try utf-8
  return buffer.toString('utf-8');
};

export const analyzeResume = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    // Extract text
    const text = await extractText(buffer, mimetype);
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ status: 'fail', message: 'Could not extract text from file' });
    }

    // Save to DB
    const doc = await Resume.create({
      user: req.user.id,
      filename: originalname,
      mimetype,
      size,
      content: buffer,
      extractedText: text,
    });

    // Analyze with Gemini
    const model = getModel();
    if (!model) return res.status(503).json({ status: 'error', message: 'AI service not configured' });

    // Guard against huge inputs that can cause timeouts/hangs
    const MAX_CHARS = 15000; // reasonable cap
    const safeText = text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}\n\n[Truncated for analysis]` : text;

    const prompt =
      'You are an ATS and career coach. Analyze the following resume content.\nReturn:' +
      '\n- Summary assessment' +
      '\n- Strengths' +
      '\n- Gaps with suggested bullet improvements' +
      '\n- Keyword optimization tips' +
      '\n- 5 tailored bullet points (STAR style)' +
      `\n\nRESUME TEXT:\n${safeText}`;

    // Add timeout wrapper so request never hangs indefinitely
    const withTimeout = (p, ms) =>
      Promise.race([
        p,
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), ms)),
      ]);

    let analysis = '';
    try {
      const result = await withTimeout(model.generateContent(prompt), 60000); // 60s timeout
      analysis = result?.response?.text?.() || '';
    } catch (aiErr) {
      if (aiErr && aiErr.message === 'AI_TIMEOUT') {
        analysis = 'The AI analysis timed out. The resume was saved and can be re-analyzed later.';
      } else {
        // On other AI errors, provide graceful fallback
        analysis = 'The AI analysis encountered an error. The resume was saved successfully.';
        console.error('Gemini analysis error:', aiErr);
      }
    }

    // Update doc with analysis (even if it's a fallback message)
    doc.analysis = analysis;
    await doc.save();

    return res.status(200).json({ status: 'success', data: { id: doc._id, filename: doc.filename, analysis } });
  } catch (err) {
    console.error('Resume analyze error:', err);
    return res.status(500).json({ status: 'error', message: 'Resume analysis failed' });
  }
};

// List all resumes (admin)
export const listResumes = async (req, res) => {
  try {
    const resumes = await Resume.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .select('_id filename mimetype size createdAt user');
    return res.status(200).json({ status: 'success', results: resumes.length, data: { resumes } });
  } catch (err) {
    console.error('List resumes error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to list resumes' });
  }
};

// List my resumes (user)
export const listMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .sort('-createdAt')
      .select('_id filename mimetype size createdAt');
    return res.status(200).json({ status: 'success', results: resumes.length, data: { resumes } });
  } catch (err) {
    console.error('List my resumes error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to list your resumes' });
  }
};

// Get resume (admin or owner)
export const getResume = async (req, res) => {
  try {
    const doc = await Resume.findById(req.params.id).populate('user', 'name email');
    if (!doc) return res.status(404).json({ status: 'fail', message: 'Resume not found' });
    // Auth: allow admin or owner
    if (req.user.role !== 'admin' && String(doc.user?._id) !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized' });
    }
    // Do not send raw content by default to keep payload small
    const payload = {
      _id: doc._id,
      filename: doc.filename,
      mimetype: doc.mimetype,
      size: doc.size,
      extractedText: doc.extractedText,
      analysis: doc.analysis,
      user: doc.user ? { _id: doc.user._id, name: doc.user.name, email: doc.user.email } : undefined,
      createdAt: doc.createdAt,
    };
    return res.status(200).json({ status: 'success', data: { resume: payload } });
  } catch (err) {
    console.error('Get resume error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch resume' });
  }
};

// Delete resume (admin)
export const deleteResume = async (req, res) => {
  try {
    const doc = await Resume.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ status: 'fail', message: 'Resume not found' });
    return res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    console.error('Delete resume error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to delete resume' });
  }
};
