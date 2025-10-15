import Group from '../models/Group.js';
import User from '../models/User.js';

// Create group (admin only)
export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ status: 'fail', message: 'Group name is required' });
    const group = await Group.create({ name: name.trim(), createdBy: req.user.id, members: [] });
    res.status(201).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// List groups (admin: all, user: my groups)
export const listGroups = async (req, res) => {
  try {
    let filter = { isDeleted: false };
    if (req.user.role !== 'admin') {
      filter.members = req.user.id;
    }
    const groups = await Group.find(filter).sort('-createdAt');
    res.status(200).json({ status: 'success', results: groups.length, data: { groups } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Add member by email (admin only, must be premium)
export const addMemberByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const { id } = req.params;
    if (!email) return res.status(400).json({ status: 'fail', message: 'Email is required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    if (!user.isPremium) return res.status(400).json({ status: 'fail', message: 'Only premium users can be added' });
    const group = await Group.findByIdAndUpdate(
      id,
      { $addToSet: { members: user._id } },
      { new: true }
    );
    if (!group || group.isDeleted) return res.status(404).json({ status: 'fail', message: 'Group not found' });
    res.status(200).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Remove member (admin only)
export const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;
    if (!userId) return res.status(400).json({ status: 'fail', message: 'userId is required' });
    const group = await Group.findByIdAndUpdate(
      id,
      { $pull: { members: userId } },
      { new: true }
    );
    if (!group || group.isDeleted) return res.status(404).json({ status: 'fail', message: 'Group not found' });
    res.status(200).json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Delete group (admin only, soft delete)
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!group) return res.status(404).json({ status: 'fail', message: 'Group not found' });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
