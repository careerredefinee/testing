import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Group from '../models/Group.js';
import GroupMessage from '../models/GroupMessage.js';

let ioInstance = null;
export const setIO = (io) => { ioInstance = io; };

// Multer: memory storage for media uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  },
});
export const uploadMessageMedia = upload.single('media');

const isMember = async (groupId, userId) => {
  const group = await Group.findOne({ _id: groupId, isDeleted: false });
  if (!group) return { ok: false, err: 'Group not found' };
  const member = group.members.some((m) => m.toString() === String(userId));
  if (!member && String(group.createdBy) !== String(userId) && (req?.user?.role !== 'admin')) {
    return { ok: false, err: 'Not a member of this group' };
  }
  return { ok: true, group };
};

export const listMessages = async (req, res) => {
  try {
    const { id } = req.params; // group id
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const group = await Group.findOne({ _id: id, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'fail', message: 'Group not found' });
    const member = group.members.some((m) => m.toString() === String(req.user.id));
    if (!member && req.user.role !== 'admin' && String(group.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ status: 'fail', message: 'Not a member of this group' });
    }

    const messages = await GroupMessage.find({ group: id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name email role');

    res.status(200).json({ status: 'success', results: messages.length, data: { messages } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params; // group id
    const { text } = req.body;

    const group = await Group.findOne({ _id: id, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'fail', message: 'Group not found' });
    const member = group.members.some((m) => m.toString() === String(req.user.id));
    if (!member && req.user.role !== 'admin' && String(group.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ status: 'fail', message: 'Not a member of this group' });
    }

    let media = undefined;
    if (req.file) {
      // derive extension
      const originalName = req.file.originalname || 'file.dat';
      const dotIdx = originalName.lastIndexOf('.');
      const ext = dotIdx !== -1 ? originalName.substring(dotIdx + 1).toLowerCase() : undefined;
      const isImage = req.file.mimetype.startsWith('image/');

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: isImage ? 'image' : 'raw',
            folder: 'career-redefine/group-media',
            public_id: `group-${id}-${Date.now()}`,
            format: ext,
            use_filename: true,
            unique_filename: true,
            flags: 'inline',
          },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });

      media = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: isImage ? 'image' : 'file',
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    }

    if (!text && !media) {
      return res.status(400).json({ status: 'fail', message: 'Message must have text or media' });
    }

    const message = await GroupMessage.create({
      group: id,
      sender: req.user.id,
      text: text?.trim(),
      media,
    });

    const populated = await message.populate('sender', 'name email role');

    // Emit via socket.io to room
    if (ioInstance) ioInstance.to(`group:${id}`).emit('group:message', { action: 'created', message: populated });

    res.status(201).json({ status: 'success', data: { message: populated } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const msg = await GroupMessage.findById(messageId);
    if (!msg) return res.status(404).json({ status: 'fail', message: 'Message not found' });

    // Fetch group to validate membership
    const group = await Group.findById(msg.group);
    const isSender = String(msg.sender) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isSender && !isAdmin) return res.status(403).json({ status: 'fail', message: 'Not allowed' });

    msg.isDeleted = true;
    await msg.save();

    if (ioInstance) ioInstance.to(`group:${msg.group}`).emit('group:message', { action: 'deleted', messageId: msg._id });

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
