import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';

type ReviewItem = {
  _id: string;
  comment: string;
  rating: number;
  createdAt?: string;
  user?: { name?: string; photo?: string };
  course?: { _id: string; title?: string };
};

const ReviewsSection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  // course is optional in UI; rating is numeric with a default value
  const [form, setForm] = useState<{ course?: string; rating: number; comment: string }>({ rating: 5, comment: '' });

  // Emoji mapping for rating feedback (only emojis, no labels)
  const emojiByRating: Record<number, string> = {
    1: '😭', // Crying
    2: '😢', // Very sad
    3: '😐', // Normal
    4: '😊', // Happy
    5: '🤩', // Extremely happy
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await reviewService.getAll({ limit: 12 });
        const list = (res?.data?.reviews ?? res?.reviews ?? []) as ReviewItem[];
        if (mounted) setReviews(list);
      } catch (e) {
        console.error('Failed to load reviews', e);
        if (mounted) setError('Failed to load reviews');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rating || !form.comment) {
      alert('Rating and Comment are required');
      return;
    }
    const ratingNum = Number(form.rating);
    if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      alert('Rating must be between 1 and 5');
      return;
    }
    try {
      setCreating(true);
      const res = await reviewService.create({
        rating: ratingNum,
        comment: form.comment,
      });
      const created: ReviewItem = res?.data?.review ?? res?.review ?? res;
      if (created?._id) {
        setReviews((prev) => [created, ...prev]);
        setForm({ rating: 5, comment: '' });
        setShowForm(false);
      }
    } catch (err: any) {
      console.error('Create review failed', err);
      alert(err?.response?.data?.message || 'Failed to create review. Make sure you are enrolled in this course.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-gray-50 font-sans">
      

      {isAuthenticated && showForm && (
        <div className="py-10">
          <div className="max-w-3xl mx-auto px-4">
            <div className="rounded-2xl border border-gray-200 shadow-2xl bg-white/90 backdrop-blur-sm p-6 sm:p-8">
              <h3 className="text-2xl font-bold text-gray-900">Add Your Review</h3>
              <p className="text-gray-600 mt-1">Share your experience to help others choose better.</p>
              <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Clickable star rating with emoji feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your rating</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starValue = i + 1;
                        const active = form.rating >= starValue;
                        return (
                          <button
                            key={starValue}
                            type="button"
                            aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
                            onClick={() => setForm({ ...form, rating: starValue })}
                            className="focus:outline-none transition-transform hover:-translate-y-0.5"
                          >
                            <Star className={`h-8 w-8 ${active ? 'text-yellow-400 fill-current drop-shadow' : 'text-gray-300'}`} />
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center">
                      <span className="text-3xl" aria-hidden>
                        {emojiByRating[form.rating]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your review</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Share your experience (min 3 characters)"
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    rows={5}
                    required
                    minLength={3}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={creating}
                    className={`inline-flex items-center rounded-full px-6 py-2.5 text-white ${creating ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'} shadow-md`}
                  >
                    {creating ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="py-8 sm:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
  <svg xmlns="http://www.w3.org/2000/svg" 
       fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" 
       className="w-7 h-7 text-yellow-500">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.91c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.364 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.083 10.1c-.783-.57-.38-1.81.588-1.81h4.91a1 1 0 00.95-.69l1.518-4.674z" />
  </svg>
  What Our Learners Say
</h2>

          </div>
          {/* Actions: Add Review or Login prompt */}
          <div className="flex justify-center mb-6">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setShowForm((prev) => !prev)}
                className="inline-flex items-center rounded-full px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
              >
                {showForm ? 'Close Review Form' : 'Add Review'}
              </button>
            ) : (
              <a
                href="/login"
                className="inline-flex items-center rounded-full px-5 py-2.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
              >
                Login to Add Review
              </a>
            )}
          </div>
          {loading && <div className="text-center text-gray-500">Loading reviews...</div>}
          {error && <div className="text-center text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white p-8 rounded-xl shadow-lg flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-4">
                      {(rev.user?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-gray-900">{rev.user?.name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-600">{rev.course?.title || 'Course'}</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    {Array.from({ length: Math.max(0, Math.min(5, rev.rating ?? 0)) }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
