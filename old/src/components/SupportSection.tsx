import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/adminService';
import { ChevronDown, MessageSquare, Calendar, Users } from 'lucide-react';

const faqs = [
  {
    question: "What kind of support can I expect?",
    answer: "You have access to 24/7 AI-powered chat for instant answers, and you can book one-on-one video sessions with our expert mentors for personalized guidance. We're here to support every step of your career journey."
  },
  {
    question: "How do I book an appointment with a mentor?",
    answer: "Booking is simple! Just navigate to the 'Book a Session' section on this page, choose your preferred mentor, select a time that works for you, and confirm your appointment. You'll receive a confirmation email with all the details."
  },
  {
    question: "Is the AI Chatbot available anytime?",
    answer: "Yes! Our AI Career Assistant is available 24/7 to help you with a wide range of queries, from resume tips to interview practice. Get instant support, whenever you need it."
  },
  {
    question: "What topics can mentors help me with?",
    answer: "Our mentors are industry veterans who can assist with career strategy, resume and cover letter reviews, mock interviews, salary negotiation, skill development, and much more. They provide tailored advice to help you achieve your specific goals."
  },
  {
    question: "How much does a mentor session cost?",
    answer: "We offer various plans to suit different needs. Your first session is complimentary with our trial plan. For detailed pricing on subsequent sessions and packages, please visit our pricing page or contact our support team."
  }
];

