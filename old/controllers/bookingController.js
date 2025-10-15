import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Email from '../utils/email.js';

// Helper function to filter object fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { name, email, phone, message, date, timeSlot, type } = req.body;

    if (!name || !email || !phone || !date || !timeSlot) {
      return res.status(400).json({ status: 'fail', message: 'name, email, phone, date, and timeSlot are required' });
    }

    const bookingDate = new Date(date);
    if (Number.isNaN(bookingDate.getTime())) {
      return res.status(400).json({ status: 'fail', message: 'Invalid date' });
    }

    const now = new Date();
    const isSameDay = bookingDate.toDateString() === now.toDateString();
    if (bookingDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      return res.status(400).json({ status: 'fail', message: 'Date cannot be in the past' });
    }
    if (isSameDay) {
      // Validate that selected timeSlot is not in the past for today
      const [hh, mm] = String(timeSlot).split(':').map((x) => parseInt(x, 10));
      if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
        return res.status(400).json({ status: 'fail', message: 'Invalid timeSlot format' });
      }
      const slotMinutes = hh * 60 + mm;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (slotMinutes <= nowMinutes) {
        return res.status(400).json({ status: 'fail', message: 'Time must be in the future' });
      }
    }

    const payload = {
      user: req.user?.id || undefined,
      name,
      email,
      phone,
      message,
      date: bookingDate,
      timeSlot,
      type: type || 'consultation',
      status: 'pending'
    };

    const newBooking = await Booking.create(payload);

    // Send confirmation email to user
    const userEmail = new Email(
      { email, name },
      `${req.protocol}://${req.get('host')}/bookings/${newBooking._id}`
    );
    await userEmail.send('bookingConfirmation', 'Your Booking Request Received', {
      name,
      date: bookingDate.toDateString(),
      time: timeSlot,
      bookingId: newBooking._id,
      supportEmail: process.env.EMAIL_FROM,
    });

    // Notify admin about new booking (reuse bookingStatusUpdate template with pending status)
    const configuredAdminEmailNew = process.env.ADMIN_EMAIL;
    if (configuredAdminEmailNew) {
      const adminEmailer = new Email(
        { email: configuredAdminEmailNew, name: 'Admin' },
        `${req.protocol}://${req.get('host')}/admin#appointments`
      );
      await adminEmailer.send('bookingStatusUpdate', 'New Booking Request', {
        firstName: 'Admin',
        status: 'pending',
        date: bookingDate.toDateString(),
        time: timeSlot,
        bookingId: newBooking._id,
      });
    } else {
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        const adminEmail = new Email(
          { email: admin.email, name: admin.name },
          `${req.protocol}://${req.get('host')}/admin#appointments`
        );
        await adminEmail.send('bookingStatusUpdate', 'New Booking Request', {
          firstName: admin.name?.split(' ')[0] || 'Admin',
          status: 'pending',
          date: bookingDate.toDateString(),
          time: timeSlot,
          bookingId: newBooking._id,
        });
      }
    }

    res.status(201).json({ status: 'success', data: { booking: newBooking } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Get all bookings (admin only)
export const getAllBookings = async (req, res) => {
  try {
    const { status, startDate, endDate, user, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (user) query.user = user;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (p - 1) * l;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('user', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(l),
      Booking.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      pagination: { page: p, limit: l, total },
      data: { bookings }
    });
  } catch (err) {
    console.error('getAllBookings error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving bookings'
    });
  }
};

// Get a single booking
export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID'
      });
    }

    // Check if user is authorized to view this booking
    // If booking has no user (anonymous), only admin can view
    if (req.user?.role !== 'admin') {
      if (!booking.user || booking.user._id.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to view this booking'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      data: { booking }
    });
  } catch (err) {
    console.error('getBooking error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving booking'
    });
  }
};

