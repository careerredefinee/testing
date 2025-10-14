import React from 'react';
import { adminService } from '../services/adminService';

const QuestionForm: React.FC = () => {
  const [contactName, setContactName] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [contactSubject, setContactSubject] = React.useState('General Question');
  const [contactMessage, setContactMessage] = React.useState('');
  const [contactSubmitting, setContactSubmitting] = React.useState(false);
  const [contactSuccess, setContactSuccess] = React.useState<string | null>(null);
  const [contactError, setContactError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(null);
    setContactError(null);

    const name = contactName.trim();
    const email = contactEmail.trim();
    const phone = (contactPhone || '').trim();
    const subject = contactSubject.trim() || 'General Question';
    const message = contactMessage.trim();

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message || !subject) {
      setContactError('Please fill in Name, Email, Subject and Message.');
      return;
    }
    if (!emailRe.test(email)) {
      setContactError('Please enter a valid email address.');
      return;
    }

    try {
      setContactSubmitting(true);
      await adminService.createQuestion({
        subject,
        message,
        name,
        email,
        phone: phone || undefined,
      });
      setContactSuccess("Thanks! Your question has been submitted. We'll reply by email.");
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactSubject('General Question');
      setContactMessage('');
    } catch (err: any) {
      setContactError(err?.response?.data?.message || 'Failed to send your message. Please try again.');
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div>
      {contactSuccess && (
        <div className="mb-6 rounded-md bg-green-50 p-4 text-green-800 border border-green-200">{contactSuccess}</div>
      )}
      {contactError && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800 border border-red-200">{contactError}</div>
      )}
      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700">Name</label>
          <div className="mt-1">
            <input id="contact-name" name="name" type="text" autoComplete="name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" required />
          </div>
        </div>
        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1">
            <input id="contact-email" name="email" type="email" inputMode="email" autoComplete="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" required />
          </div>
        </div>
        <div>
          <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700">Subject</label>
          <div className="mt-1">
            <select id="contact-subject" name="subject" value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" required>
              <option>General Question</option>
              <option>Pricing</option>
              <option>Technical Issue</option>
              <option>Mentor Session</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700">Phone (optional)</label>
          <div className="mt-1">
            <input id="contact-phone" name="phone" type="tel" inputMode="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700">Message</label>
          <div className="mt-1">
            <textarea id="contact-message" name="message" rows={5} maxLength={2000} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border border-gray-300 rounded-md" required></textarea>
          </div>
        </div>
        <div className="sm:col-span-2 text-center">
          <button type="submit" disabled={contactSubmitting} className={`inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${contactSubmitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}>
            {contactSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
