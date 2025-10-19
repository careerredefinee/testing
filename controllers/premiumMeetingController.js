import PremiumMeeting from '../models/PremiumMeeting.js';
import Email from '../utils/email.js';

// Create a meeting request (user)
export const createMeetingRequest = async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ status: 'fail', message: 'Name and email are required' });
    }
    const meeting = await PremiumMeeting.create({
      user: req.user._id,
      name,
      email,
      message: message || ''
    });
    res.status(201).json({ status: 'success', data: { meeting } });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
};

// List my meeting requests (user)
export const listMyMeetings = async (req, res) => {
  try {
    const meetings = await PremiumMeeting.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: meetings.length, data: { meetings } });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
};

// Admin: list all meeting requests
export const listAllMeetings = async (req, res) => {
  try {
    const meetings = await PremiumMeeting.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: meetings.length, data: { meetings } });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
};

// Admin: approve or reject and optionally set meeting link and schedule
export const updateMeetingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, meetingLink, scheduledAt } = req.body || {};
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid status' });
    }
    const update = { status };
    if (typeof meetingLink === 'string') update.meetingLink = meetingLink;
    if (scheduledAt) update.scheduledAt = new Date(scheduledAt);

    const meeting = await PremiumMeeting.findByIdAndUpdate(id, update, { new: true });
    if (!meeting) return res.status(404).json({ status: 'fail', message: 'Meeting not found' });

    // Send email notification to the user
    try {
      const user = { name: meeting.name, email: meeting.email };
      const url = meeting.meetingLink || '';
      const mailer = new Email(user, url);
      if (status === 'approved') {
        await mailer.send('premiumMeetingApproved', 'Your Premium Meeting is Approved', {
          meetingLink: meeting.meetingLink,
          scheduledAt: meeting.scheduledAt ? new Date(meeting.scheduledAt).toLocaleString() : null,
        });
      } else if (status === 'rejected') {
        await mailer.send('premiumMeetingRejected', 'Your Premium Meeting Request Update', {
          reason: 'Your request was not approved at this time.',
        });
      }
    } catch (e) {
      // Log and continue; do not block API response on mail errors
      console.error('Premium meeting email failed:', e?.message || e);
    }

    res.status(200).json({ status: 'success', data: { meeting } });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
};

// Admin: delete meeting (optional)
export const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await PremiumMeeting.findByIdAndDelete(id);
    if (!meeting) return res.status(404).json({ status: 'fail', message: 'Meeting not found' });
    res.status(204).json({ status: 'success' });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
};