// Update booking status (admin only)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, meetingLink, message, adminNotes } = req.body;
    const { id } = req.params;

    const update = { status };
    if (meetingLink) update.meetingLink = meetingLink;
    if (adminNotes) update.notes = adminNotes;

    const booking = await Booking.findByIdAndUpdate(id, update, { new: true, runValidators: true }).populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID'
      });
    }

    // Send status update email to user
    const statusUpdateEmail = new Email(
      { email: booking.email || booking.user?.email, name: booking.name || booking.user?.name },
      `${req.protocol}://${req.get('host')}/bookings/${booking._id}`
    );
    await statusUpdateEmail.send('bookingStatusUpdate', `Booking ${String(status).charAt(0).toUpperCase() + String(status).slice(1)}`, {
      name: booking.name || booking.user?.name,
      date: booking.date ? booking.date.toDateString() : '',
      time: booking.timeSlot,
      status,
      meetingLink: meetingLink || booking.meetingLink,
      adminNotes: message || adminNotes || undefined,
    });

    // Also notify admin about the status change (approved/rejected/pending...)
    try {
      const configuredAdminEmail = process.env.ADMIN_EMAIL;
      const subject = `Booking ${String(status).charAt(0).toUpperCase() + String(status).slice(1)}`;
      if (configuredAdminEmail) {
        const adminEmailer = new Email(
          { email: configuredAdminEmail, name: 'Admin' },
          `${req.protocol}://${req.get('host')}/admin#appointments`
        );
        await adminEmailer.send('bookingStatusUpdate', subject, {
          firstName: 'Admin',
          status,
          date: booking.date ? booking.date.toDateString() : '',
          time: booking.timeSlot,
          bookingId: booking._id,
          meetingLink: meetingLink || booking.meetingLink,
          adminNotes: message || adminNotes || undefined,
        });
      } else {
        const admin = await User.findOne({ role: 'admin' });
        if (admin?.email) {
          const adminEmail = new Email(
            { email: admin.email, name: admin.name || 'Admin' },
            `${req.protocol}://${req.get('host')}/admin#appointments`
          );
          await adminEmail.send('bookingStatusUpdate', subject, {
            firstName: (admin.name || 'Admin').split(' ')[0],
            status,
            date: booking.date ? booking.date.toDateString() : '',
            time: booking.timeSlot,
            bookingId: booking._id,
            meetingLink: meetingLink || booking.meetingLink,
            adminNotes: message || adminNotes || undefined,
          });
        }
      }
    } catch (e) {
      // Do not fail the response if admin email fails
      console.warn('Admin booking status email failed:', e?.message);
    }

    res.status(200).json({
      status: 'success',
      data: { booking }
    });
  } catch (err) {
    console.error('updateBookingStatus error:', err);
    res.status(400).json({
      status: 'fail',
      message: 'Error updating booking status'
    });
  }
};

// Cancel a booking
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID'
      });
    }

    // Check if user is authorized to cancel this booking
    if (req.user?.role !== 'admin') {
      if (!booking.user || booking.user.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'fail',
          message: 'You are not authorized to cancel this booking'
        });
      }
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    booking.cancelledAt = Date.now();
    if (req.user.role === 'admin') {
      booking.cancelledBy = {
        user: req.user.id,
        reason: req.body.reason || 'Cancelled by admin'
      };
    } else {
      booking.cancelledBy = {
        user: req.user.id,
        reason: req.body.reason || 'Cancelled by user'
      };
    }

    await booking.save();

    // Send cancellation email using status update template
    const populatedBooking = await Booking.findById(booking._id).populate('user', 'name email');

    const cancelEmail = new Email(
      { email: populatedBooking.email || populatedBooking.user?.email, name: populatedBooking.name || populatedBooking.user?.name },
      `${req.protocol}://${req.get('host')}/bookings`
    );
    await cancelEmail.send('bookingStatusUpdate', 'Booking Cancelled', {
      name: populatedBooking.name || populatedBooking.user?.name,
      date: populatedBooking.date.toDateString(),
      time: populatedBooking.timeSlot,
      status: 'cancelled',
      adminNotes: populatedBooking.cancelledBy?.reason,
    });

    res.status(200).json({
      status: 'success',
      data: { booking: populatedBooking }
    });
  } catch (err) {
    console.error('cancelBooking error:', err);
    res.status(400).json({
      status: 'fail',
      message: 'Error cancelling booking'
    });
  }
};

// Get user's bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort('-date');

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving your bookings'
    });
  }
};

// Add admin note to booking
export const addAdminNote = async (req, res) => {
  try {
    const { note } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          adminNotes: {
            note,
            createdBy: req.user.id
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { booking }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Error adding admin note'
    });
  }
};

// Get available time slots
export const getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ status: 'fail', message: 'Please provide date' });
    }

    const selected = new Date(String(date));
    if (Number.isNaN(selected.getTime())) {
      return res.status(400).json({ status: 'fail', message: 'Invalid date' });
    }
    const startOfDay = new Date(selected);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selected);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    });

    const workingHours = { start: 9, end: 18 };
    const allSlots = [];
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      allSlots.push(timeString);
    }

    const bookedSlots = bookings.map((b) => b.timeSlot);
    const availableSlots = allSlots.filter((s) => !bookedSlots.includes(s));

    res.status(200).json({ status: 'success', data: { availableSlots } });
  } catch (err) {
    console.error('getAvailableSlots error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving available slots'
    });
  }
};

// Hard delete a booking (admin only)
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID'
      });
    }

    return res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    console.error('deleteBooking error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Error deleting booking'
    });
  }
};
