import React, { useState } from 'react';
import BASE_URL from '../../config';

const InterviewToolPage: React.FC = () => {
  const [role, setRole] = useState('Software Engineer');
  const [seniority, setSeniority] = useState('junior');
  const [domain, setDomain] = useState('web');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');

  const cleanupResponse = (text: string): string => {
    return text
      // Remove markdown headers (###, ##, #)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown bold (**text**)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove markdown italic (*text*)
      .replace(/\*(.*?)\*/g, '$1')
      // Remove markdown code blocks (```text```)
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code (`text`)
      .replace(/`([^`]+)`/g, '$1')
      // Remove horizontal rules (---)
      .replace(/^---+$/gm, '')
      // Clean up multiple spaces and newlines
      .replace(/\n{3,}/g, '\n\n')
      // Remove leading/trailing whitespace
      .trim();
  };

  const submit = async () => {
    setError(''); setReply(''); setLoading(true);
    try {
      const resp = await fetch(`${BASE_URL}/api/v1/tools/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Generate clean interview questions for a ${seniority} ${role} in ${domain}. Format as simple bullet points with clear answer cues. No markdown, no stars, no complex formatting.`, tool: 'interview', context: 'Interview Simulator' })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || 'Request failed');
      const rawReply = data?.data?.reply || '';
      setReply(cleanupResponse(rawReply));
    } catch (e:any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">Dynamic Interview Simulator</h1>
        <p className="text-gray-600 mb-4">Generate adaptive interview questions with strong-answer cues using Gemini.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Role</label>
              <input className="w-full border rounded-md px-3 py-2" value={role} onChange={(e)=> setRole(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Seniority</label>
              <select className="w-full border rounded-md px-3 py-2" value={seniority} onChange={(e)=> setSeniority(e.target.value)}>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Domain</label>
              <input className="w-full border rounded-md px-3 py-2" value={domain} onChange={(e)=> setDomain(e.target.value)} />
            </div>
            <button onClick={submit} disabled={loading} className={`px-4 py-2 rounded-md text-white ${loading?'bg-emerald-300':'bg-emerald-600 hover:bg-emerald-700'}`}>{loading?'Generating…':'Generate Questions'}</button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="border rounded-md p-4 min-h-[320px] overflow-y-auto">
            {reply ? (
              <div className="space-y-2">
                {reply.split('\n').map((line, index) => {
                  if (line.trim() === '') return <div key={index} className="h-2"></div>;
                  if (line.includes('Question:')) {
                    return <div key={index} className="font-semibold text-blue-700 mt-4">{line}</div>;
                  }
                  if (line.includes('Answer Cues:')) {
                    return <div key={index} className="font-medium text-green-700 mt-2">{line}</div>;
                  }
                  if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                    return <div key={index} className="ml-4 text-gray-700">{line}</div>;
                  }
                  return <div key={index} className="text-gray-800">{line}</div>;
                })}
              </div>
            ) : (
              <div className="text-gray-500 italic">Output will appear here.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewToolPage;
