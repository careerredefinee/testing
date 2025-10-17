import React, { useState } from 'react';
import BASE_URL from '../../config';

const SalaryToolPage: React.FC = () => {
  const [role, setRole] = useState('Software Engineer');
  const [location, setLocation] = useState('Bengaluru');
  const [years, setYears] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');

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

  const submit = async () => {
    setError(''); setReply(''); setLoading(true);
    try {
      const resp = await fetch(`${BASE_URL}/api/v1/tools/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Estimate salary range for ${role} in ${location} with ${years} years experience. Include negotiation tips and script. Format as clean bullet points with no markdown.`, tool: 'salary', context: 'Salary Advisor' })
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
        <h1 className="text-2xl font-bold mb-2">Salary Negotiation Advisor</h1>
        <p className="text-gray-600 mb-4">Get market range estimates and scripts using Gemini.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Role</label>
              <input className="w-full border rounded-md px-3 py-2" value={role} onChange={(e)=> setRole(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Location</label>
              <input className="w-full border rounded-md px-3 py-2" value={location} onChange={(e)=> setLocation(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Years</label>
              <input type="number" min={0} className="w-full border rounded-md px-3 py-2" value={years} onChange={(e)=> setYears(parseInt(e.target.value||'0',10))} />
            </div>
            <button onClick={submit} disabled={loading} className={`px-4 py-2 rounded-md text-white ${loading?'bg-amber-300':'bg-amber-600 hover:bg-amber-700'}`}>{loading?'Estimating…':'Estimate & Script'}</button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="border rounded-md p-4 min-h-[320px] overflow-y-auto">
            {reply ? (
              <div className="space-y-2">
                {reply.split('\n').map((line, index) => {
                  if (line.trim() === '') return <div key={index} className="h-2"></div>;
                  if (line.includes('Salary') || line.includes('Range:')) {
                    return <div key={index} className="font-semibold text-green-600 mt-4">{line}</div>;
                  }
                  if (line.includes('Negotiation') || line.includes('Script:') || line.includes('Tips:')) {
                    return <div key={index} className="font-medium text-blue-700 mt-3">{line}</div>;
                  }
                  if (line.includes('Say:') || line.includes('Response:')) {
                    return <div key={index} className="font-medium text-purple-700 mt-2">{line}</div>;
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

export default SalaryToolPage;
