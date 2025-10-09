import Question from '../models/Question.js';
import Email from '../utils/email.js';

// Create a new question (public)
export const createQuestion = async (req, res) => {
  try {
    const { name, email, phone, subject = 'General Question', message } = req.body;

    const created = await Question.create({
      name,
      email,
      phone,
      subject,
      message,
      status: 'new',
      source: 'contact_form'
    });

    // Send confirmation email to the user (best-effort)
    try {
      if (email) {
        const userEmailer = new Email(
          { email, name },
          `${req.protocol}://${req.get('host')}/contact`
        );
        await userEmailer.send('queryConfirmation', 'We received your question', {
          name,
          subject: created.subject,
          message: created.message,
          supportEmail: process.env.EMAIL_FROM,
        });
      }
    } catch (e) {
      console.warn('Question user confirmation email failed:', e?.message);
    }

    // Notify admin (best-effort)
    try {
      const configuredAdmin = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
      if (configuredAdmin) {
        const emailer = new Email({ email: configuredAdmin, name: 'Admin' }, `${req.protocol}://${req.get('host')}/admin#questions`);
        await emailer.send('adminNewQuery', 'New Question Submitted', {
          adminName: 'Admin',
          userName: name,
          userEmail: email,
          subject: created.subject,
          message: created.message,
          adminUrl: `${req.protocol}://${req.get('host')}/admin#questions`,
        });
      } else {
        // Fallback to first admin user in DB
        const adminUser = await (await import('../models/User.js')).default.findOne({ role: 'admin' });
        if (adminUser?.email) {
          const emailer = new Email({ email: adminUser.email, name: adminUser.name || 'Admin' }, `${req.protocol}://${req.get('host')}/admin#questions`);
          await emailer.send('adminNewQuery', 'New Question Submitted', {
            adminName: adminUser.name || 'Admin',
            userName: name,
            userEmail: email,
            subject: created.subject,
            message: created.message,
            adminUrl: `${req.protocol}://${req.get('host')}/admin#questions`,
          });
        }
      }
    } catch (e) {
      // Do not fail the request if email fails
      console.warn('Question admin email failed:', e?.message);
    }

    res.status(201).json({ status: 'success', data: { question: created } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Admin: get all questions
export const getAllQuestions = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const q = {};
    if (status) q.status = status;
    if (startDate || endDate) {
      q.createdAt = {};
      if (startDate) q.createdAt.$gte = new Date(startDate);
      if (endDate) q.createdAt.$lte = new Date(endDate);
    }
    const questions = await Question.find(q).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: questions.length, data: { questions } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error retrieving questions' });
  }
};

// Admin: get single question
export const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ status: 'fail', message: 'No question found with that ID' });
    res.status(200).json({ status: 'success', data: { question } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error retrieving question' });
  }
};

// Admin: delete question
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ status: 'fail', message: 'No question found with that ID' });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Error deleting question' });
  }
};
