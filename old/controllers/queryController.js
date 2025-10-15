import Query from '../models/Query.js';
import User from '../models/User.js';
import Email from '../utils/email.js';

// Create a new query
const sendQueryEmails = async (query, req) => {
  try {
    const userEmail = query.user ? query.user.email : query.email;
    const userName = query.user ? query.user.name : query.name;

    // Send confirmation email to user
    const userEmailInstance = new Email(
      { email: userEmail, name: userName },
      `${req.protocol}://${req.get('host')}/queries/${query._id}`
    );
    await userEmailInstance.send('queryConfirmation', 'Query Received', {
      name: userName,
      subject: query.subject,
      message: query.message,
      supportEmail: process.env.EMAIL_FROM,
    });

    // Notify admin about new query
    const configuredAdminEmail = process.env.ADMIN_EMAIL;
    if (configuredAdminEmail) {
      const adminEmailer = new Email(
        { email: configuredAdminEmail, name: 'Admin' },
        `${req.protocol}://${req.get('host')}/admin/queries/${query._id}`
      );
      await adminEmailer.send('adminNewQuery', 'New Query Received', {
        adminName: 'Admin',
        userName,
        userEmail,
        subject: query.subject,
        message: query.message,
        adminUrl: `${req.protocol}://${req.get('host')}/admin/queries/${query._id}`,
      });
    } else {
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        const adminEmail = new Email(
          { email: admin.email, name: admin.name },
          `${req.protocol}://${req.get('host')}/admin/queries/${query._id}`
        );
        await adminEmail.send('adminNewQuery', 'New Query Received', {
          adminName: admin.name,
          userName,
          userEmail,
          subject: query.subject,
          message: query.message,
          adminUrl: `${req.protocol}://${req.get('host')}/admin/queries/${query._id}`,
        });
      }
    }
  } catch (emailError) {
    console.error('Failed to send query emails:', emailError);
  }
};

export const createQuery = async (req, res) => {
  try {
    const { name, email, subject, message, phone, course } = req.body;
    const userId = req.user?.id;

    // Create new query
    const newQuery = await Query.create({
      user: userId,
      name: userId ? undefined : name,
      email: userId ? undefined : email,
      phone: userId ? undefined : phone,
      subject,
      message,
      course,
      status: 'new'
    });

    // Populate user details if logged in
    if (userId) {
      await newQuery.populate('user', 'name email phone');
    }

    res.status(201).json({
      status: 'success',
      data: { query: newQuery }
    });

    // Send emails after sending the response
    sendQueryEmails(newQuery, req);

  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get all queries (admin only)
export const getAllQueries = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // If not admin, only show user's own queries
    if (req.user.role !== 'admin') {
      query.$or = [
        { user: req.user.id },
        { email: req.user.email }
      ];
    }

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (p - 1) * l;

    const [queries, total] = await Promise.all([
      Query.find(query)
        .populate('user', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(l),
      Query.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      results: queries.length,
      pagination: { page: p, limit: l, total },
      data: { queries }
    });
  } catch (err) {
    console.error('getAllQueries error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving queries'
    });
  }
};

// Get a single query
export const getQuery = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('user', 'name email')
      .populate('responses.admin', 'name email');

    if (!query) {
      return res.status(404).json({
        status: 'fail',
        message: 'No query found with that ID'
      });
    }

    // Check if user is authorized to view this query
    if (
      req.user.role !== 'admin' && 
      query.user?._id.toString() !== req.user.id && 
      query.email !== req.user.email
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view this query'
      });
    }

    // Mark as read if it's the user viewing their own query
    if (query.status === 'new' && 
        (query.user?._id.toString() === req.user.id || query.email === req.user.email)) {
      query.status = 'read';
      await query.save();
    }

    res.status(200).json({
      status: 'success',
      data: { query }
    });
  } catch (err) {
    console.error('getQuery error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving query'
    });
  }
};

