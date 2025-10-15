import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

interface QueryFormData {
  subject: string;
  message: string;
  course?: string;
  phone?: string;
  name?: string;
  email?: string;
}

interface QueryFormProps {
  courseId?: string;
  courseName?: string;
  defaultSubject?: string;
  onSuccess?: () => void;
  className?: string;
}

const QueryForm: React.FC<QueryFormProps> = ({ courseId, courseName, defaultSubject, onSuccess, className = '' }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QueryFormData>({
    defaultValues: {
      name: (user as any)?.name || '',
      email: (user as any)?.email || '',
    }
  });

  const onSubmit: SubmitHandler<QueryFormData> = async (data) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      
      const payload = {
        ...data,
        ...(courseId && { course: courseId }),
      };

      // fast submit: direct post without extra transformations
      await api.post('/api/v1/queries', payload);
      
      setSubmitSuccess(true);
      reset();
      if (onSuccess) onSuccess();
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Failed to submit query. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-blue-100 ring-1 ring-blue-50 ${className} max-w-sm mx-auto`}>
      <div className="p-4">
        <h2 className="text-xl font-extrabold text-gray-900">Course Enquiry</h2>
      
      {submitSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-[61] w-72 bg-white rounded-2xl p-6 shadow-2xl border border-green-200 text-center">
            <svg className="mx-auto mb-3" width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="9" stroke="#22c55e" strokeWidth="2"/>
            </svg>
            <div className="text-lg font-semibold text-gray-900">Sent Successfully</div>
            <div className="text-sm text-gray-600 mt-1">We have received your query.</div>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="mt-4 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {submitError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-0 divide-y divide-gray-100">
        {courseName && (
          <div className="py-3">
            <label className="block text-sm font-medium text-gray-800">Course</label>
            <input
              type="text"
              value={courseName}
              readOnly
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-800 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}
        {/* Always show Name and Email; prefill from user if available */}
        <div className="py-3">
          <label htmlFor="name" className="block text-sm font-medium text-gray-800">
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            defaultValue={(user as any)?.name || ''}
            {...register('name', { required: 'Name is required' })}
            className={`mt-1 block w-full rounded-lg border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } bg-white shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        
        <div className="py-3">
          <label htmlFor="email" className="block text-sm font-medium text-gray-800">
            Email *
          </label>
          <input
            type="email"
            id="email"
            defaultValue={(user as any)?.email || ''}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            className={`mt-1 block w-full rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } bg-white shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        
        <div className="py-3">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-800">
            Phone (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            {...register('phone')}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        
        {/* Subject is required but hidden from UI; keep it auto-filled */}
        <input
          type="hidden"
          id="subject"
          defaultValue={defaultSubject || (courseName ? `Query about ${courseName}` : 'Course enquiry')}
          {...register('subject', { required: 'Subject is required' })}
        />
        
        <div className="py-3">
          <label htmlFor="message" className="block text-sm font-medium text-gray-800">
            Your Message *
          </label>
          <textarea
            id="message"
            rows={3}
            {...register('message', { required: 'Message is required' })}
            className={`mt-1 block w-full rounded-lg border ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            } bg-white shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-blue-500`}
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>
        
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-blue-600/80 rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Query'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
;

export default QueryForm;