const SupportSection: React.FC = () => {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  const [showBooking, setShowBooking] = React.useState(false);
  const bookingRef = React.useRef<HTMLDivElement | null>(null);
  const [booking, setBooking] = React.useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    date: '',
    timeSlot: '',
    type: 'consultation'
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  // Contact form (questions)
  const [contactName, setContactName] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [contactMessage, setContactMessage] = React.useState('');
  const [contactSubmitting, setContactSubmitting] = React.useState(false);
  const [contactSuccess, setContactSuccess] = React.useState<string | null>(null);
  const [contactError, setContactError] = React.useState<string | null>(null);
  // Premium prompt modal
  const [showPremium, setShowPremium] = React.useState(false);
  const [premiumMessage, setPremiumMessage] = React.useState<string>('This feature is available for Premium users only.');

  const todayStr = React.useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = `${now.getMonth() + 1}`.padStart(2, '0');
    const d = `${now.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const workingSlots = React.useMemo(() => {
    const slots: string[] = [];
    for (let h = 9; h < 18; h++) {
      slots.push(`${String(h).padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  const isPastTimeForToday = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return false;
    const selected = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();
    // if selected date is today, ensure time is in future
    const sameDay = selected.toDateString() === now.toDateString();
    return sameDay && selected.getTime() <= now.getTime();
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    if (!booking.name || !booking.email || !booking.phone || !booking.date || !booking.timeSlot) {
      setErrorMsg('Please fill in name, email, phone, date and time.');
      return;
    }
    if (booking.date < todayStr) {
      setErrorMsg('Date cannot be in the past.');
      return;
    }
    if (isPastTimeForToday(booking.date, booking.timeSlot)) {
      setErrorMsg('Please choose a future time for today.');
      return;
    }
    try {
      setSubmitting(true);
      await adminService.createBooking({
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        date: booking.date,
        timeSlot: booking.timeSlot,
        type: booking.type,
        message: booking.message || undefined
      });
      setSuccessMsg('Your booking request has been submitted. Please check your email for confirmation.');
      setBooking({ name: '', email: '', phone: '', message: '', date: '', timeSlot: '', type: 'consultation' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to submit booking. Please try again.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Auto-open booking if navigated with #booking
  React.useEffect(() => {
    const openIfHash = () => {
      if (window.location.hash === '#booking') {
        setShowBooking(true);
        setTimeout(() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
      }
    };
    openIfHash();
    const onHash = () => openIfHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return (
    <div className="bg-gray-50 font-sans">
      {/* Booking Form Section (hidden until clicked) - moved outside hero to avoid overlay */}
      {showBooking && (
        <div id="booking" ref={bookingRef} className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Book a Session</h2>
              <p className="mt-3 text-gray-600">Fill the form to request a session. We’ll confirm via email.</p>
            </div>
            {successMsg && (
              <div className="mb-6 rounded-md bg-green-50 p-4 text-green-800 border border-green-200">{successMsg}</div>
            )}
            {errorMsg && (
              <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800 border border-red-200">{errorMsg}</div>
            )}
            <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-green-600 focus:ring-green-600"
                  value={booking.name}
                  onChange={(e) => setBooking((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-green-600 focus:ring-green-600"
                  value={booking.email}
                  onChange={(e) => setBooking((s) => ({ ...s, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-green-600 focus:ring-green-600"
                  value={booking.phone}
                  onChange={(e) => setBooking((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="Phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  min={todayStr}
                  className="mt-1 w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-green-600 focus:ring-green-600"
                  value={booking.date}
                  onChange={(e) => setBooking((s) => ({ ...s, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <select
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
                <label className="block text-sm font-medium text-gray-700">Message (optional)</label>
                <textarea
                  rows={4}
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
        </div>
      )}

      {/* Support Options Section */}
      <div className="py-6 sm:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
  <svg xmlns="http://www.w3.org/2000/svg"
       fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
       className="w-7 h-7 text-purple-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.5 0-2.25-1-2.25-2.25S10.5 3.5 12 3.5s2.25 1 2.25 2.25S13.5 8 12 8zm0 2c1.75 0 3.5.75 3.5 2.5v1.5H8.5v-1.5C8.5 10.75 10.25 10 12 10zm0 8c-2.25 0-6.75 1.125-6.75 3.375V22h13.5v-.625C18.75 19.125 14.25 18 12 18z" />
  </svg>
  Your Success, Our Commitment
</h2>

<p className="mt-4 text-lg text-gray-700">
  <span className="text-blue-600 font-semibold">🎯 Choose</span> the support that fits 
  <span className="text-purple-600 font-semibold"> your needs 💡</span>.
</p>

          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
            
            {/* AI Chat Bot */}
            <div className="bg-gray-50 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500 text-white mx-auto mb-6">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Direct Chat with Mentors</h3>
              <p className="mt-4 text-gray-600">
                Connect instantly with experienced mentors for guidance on resumes, interviews, and career strategy. Real people. Real support.
              </p>
              <a
                href={user?.isPremium ? 'https://wa.me/919515490871?text=Hi%20Career%20Redefine%20Support' : '#chat'}
                onClick={(e) => {
                  if (!user?.isPremium) {
                    e.preventDefault();
                    setPremiumMessage('This feature is accessible only to Premium users.');
                    setShowPremium(true);
                  }
                }}
                target={user?.isPremium ? '_blank' as any : undefined}
                rel={user?.isPremium ? 'noopener noreferrer' as any : undefined}
                className="mt-6 inline-block bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Chat Now
              </a>
            </div>

            {/* Mentor Appointment */}
            <div className="bg-gray-50 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-500 text-white mx-auto mb-6">
                <Calendar size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Expert Mentor Sessions</h3>
              <p className="mt-4 text-gray-600">
                Book a one-on-one video call with an industry veteran. Get personalized advice, mock interviews, and a tailored strategy for your career goals.
              </p>
              <a
                href="#booking"
                onClick={(e) => {
                  e.preventDefault();
                  setShowBooking(true);
                  setTimeout(() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
                }}
                className="mt-6 inline-block bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
              >
                Book a Session
              </a>
            </div>

            {/* Community Hub */}
            <div className="bg-gray-50 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-500 text-white mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Community Hub</h3>
              <p className="mt-4 text-gray-600">
                Connect with peers, share experiences, and grow together in our exclusive community. Participate in forums, workshops, and networking events.
              </p>
              <a
                href={user?.isPremium ? '/groups' : '#community'}
                onClick={(e) => {
                  if (!user?.isPremium) {
                    e.preventDefault();
                    setPremiumMessage('This is a Premium feature. Please upgrade to access the Community Hub.');
                    setShowPremium(true);
                  }
                }}
                className="mt-6 inline-block bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Join Community
              </a>
            </div>

            {/* WhatsApp Support */}
            <div className="bg-gray-50 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-500 text-white mx-auto mb-6">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">WhatsApp Support</h3>
              <p className="mt-4 text-gray-600">
                Chat with us on WhatsApp for quick assistance and updates.
              </p>
              <a
                href="https://wa.me/919515490871?text=Hi%20Career%20Redefine%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
              >
                Chat Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Get Support in 3 Easy Steps</h2>
            <p className="mt-4 text-lg text-gray-600">Your journey to career clarity is simpler than you think.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Choose Your Path</h3>
              <p className="mt-2 text-gray-600">
                Decide if you need a quick answer from our AI Assistant or a deep-dive session with a personal mentor.
              </p>
            </div>
            {/* Step 2 */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Connect & Engage</h3>
              <p className="mt-2 text-gray-600">
                Start a chat with our AI instantly or browse mentor profiles and book a session that fits your schedule.
              </p>
            </div>
            {/* Step 3 */}
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mx-auto mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Achieve Your Goals</h3>
              <p className="mt-2 text-gray-600">
                Receive actionable advice, refine your strategy, and gain the confidence to take the next big step in your career.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Section */
      }
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Still Have Questions?</h2>
            <p className="mt-4 text-lg text-gray-600">
              Our team is ready to help. Fill out the form below, and we'll get back to you as soon as possible.
            </p>
          </div>
          {contactSuccess && (
            <div className="mb-6 rounded-md bg-green-50 p-4 text-green-800 border border-green-200">{contactSuccess}</div>
          )}
          {contactError && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800 border border-red-200">{contactError}</div>
          )}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setContactSuccess(null);
              setContactError(null);
              if (!contactName || !contactEmail || !contactMessage) {
                setContactError('Please fill in Name, Email and Message.');
                return;
              }
              try {
                setContactSubmitting(true);
                await adminService.createQuestion({
                  subject: 'General Question',
                  message: contactMessage,
                  name: contactName,
                  email: contactEmail,
                  phone: contactPhone || undefined,
                });
                setContactSuccess('Thanks! Your question has been submitted. We\'ll reply by email.');
                setContactName('');
                setContactEmail('');
                setContactPhone('');
                setContactMessage('');
              } catch (err: any) {
                setContactError(err?.response?.data?.message || 'Failed to send your message. Please try again.');
              } finally {
                setContactSubmitting(false);
              }
            }}
            className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
          >
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700">Name</label>
              <div className="mt-1">
                <input id="contact-name" type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
              </div>
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1">
                <input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700">Phone (optional)</label>
              <div className="mt-1">
                <input id="contact-phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700">Message</label>
              <div className="mt-1">
                <textarea id="contact-message" rows={4} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border border-gray-300 rounded-md"></textarea>
              </div>
            </div>
            <div className="sm:col-span-2 text-center">
              <button type="submit" disabled={contactSubmitting} className={`inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${contactSubmitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
                {contactSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-gray-600">
              Have questions? We have answers. If you can't find what you're looking for, feel free to contact us.
            </p>
          </div>
          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center text-left p-4 sm:p-6 focus:outline-none"
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`transform transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}
                    size={24}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaq === index ? 'max-h-96' : 'max-h-0'}`}
                >
                  <div className="p-4 sm:p-6 border-t border-gray-200">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Premium Prompt Modal */}
      {showPremium && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPremium(false)}></div>
          <div className="relative z-10 w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl p-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900">Premium Feature</h3>
            <p className="mt-3 text-gray-600">{premiumMessage}</p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <a
                href="/premium"
                className="inline-flex items-center justify-center px-5 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 font-semibold"
              >
                Explore Premium
              </a>
              <button
                onClick={() => setShowPremium(false)}
                className="inline-flex items-center justify-center px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportSection;
