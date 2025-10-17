import React, { useState } from 'react';
import BASE_URL from '../../config';

const ResumeAnalysisToolPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState('');

  const cleanupResponse = (text: string): string => {
    return text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^---+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

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
      const rawAnalysis = data?.data?.analysis || '';
      setAnalysis(cleanupResponse(rawAnalysis));
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
      const rawAnalysis = data?.data?.analysis || '';
      setAnalysis(cleanupResponse(rawAnalysis));
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
          <div className="border rounded-md p-4 min-h-[360px] overflow-y-auto">
            {analysis ? (
              <div className="space-y-2">
                {analysis.split('\n').map((line, index) => {
                  if (line.trim() === '') return <div key={index} className="h-2"></div>;
                  if (line.includes('Score:') || line.includes('Rating:')) {
                    return <div key={index} className="font-semibold text-blue-600 mt-4">{line}</div>;
                  }
                  if (line.includes('Strengths:') || line.includes('Good:')) {
                    return <div key={index} className="font-medium text-green-700 mt-3">{line}</div>;
                  }
                  if (line.includes('Improvements:') || line.includes('Issues:') || line.includes('Missing:')) {
                    return <div key={index} className="font-medium text-red-600 mt-3">{line}</div>;
                  }
                  if (line.includes('Recommendations:') || line.includes('Suggestions:')) {
                    return <div key={index} className="font-medium text-purple-700 mt-2">{line}</div>;
                  }
                  if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                    return <div key={index} className="ml-4 text-gray-700">{line}</div>;
                  }
                  return <div key={index} className="text-gray-800">{line}</div>;
                })}
              </div>
            ) : (
              <div className="text-gray-500 italic">Analysis output will appear here.</div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">Note: You need to be logged in. The extracted resume text is saved for admin review; admin can view/delete in Admin → Resumes.</p>
      </div>
    </div>
  );
};

export default ResumeAnalysisToolPage;
