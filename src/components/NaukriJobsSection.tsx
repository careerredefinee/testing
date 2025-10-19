import React, { useEffect, useState } from 'react';
import { MapPin, Building, ExternalLink } from 'lucide-react';
import { naukriService, type NaukriJob } from '../services/naukriService';

type Props = { query?: string };

const NaukriJobsSection: React.FC<Props> = ({ query }) => {
  const [jobs, setJobs] = useState<NaukriJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [visible, setVisible] = useState(6);
  const PAGE_STEP = 2;

  const parseQuery = (q?: string): { keywords?: string; location?: string } => {
    const raw = (q || '').trim();
    if (!raw) return {};
    // Heuristics: try "role in place" pattern
    const inIdx = raw.toLowerCase().lastIndexOf(' in ');
    if (inIdx > 0) {
      const kw = raw.slice(0, inIdx).trim();
      const loc = raw.slice(inIdx + 4).trim();
      return { keywords: kw || undefined, location: loc || undefined };
    }
    // Try comma-separated
    const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return { keywords: parts[0], location: parts.slice(1).join(', ') };
    }
    // Fallback: treat the whole input as keywords only
    return { keywords: raw };
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Clear previous results so only new search results show
        setJobs([]);
        setVisible(6);
        const params: any = { page: 1, limit: 10 };
        const parsed = parseQuery(query);
        if (parsed.keywords) params.keywords = parsed.keywords;
        if (parsed.location) params.location = parsed.location;
        const data = await naukriService.getJobs(params);
        if (mounted) {
          setJobs(data);
          setPage(1);
          setVisible(6);
        }
      } catch (e: any) {
        console.error('Failed to load Naukri jobs (n8n)', e);
        if (mounted) setError('Failed to load Naukri jobs');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [query]);

  const onViewMore = async () => {
    try {
      if (visible + PAGE_STEP <= jobs.length) {
        setVisible(visible + PAGE_STEP);
        return;
      }
      const nextPage = page + 1;
      const params: any = { page: nextPage, limit: 10 };
      const parsed = parseQuery(query);
      if (parsed.keywords) params.keywords = parsed.keywords;
      if (parsed.location) params.location = parsed.location;
      const more = await naukriService.getJobs(params);
      if (more && more.length > 0) {
        setJobs(prev => [...prev, ...more]);
        setPage(nextPage);
        setVisible(visible + PAGE_STEP);
      } else {
        setVisible(Math.min(visible + PAGE_STEP, jobs.length));
      }
    } catch (e) {
      console.error('Failed to load more Naukri jobs (n8n)', e);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Naukri Jobs</h2>
          <p className="mt-3 text-gray-600">Popular jobs</p>
        </div>
        {loading && <div className="text-center text-gray-500">Loading jobs...</div>}
        {error && <div className="text-center text-red-600">{error}</div>}
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center text-gray-500">No jobs found at the moment.</div>
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
                {job.location && (
                  <div className="mt-1 flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.snippet && (
                  <p className="mt-3 text-sm text-gray-700 line-clamp-3">{job.snippet}</p>
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

export default NaukriJobsSection;
