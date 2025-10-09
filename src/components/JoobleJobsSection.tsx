import React, { useEffect, useState } from 'react';
import { MapPin, Building, ExternalLink } from 'lucide-react';
import { joobleService, JoobleJob } from '../services/joobleService';

type Props = { query?: string };

const JoobleJobsSection: React.FC<Props> = ({ query }) => {
  const [jobs, setJobs] = useState<JoobleJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(6); // initial visible items
  const PAGE_STEP = 2; // reveal 2 more per click

  const ensureIndia = (loc: string) => {
    const trimmed = (loc || '').trim();
    if (!trimmed) return 'India';
    return /india/i.test(trimmed) ? trimmed : `${trimmed}, India`;
  };

  const parseQuery = (q?: string): { keywords: string; location: string } => {
    const raw = (q || '').trim();
    if (!raw) return { keywords: 'developer OR engineer', location: 'Karnataka' };
    const inIdx = raw.toLowerCase().lastIndexOf(' in ');
    if (inIdx > 0) {
      const kw = raw.slice(0, inIdx).trim();
      const loc = raw.slice(inIdx + 4).trim();
      return { keywords: kw || 'developer OR engineer', location: loc || 'Karnataka' };
    }
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return { keywords: parts[0] || 'developer OR engineer', location: parts.slice(1).join(', ') || 'Karnataka' };
    }
    return { keywords: raw, location: raw };
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { keywords: kw, location: locQ } = parseQuery(query);
        const data = await joobleService.getJobs({ keywords: kw, location: ensureIndia(locQ), radius: 10, page: 1 });
        if (mounted) {
          setJobs(data);
          setPage(1);
          setVisible(6);
        }
      } catch (e: any) {
        console.error('Failed to load Jooble jobs', e);
        if (mounted) setError('Failed to load external jobs');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [query]);

  const onViewMore = async () => {
    try {
      // If we already have enough items loaded, just increase visibility
      if (visible + PAGE_STEP <= jobs.length) {
        setVisible(visible + PAGE_STEP);
        return;
      }
      // Otherwise fetch next page and append, then increase visibility
      const nextPage = page + 1;
      const { keywords: kw, location: locQ } = parseQuery(query);
      const more = await joobleService.getJobs({ keywords: kw, location: ensureIndia(locQ), radius: 10, page: nextPage });
      if (more && more.length > 0) {
        setJobs(prev => [...prev, ...more]);
        setPage(nextPage);
        setVisible(visible + PAGE_STEP);
      } else {
        // No more jobs available
        setVisible(Math.min(visible + PAGE_STEP, jobs.length));
      }
    } catch (e) {
      console.error('Failed to load more Jooble jobs', e);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Other Latest Jobs in India</h2>
          <p className="mt-3 text-gray-600">Showing results across India. Use the search at the top of this page to refine by role or location.</p>
        </div>
        {loading && <div className="text-center text-gray-500">Loading jobs...</div>}
        {error && <div className="text-center text-red-600">{error}</div>}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center text-gray-500">No external jobs found at the moment.</div>
        )}
        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.slice(0, visible).map((job, idx) => (
                <div key={(job.id || job.link || String(idx))} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-blue-300 transition-colors">
                  <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                  <div className="mt-2 flex items-center text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    <span>{job.company || 'Company'}</span>
                  </div>
                  {(
                    () => {
                      const loc = job.location?.trim();
                      const { location: locQ } = parseQuery(query);
                      const fallback = ensureIndia(locQ || 'Karnataka');
                      const displayLoc = !loc || /^india$/i.test(loc) ? fallback : loc;
                      return (
                        <div className="mt-1 flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{displayLoc}</span>
                        </div>
                      );
                    }
                  )()}
                  {job.snippet && (
                    <p className="mt-3 text-sm text-gray-700 line-clamp-3" dangerouslySetInnerHTML={{ __html: job.snippet }} />
                  )}
                  <div className="mt-4">
                    <a
                      href={job.link || '#'}
                      target={job.link ? '_blank' : undefined}
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                    >
                      Apply now <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button onClick={onViewMore} className="px-6 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800">
                View More
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default JoobleJobsSection;
