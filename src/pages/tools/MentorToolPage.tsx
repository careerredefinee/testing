import React, { useState } from 'react';
import BASE_URL from '../../config';

const MentorToolPage: React.FC = () => {
  const [question, setQuestion] = useState('I have a 1-year gap after graduation. How should I position it?');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');

  const submit = async () => {
    setError(''); setReply(''); setLoading(true);
    try {
      const resp = await fetch(`${BASE_URL}/api/v2/tools/mentor`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || 'Request failed');
      setReply(data?.data?.reply || '');
    } catch (e:any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">24/7 AI Career Mentor</h1>
        <p className="text-gray-600 mb-4">Ask anything and get actionable guidance powered by Gemini.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Your Question</label>
              <textarea className="w-full border rounded-md px-3 py-2 h-40" value={question} onChange={(e)=> setQuestion(e.target.value)} />
            </div>
            <button onClick={submit} disabled={loading} className={`px-4 py-2 rounded-md text-white ${loading?'bg-sky-300':'bg-sky-600 hover:bg-sky-700'}`}>{loading?'Thinking…':'Ask Mentor'}</button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="border rounded-md p-4 min-h-[320px] whitespace-pre-wrap">{reply || 'Output will appear here.'}</div>
        </div>
      </div>
    </div>
  );
};

export default MentorToolPage;
