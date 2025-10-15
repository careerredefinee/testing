import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import Assessment from '../models/Assessment.js';
import AssessmentSubmission from '../models/AssessmentSubmission.js';

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup (memory storage) and file filter
const allowedMimes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Unsupported file type'));
  },
});

export const uploadAssessmentMedia = upload.single('media');
export const uploadSubmissionFile = upload.single('file');

// Helper: upload buffer to Cloudinary as raw (no transformation flags)
const uploadToCloudinaryRaw = (buffer, { folder, public_id, format }) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder,
        public_id,
        // format is optional for raw; Cloudinary will preserve original extension when possible
        format,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const getExt = (name = '') => {
  const i = name.lastIndexOf('.');
  return i !== -1 ? name.substring(i + 1).toLowerCase() : undefined;
};

// Admin: create assessment (text or media) and assign users
export const createAssessment = async (req, res) => {
  try {
    const { title, description, contentType = 'text', textContent, assignedTo = [], dueDate } = req.body || {};
    if (!title) return res.status(400).json({ status: 'fail', message: 'Title is required' });

    let media;
    if (contentType === 'media' && req.file) {
      const derivedExt = getExt(req.file.originalname) || 'pdf';
      const uploadRes = await uploadToCloudinaryRaw(req.file.buffer, {
        folder: 'career-redefine/assessments',
        public_id: `assessment-${Date.now()}`,
        format: derivedExt,
      });
      media = {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    }

    // sanitize assignedTo to ObjectId[]
    const assignedIds = Array.isArray(assignedTo)
      ? assignedTo.map((id) => new mongoose.Types.ObjectId(id))
      : [];

    const doc = await Assessment.create({
      title,
      description,
      contentType,
      textContent: contentType === 'text' ? textContent : undefined,
      media,
      assignedTo: assignedIds,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: req.user.id,
    });

    return res.status(201).json({ status: 'success', data: { assessment: doc } });
  } catch (err) {
    console.error('Create assessment error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to create assessment' });
  }
};

// Admin: list assessments
export const listAssessments = async (req, res) => {
  try {
    const docs = await Assessment.find().sort('-createdAt').populate('assignedTo', 'name email');
    return res.status(200).json({ status: 'success', results: docs.length, data: { assessments: docs } });
  } catch (err) {
    console.error('List assessments error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to list assessments' });
  }
};

// Admin: update assessment basic fields or re-upload media
export const updateAssessment = async (req, res) => {
  try {
    const { title, description, contentType, textContent, dueDate } = req.body || {};
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (dueDate !== undefined) update.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (contentType) update.contentType = contentType;

    if (contentType === 'text') {
      update.textContent = textContent;
      update.media = undefined;
    } else if (contentType === 'media' && req.file) {
      const derivedExt = getExt(req.file.originalname) || 'pdf';
      const uploadRes = await uploadToCloudinaryRaw(req.file.buffer, {
        folder: 'career-redefine/assessments',
        public_id: `assessment-${Date.now()}`,
        format: derivedExt,
      });
      update.media = {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
      update.textContent = undefined;
    }

    const doc = await Assessment.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ status: 'fail', message: 'Assessment not found' });
    return res.status(200).json({ status: 'success', data: { assessment: doc } });
  } catch (err) {
    console.error('Update assessment error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to update assessment' });
  }
};

// Admin: delete assessment and optional cascade submissions
export const deleteAssessment = async (req, res) => {
  try {
    const doc = await Assessment.findById(req.params.id);
    if (!doc) return res.status(404).json({ status: 'fail', message: 'Assessment not found' });

    // If media exists, try to delete from Cloudinary (ignore errors)
    if (doc.media?.publicId) {
      try { await cloudinary.uploader.destroy(doc.media.publicId, { resource_type: 'raw' }); } catch (e) {}
    }

    await Assessment.findByIdAndDelete(req.params.id);
    // Also delete related submissions
    await AssessmentSubmission.deleteMany({ assessment: req.params.id });

    return res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    console.error('Delete assessment error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to delete assessment' });
  }
};

// Admin: assign users (replace or append)
export const assignUsers = async (req, res) => {
  try {
    const { userIds = [], mode = 'replace' } = req.body || {};
    const doc = await Assessment.findById(req.params.id);
    if (!doc) return res.status(404).json({ status: 'fail', message: 'Assessment not found' });

    const ids = (Array.isArray(userIds) ? userIds : []).map((id) => new mongoose.Types.ObjectId(id));
    if (mode === 'append') {
      const set = new Set([...(doc.assignedTo || []).map((x) => String(x)), ...ids.map((x) => String(x))]);
      doc.assignedTo = Array.from(set).map((x) => new mongoose.Types.ObjectId(x));
    } else {
      doc.assignedTo = ids;
    }
    await doc.save();

    return res.status(200).json({ status: 'success', data: { assessment: doc } });
  } catch (err) {
    console.error('Assign users error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to assign users' });
  }
};

