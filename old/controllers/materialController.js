import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Material from '../models/Material.js';

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/plain', // .txt
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  },
});

export const uploadMaterial = upload.single('file');

export const createMaterial = async (req, res) => {
  try {
    const { name } = req.body;
    if (!req.file) return res.status(400).json({ status: 'fail', message: 'No file uploaded' });

    // Derive format (extension) from original filename to ensure URL ends with .pdf
    const originalName = req.file.originalname || 'material.pdf';
    const dotIdx = originalName.lastIndexOf('.')
    const derivedExt = dotIdx !== -1 ? originalName.substring(dotIdx + 1).toLowerCase() : 'pdf';

    // Upload to Cloudinary as raw, preserve extension and set inline to help in-browser viewing
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'career-redefine/materials',
          public_id: `material-${Date.now()}`,
          format: derivedExt, // ensures URL has .pdf (or derived extension)
          use_filename: true,
          unique_filename: true,
          flags: 'inline', // hint to serve inline when possible
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else resolve(uploadResult);
        }
      );
      stream.end(req.file.buffer);
    });

    const doc = await Material.create({
      // Ensure name carries extension; if admin provided name without extension, append derivedExt
      name: name
        ? (name.includes('.') ? name : `${name}.${derivedExt}`)
        : req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    return res.status(201).json({ status: 'success', data: { material: doc } });
  } catch (err) {
    console.error('Create material error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to upload material' });
  }
};

export const listMaterials = async (req, res) => {
  try {
    const materials = await Material.find().sort('-createdAt');
    return res.status(200).json({ status: 'success', results: materials.length, data: { materials } });
  } catch (err) {
    console.error('List materials error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to list materials' });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const mat = await Material.findById(req.params.id);
    if (!mat) return res.status(404).json({ status: 'fail', message: 'Material not found' });

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(mat.publicId, { resource_type: 'raw' });
    } catch (e) {
      // Log but continue to delete DB record
      console.warn('Cloudinary destroy failed for material:', mat.publicId, e?.message);
    }

    await Material.findByIdAndDelete(req.params.id);
    return res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    console.error('Delete material error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to delete material' });
  }
};

// Helper to get extension from name
const getExtFromName = (name = '') => {
  const i = name.lastIndexOf('.');
  return i !== -1 ? name.substring(i + 1).toLowerCase() : undefined;
};

// Redirect to inline-viewable Cloudinary URL (keeps auth/premium check server-side)
export const streamMaterialInline = async (req, res) => {
  try {
    const mat = await Material.findById(req.params.id);
    if (!mat) return res.status(404).json({ status: 'fail', message: 'Material not found' });
    const ext = getExtFromName(mat.name) || 'pdf';
    const viewUrl = cloudinary.url(mat.publicId, {
      resource_type: 'raw',
      type: 'upload',
      format: ext,
      flags: 'inline'
    });
    return res.redirect(viewUrl);
  } catch (err) {
    console.error('Inline stream error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to open material' });
  }
};

// Redirect to Cloudinary download URL with proper filename
export const streamMaterialDownload = async (req, res) => {
  try {
    const mat = await Material.findById(req.params.id);
    if (!mat) return res.status(404).json({ status: 'fail', message: 'Material not found' });
    const ext = getExtFromName(mat.name) || 'pdf';
    const safeName = mat.name || `material.${ext}`;
    const downloadUrl = cloudinary.url(mat.publicId, {
      resource_type: 'raw',
      type: 'upload',
      format: ext,
      // Use Cloudinary attachment flag with filename to force correct name on download
      flags: `attachment:${safeName}`
    });
    return res.redirect(downloadUrl);
  } catch (err) {
    console.error('Download stream error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to download material' });
  }
};
