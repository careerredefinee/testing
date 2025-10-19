import React from 'react';
import { adminService } from '../services/adminService';

const BookingForm: React.FC = () => {
  const [booking, setBooking] = React.useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    date: '',
    timeSlot: '',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const todayStr = React.useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = `${now.getMonth() + 1}`.padStart(2, '0');
    const d = `${now.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const workingSlots = React.useMemo(() => {
    const slots: string[] = [];
    for (let h = 9; h <= 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  }, []);

  const isPastTimeForToday = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = timeStr.split(':').map(Number);
    const selected = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
    const now = new Date();
    const sameDay = selected.getFullYear() === now.getFullYear() && selected.getMonth() === now.getMonth() && selected.getDate() === now.getDate();
    return sameDay && selected.getTime() <= now.getTime();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const name = booking.name.trim();
    const email = booking.email.trim();
    const phone = booking.phone.trim();
    const date = booking.date;
    const timeSlot = booking.timeSlot;
    const message = (booking.message || '').trim();

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !date || !timeSlot) {
      setErrorMsg('Please fill in name, email, date and time.');
      return;
    }
    if (!emailRe.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (date < todayStr) {
      setErrorMsg('Date cannot be in the past.');
      return;
    }
    if (isPastTimeForToday(date, timeSlot)) {
      setErrorMsg('Please choose a future time for today.');
      return;
    }

    try {
      setSubmitting(true);
      await adminService.createBooking({
        name,
        email,
        phone,
        date,
        timeSlot,
        message: message || undefined,
      });
      setSuccessMsg('Your booking request has been submitted. Please check your email for confirmation.');
      setBooking({ name: '', email: '', phone: '', message: '', date: '', timeSlot: '' });
    } catch (err: any) {
      const backend = err?.response?.data;
      const details = Array.isArray(backend?.errors)
        ? backend.errors.map((e: any) => (e?.msg || e)).join(', ')
        : (backend?.message || backend?.error);
      setErrorMsg(details || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {successMsg && (
        <div className="mb-6 rounded-md bg-green-50 p-4 text-green-800 border border-green-200">{successMsg}</div>
      )}
      {errorMsg && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800 border border-red-200">{errorMsg}</div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="booking-name">Name</label>
          <input
            id="booking-name"
            name="name"
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-green-600 focus:ring-green-600"
            value={booking.name}
            onChange={(e) => setBooking((s) => ({ ...s, name: e.target.value }))}
            placeholder="Your full name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="booking-email">Email</label>
          <input
            id="booking-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-green-600 focus:ring-green-600"
            value={booking.email}
            onChange={(e) => setBooking((s) => ({ ...s, email: e.target.value }))}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700" htmlFor="booking-phone">Phone</label>
          <input
            id="booking-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-green-600 focus:ring-green-600"
            value={booking.phone}
            onChange={(e) => setBooking((s) => ({ ...s, phone: e.target.value }))}
            placeholder="Phone number"
            
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="booking-date">Date</label>
          <input
            id="booking-date"
            name="date"
            type="date"
            min={todayStr}
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-green-600 focus:ring-green-600"
            value={booking.date}
            onChange={(e) => setBooking((s) => ({ ...s, date: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="booking-time">Time</label>
          <select
            id="booking-time"
            name="time"
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-green-600 focus:ring-green-600"
            value={booking.timeSlot}
            onChange={(e) => setBooking((s) => ({ ...s, timeSlot: e.target.value }))}
            required
          >
            <option value="">Select a time</option>
            {workingSlots.map((slot) => (
              <option key={slot} value={slot} disabled={isPastTimeForToday(booking.date, slot)}>
                {slot}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700" htmlFor="booking-message">Message (optional)</label>
          <textarea
            id="booking-message"
            name="message"
            rows={4}
            maxLength={1000}
            className="mt-1 w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-green-600 focus:ring-green-600"
            value={booking.message}
            onChange={(e) => setBooking((s) => ({ ...s, message: e.target.value }))}
            placeholder="What would you like to discuss?"
          />
        </div>
        <div className="sm:col-span-2 text-center">
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center justify-center px-6 py-3 rounded-md text-white font-semibold shadow-sm ${submitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {submitting ? 'Submitting...' : 'Request Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
