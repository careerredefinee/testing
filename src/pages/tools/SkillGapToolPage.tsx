import React, { useState } from 'react';
import BASE_URL from '../../config';

const SkillGapToolPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState('Data Analyst');
  const [currentSkills, setCurrentSkills] = useState('Excel, SQL, Python basics');
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
        body: JSON.stringify({ message: `Target role: ${targetRole}. Current skills: ${currentSkills}. Identify skill gaps and create a clean 4-week learning plan. Format as simple bullet points with no markdown or complex formatting.`, tool: 'skill-gap', context: 'Skill Gap' })
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
        <h1 className="text-2xl font-bold mb-2">Skill Gap Identifier</h1>
        <p className="text-gray-600 mb-4">Find gaps vs target role and get a 4-week plan using Gemini.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Target Role</label>
              <input className="w-full border rounded-md px-3 py-2" value={targetRole} onChange={(e)=> setTargetRole(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Current Skills</label>
              <input className="w-full border rounded-md px-3 py-2" value={currentSkills} onChange={(e)=> setCurrentSkills(e.target.value)} />
            </div>
            <button onClick={submit} disabled={loading} className={`px-4 py-2 rounded-md text-white ${loading?'bg-purple-300':'bg-purple-600 hover:bg-purple-700'}`}>{loading?'Analyzing…':'Analyze Gaps'}</button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="border rounded-md p-4 min-h-[320px] overflow-y-auto">
            {reply ? (
              <div className="space-y-2">
                {reply.split('\n').map((line, index) => {
                  if (line.trim() === '') return <div key={index} className="h-2"></div>;
                  if (line.includes('Gap:') || line.includes('Missing:')) {
                    return <div key={index} className="font-semibold text-red-600 mt-4">{line}</div>;
                  }
                  if (line.includes('Week') || line.includes('Plan:')) {
                    return <div key={index} className="font-medium text-blue-700 mt-3">{line}</div>;
                  }
                  if (line.includes('Resources:') || line.includes('Action:')) {
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

export default SkillGapToolPage;