// Update query status (admin only)
export const updateQueryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const query = await Query.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
    .populate('user', 'name email');

    if (!query) {
      return res.status(404).json({
        status: 'fail',
        message: 'No query found with that ID'
      });
    }

    // Send status update email to user if email exists
    if (query.user?.email || query.email) {
      const userEmail = query.user?.email || query.email;
      const userName = query.user?.name || query.name;
      const statusEmail = new Email(
        { email: userEmail, name: userName },
        `${req.protocol}://${req.get('host')}/queries/${query._id}`
      );
      await statusEmail.send('queryStatusUpdate', `Query ${status.charAt(0).toUpperCase() + status.slice(1)}`, {
        name: userName,
        subject: query.subject,
        status: status.charAt(0).toUpperCase() + status.slice(1),
        message: req.body.message || 'No additional information provided.',
        supportEmail: process.env.EMAIL_FROM,
      });
    }

    res.status(200).json({
      status: 'success',
      data: { query }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Error updating query status'
    });
  }
};

// Reply to a query (admin only)
export const replyToQuery = async (req, res) => {
  try {
    const { reply } = req.body;
    
    if (!reply) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a reply message'
      });
    }

    const query = await Query.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          responses: {
            message: reply,
            isAdmin: true,
            admin: req.user.id
          }
        },
        status: 'in_progress',
        lastResponseAt: Date.now(),
        isRead: false
      },
      { new: true, runValidators: true }
    )
    .populate('user', 'name email')
    .populate('responses.admin', 'name email');

    if (!query) {
      return res.status(404).json({
        status: 'fail',
        message: 'No query found with that ID'
      });
    }

    // Send reply email to user
    if (query.user?.email || query.email) {
      const userEmail = query.user?.email || query.email;
      const userName = query.user?.name || query.name;
      const replyEmail = new Email(
        { email: userEmail, name: userName },
        `${req.protocol}://${req.get('host')}/queries/${query._id}`
      );
      await replyEmail.send('queryReply', `Re: ${query.subject}`, {
        name: userName,
        subject: query.subject,
        message: query.message,
        reply: reply,
        adminName: req.user.name,
        supportEmail: process.env.EMAIL_FROM,
      });
    }

    res.status(200).json({
      status: 'success',
      data: { query }
    });
  } catch (err) {
    console.error('replyToQuery error:', err);
    res.status(400).json({
      status: 'fail',
      message: 'Error replying to query'
    });
  }
};

// Get my queries (for logged-in users)
export const getMyQueries = async (req, res) => {
  try {
    const queries = await Query.find({
      $or: [
        { user: req.user.id },
        { email: req.user.email }
      ]
    })
    .populate('course', 'title')
    .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: queries.length,
      data: { queries }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving your queries'
    });
  }
};

// Get query statistics (admin only)
export const getQueryStats = async (req, res) => {
  try {
    const stats = await Query.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$count' },
          statuses: {
            $push: {
              status: '$_id',
              count: '$count'
            }
          }
        }
      },
      {
        $addFields: {
          statuses: {
            $map: {
              input: ['new', 'read', 'replied', 'resolved', 'closed'],
              as: 'status',
              in: {
                $let: {
                  vars: {
                    statusDoc: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$statuses',
                            as: 's',
                            cond: { $eq: ['$$s.status', '$$status'] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: {
                    status: '$$status',
                    count: { $ifNull: ['$$statusDoc.count', 0] },
                    percentage: {
                      $multiply: [
                        {
                          $cond: [
                            { $eq: ['$total', 0] },
                            0,
                            {
                              $divide: [
                                { $ifNull: ['$$statusDoc.count', 0] },
                                '$total'
                              ]
                            }
                          ]
                        },
                        100
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: { stats: stats[0] || { total: 0, statuses: [] } }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving query statistics'
    });
  }
};

// Delete a query (admin only)
export const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const query = await Query.findByIdAndDelete(id);

    if (!query) {
      return res.status(404).json({
        status: 'fail',
        message: 'No query found with that ID'
      });
    }

    return res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Error deleting query'
    });
  }
};
