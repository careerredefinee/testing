import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/available-slots', bookingController.getAvailableSlots);
router.post('/', bookingController.createBooking);

// Protect all routes after this middleware
router.use(protect);

// User routes
router.get('/my-bookings', bookingController.getMyBookings);

// Single booking routes
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(restrictTo('admin'), bookingController.updateBookingStatus)
  .delete(bookingController.cancelBooking);

// Admin routes
router.use(restrictTo('admin'));

router.get('/', bookingController.getAllBookings);
router.post('/:id/notes', bookingController.addAdminNote);

// Hard delete (admin only)
router.delete('/:id/hard-delete', bookingController.deleteBooking);

// Get bookings by status
router.get('/status/:status', bookingController.getAllBookings);

// Get bookings by date range
router.get('/date-range', bookingController.getAllBookings);

export default router;