// User: list my assigned assessments with my submission status
export const listMyAssessments = async (req, res) => {
  try {
    const userId = req.user.id;
    const assessments = await Assessment.find({ assignedTo: userId }).sort('-createdAt');
    const submissions = await AssessmentSubmission.find({ user: userId });
    const subMap = new Map(submissions.map((s) => [String(s.assessment), s]));
    const data = assessments.map((a) => ({
      assessment: a,
      submission: subMap.get(String(a._id)) || null,
    }));
    return res.status(200).json({ status: 'success', results: data.length, data: { items: data } });
  } catch (err) {
    console.error('List my assessments error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to load assessments' });
  }
};

// User: submit or resubmit a file for an assessment
export const submitAssessment = async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const userId = req.user.id;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) return res.status(404).json({ status: 'fail', message: 'Assessment not found' });
    if (!assessment.assignedTo.map(String).includes(String(userId))) {
      return res.status(403).json({ status: 'fail', message: 'Not assigned to you' });
    }

    if (!req.file) return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    const derivedExt = getExt(req.file.originalname) || 'pdf';
    const uploadRes = await uploadToCloudinaryRaw(req.file.buffer, {
      folder: 'career-redefine/assessment-submissions',
      public_id: `submission-${userId}-${Date.now()}`,
      format: derivedExt,
    });

    const file = {
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    };

    // Upsert submission; if previously rejected or pending, allow resubmit; if approved, block
    const existing = await AssessmentSubmission.findOne({ assessment: assessmentId, user: userId });
    if (existing && existing.status === 'approved') {
      return res.status(400).json({ status: 'fail', message: 'Submission already approved; uploads are locked' });
    }

    let doc;
    if (existing) {
      // Try to delete old file if existed
      if (existing.file?.publicId) {
        try { await cloudinary.uploader.destroy(existing.file.publicId, { resource_type: 'raw' }); } catch (e) {}
      }
      existing.file = file;
      existing.status = 'pending';
      existing.reviewMessage = undefined;
      existing.reviewedAt = undefined;
      existing.reviewedBy = undefined;
      doc = await existing.save();
    } else {
      doc = await AssessmentSubmission.create({ assessment: assessmentId, user: userId, file });
    }

    return res.status(201).json({ status: 'success', data: { submission: doc } });
  } catch (err) {
    console.error('Submit assessment error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to submit assessment' });
  }
};

// Admin: list submissions (optionally by assessment or status)
export const listSubmissions = async (req, res) => {
  try {
    const { assessmentId, status } = req.query || {};
    const filter = {};
    if (assessmentId) filter.assessment = assessmentId;
    if (status) filter.status = status;
    const docs = await AssessmentSubmission.find(filter)
      .sort('-createdAt')
      .populate('user', 'name email')
      .populate('assessment', 'title');
    return res.status(200).json({ status: 'success', results: docs.length, data: { submissions: docs } });
  } catch (err) {
    console.error('List submissions error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to list submissions' });
  }
};

// Admin: review submission approve/reject
export const reviewSubmission = async (req, res) => {
  try {
    const { status, message } = req.body || {};
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid status' });
    }
    const doc = await AssessmentSubmission.findById(req.params.id);
    if (!doc) return res.status(404).json({ status: 'fail', message: 'Submission not found' });
    doc.status = status;
    doc.reviewMessage = message;
    doc.reviewedAt = new Date();
    doc.reviewedBy = req.user.id;
    await doc.save();
    return res.status(200).json({ status: 'success', data: { submission: doc } });
  } catch (err) {
    console.error('Review submission error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to review submission' });
  }
};

// Admin: delete submission
export const deleteSubmission = async (req, res) => {
  try {
    const doc = await AssessmentSubmission.findById(req.params.id);
    if (!doc) return res.status(404).json({ status: 'fail', message: 'Submission not found' });
    if (doc.file?.publicId) {
      try { await cloudinary.uploader.destroy(doc.file.publicId, { resource_type: 'raw' }); } catch (e) {}
    }
    await AssessmentSubmission.findByIdAndDelete(req.params.id);
    return res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    console.error('Delete submission error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to delete submission' });
  }
};
