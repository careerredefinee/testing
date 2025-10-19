import React, { useEffect, useState } from 'react';
import { fetchMentors, Mentor } from '../services/mentorService';

const MentorsCarousel: React.FC<{ featuredOnly?: boolean }>= ({ featuredOnly = true }) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchMentors({ featured: featuredOnly });
        if (mounted) setMentors((data || []).filter(m => m.active !== false).sort((a, b) => (a.order||0) - (b.order||0)));
      } catch {}
    })();
    return () => { mounted = false; };
  }, [featuredOnly]);

  // Auto-slide every 2s through all mentors
  useEffect(() => {
    if (!mentors || mentors.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((idx) => (idx + 1) % mentors.length);
    }, 2000);
    return () => clearInterval(id);
  }, [mentors]);

  if (!mentors || mentors.length === 0) return null;

  const highlight = mentors[currentIndex] || mentors[0];

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Our Mentors</h3>
      </div>

      {/* Two-column layout within a single white card container */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow p-2 md:p-3">
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-1 items-center">
          {/* Left: Mentor Image */}
          <div className="justify-self-end">
            <div className="relative inline-block rounded-2xl overflow-hidden shadow-lg p-[18px] m-[18px] bg-white">
              <img
                src={highlight?.image}
                alt={highlight?.name}
                className="block w-auto max-w-full h-auto max-h-72 object-contain rounded-xl"
              />
              <div className="absolute top-3 right-3">
                <span className="inline-block rounded-full bg-white/90 backdrop-blur px-3 py-1 text-sm font-medium text-gray-700 shadow border">Mentor</span>
              </div>
            </div>
            {(highlight?.company || highlight?.title) && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow border">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  {highlight.company || highlight.title}
                </span>
              </div>
            )}
          </div>

          {/* Right: Mentor Content */}
          <div className="self-center justify-self-start overflow-visible text-left">
            <p className="text-xs sm:text-sm font-semibold text-emerald-600">My Mission With Career Redefine</p>
            <h2 className="mt-0 text-2xl sm:text-3xl font-extrabold text-gray-900">A Mentor’s Promise to You</h2>
            {highlight?.bio && (
              <p className="mt-3 text-gray-600 leading-relaxed">{highlight.bio}</p>
            )}
            <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="text-base sm:text-lg font-semibold text-gray-900">{highlight?.name}</div>
              <div className="text-sm text-gray-600">
                {highlight?.title}
                {highlight?.company ? ` | ${highlight.company}` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorsCarousel;
