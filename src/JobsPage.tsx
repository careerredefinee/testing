import React, { useState } from 'react';
import CallbackButton from './components/CallbackButton';
import JoobleJobsSection from './components/JoobleJobsSection';
import JobsSection from './components/JobsSection';
import NaukriJobsSection from './components/NaukriJobsSection';

const JobsPage: React.FC = () => {
  const [query, setQuery] = useState<string>('');

  return (
    <div>
      {/* Why Job Seekers section directly below navbar */}
      <JobsSection showAdminJobs={false} />

      {/* Naukri has no search, shown next */}
      <NaukriJobsSection />

      {/* Search bar only for Jooble */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Jooble Jobs</h1>
          <form
            onSubmit={(e) => { e.preventDefault(); /* query already bound to state */ }}
            className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., React Developer in Bengaluru or Karnataka"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-gray-900 text-white px-6 py-2 hover:bg-gray-800"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Jooble section filtered by the search above */}
      <JoobleJobsSection query={query} />
      <CallbackButton />
    </div>
  );
};

export default JobsPage;
