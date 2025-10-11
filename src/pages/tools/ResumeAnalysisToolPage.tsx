import React, { useState } from 'react';
import BASE_URL from '../../config';

const ResumeAnalysisToolPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState('');

  const submitFile = async () => {
    if (!file) return;
    setError(''); setAnalysis(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const resp = await fetch(`${BASE_URL}/api/v1/resume/analyze`, {
        method: 'POST',
        body: fd,
        credentials: 'include'
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || 'Upload failed');
      setAnalysis(data?.data?.analysis || '');
    } catch (e:any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
  };

  const submitText = async () => {
    if (!text.trim()) return;
    setError(''); setAnalysis(''); setLoading(true);
    try {
      const resp = await fetch(`${BASE_URL}/api/v1/resume/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        credentials: 'include'
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || 'Request failed');
      setAnalysis(data?.data?.analysis || '');
    } catch (e:any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">Resume Analysis</h1>
        <p className="text-gray-600 mb-4">Upload a resume file or paste the content. We analyze with Gemini (free model) and save the extracted text for admin review.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Upload File (PDF/DOC/DOCX/TXT)</label>
              <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e)=> setFile(e.target.files?.[0] || null)} />
              <button onClick={submitFile} disabled={loading || !file} className={`ml-3 px-4 py-2 rounded-md text-white ${loading? 'bg-rose-300':'bg-rose-600 hover:bg-rose-700'}`}>Analyze File</button>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Or Paste Text</label>
              <textarea className="w-full border rounded-md px-3 py-2 h-40" value={text} onChange={(e)=> setText(e.target.value)} />
              <button onClick={submitText} disabled={loading || !text.trim()} className={`mt-2 px-4 py-2 rounded-md text-white ${loading? 'bg-rose-300':'bg-rose-600 hover:bg-rose-700'}`}>Analyze Text</button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          {/* Output */}
          <div className="border rounded-md p-4 min-h-[360px] whitespace-pre-wrap">{analysis || 'Analysis output will appear here.'}</div>
        </div>
        <p className="text-xs text-gray-500 mt-3">Note: You need to be logged in. The extracted resume text is saved for admin review; admin can view/delete in Admin → Resumes.</p>
      </div>
    </div>
  );
};

export default ResumeAnalysisToolPage;
