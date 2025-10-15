import React, { useState, ChangeEvent, FormEvent } from 'react';

const MAX_LINES = 3000; // UI guidance; server will accept full content

const OptionalPage: React.FC = () => {
  const [mode, setMode] = useState<'paste' | 'upload'>('paste');
  const [filename, setFilename] = useState('');
  const [location, setLocation] = useState<'courses' | 'articles'>('courses');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      try {
        const text = await f.text();
        setContent(text);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to read file' });
      }
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!filename.trim()) {
      setMessage({ type: 'error', text: 'Please provide a filename (e.g., course.html)' });
      return;
    }
    if (!/\.html?$/i.test(filename)) {
      setMessage({ type: 'error', text: 'Filename must end with .html' });
      return;
    }
    if (!content || content.trim().length === 0) {
      setMessage({ type: 'error', text: 'Please provide HTML content (paste or upload a file)' });
      return;
    }

    try {
      setSubmitting(true);
      const resp = await fetch('/api/v1/admin/html-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ filename: filename.trim(), location, content })
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        throw new Error(data?.message || `Request failed (${resp.status})`);
      }
      setMessage({ type: 'success', text: data?.message || 'Page created successfully' });
      setFile(null);
      setContent('');
      setFilename('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to create page' });
    } finally {
      setSubmitting(false);
    }
  };

  const lineCount = content ? content.split(/\r?\n/).length : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Optional: Create Static HTML Page</h1>

      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name of file</label>
          <input
            type="text"
            placeholder="e.g., course.html"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Include .html extension. Avoid slashes or special characters.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value as 'courses' | 'articles')}
            className="w-full border rounded px-3 py-2"
          >
            <option value="courses">Course</option>
            <option value="articles">Articles</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Input method</label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="paste"
                checked={mode === 'paste'}
                onChange={() => setMode('paste')}
              />
              <span>Paste HTML</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="mode"
                value="upload"
                checked={mode === 'upload'}
                onChange={() => setMode('upload')}
              />
              <span>Upload .html file</span>
            </label>
          </div>
        </div>

        {mode === 'upload' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload HTML file</label>
            <input type="file" accept=".html,text/html,.htm,text/plain" onChange={handleFileChange} />
            {file && (
              <p className="text-xs text-gray-500 mt-1">Loaded: {file.name}</p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paste HTML content</label>
            <textarea
              rows={20}
              className="w-full border rounded px-3 py-2 font-mono text-sm"
              placeholder={`Paste up to ~${MAX_LINES} lines of HTML here...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Lines: {lineCount}</span>
              <span>This box is optimized for large pastes.</span>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded text-white ${submitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {submitting ? 'Creating...' : 'Create Page'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OptionalPage;
