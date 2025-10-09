import React, { useState } from 'react';
import api from '../../utils/api';

const OptionalPage: React.FC = () => {
  const [location, setLocation] = useState<'courses' | 'articles'>('courses');
  const [filename, setFilename] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData();
      form.append('location', location);
      if (filename.trim()) form.append('filename', filename.trim());
      if (content.trim()) form.append('content', content);
      if (file) form.append('file', file);

      const resp = await api.post('/api/v1/admin/static-html', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const path = (resp.data?.data?.path as string) || '';
      setSuccess(`Saved successfully: ${path}`);
      // Reset file but keep other fields so admin can tweak quickly
      setFile(null);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save HTML');
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Optional: Create/Upload HTML</h1>
        <p className="text-sm text-gray-600 mb-4">
          Create or upload a static HTML file to the public folder under <code>/public/courses</code> or <code>/public/articles</code>.
        </p>
        <form onSubmit={onSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as 'courses' | 'articles')}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="courses">courses</option>
                <option value="articles">articles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filename (with .html)</label>
              <input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="custom-page.html"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">If empty, server will auto-assign a filename.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paste HTML (supports very large content)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              placeholder="<!DOCTYPE html>\n<html>..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">If a file is uploaded, it takes precedence over the pasted HTML.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Or Upload HTML File</label>
            <input
              type="file"
              accept=".html,text/html"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && <div className="text-xs text-gray-600 mt-1">Selected: {file.name}</div>}
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {success && <div className="text-sm text-green-700">{success}</div>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save HTML'}
            </button>
            <button
              type="button"
              onClick={() => { setContent(''); setFile(null); setError(null); setSuccess(null); }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
  );
};

export default OptionalPage;
