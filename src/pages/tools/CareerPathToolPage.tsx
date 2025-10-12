import React, { useState } from 'react';
import BASE_URL from '../../config';

const CareerPathToolPage: React.FC = () => {
  const [skills, setSkills] = useState('React, Node.js, SQL');
  const [interests, setInterests] = useState('building products, data, startups');
  const [experience, setExperience] = useState('fresher');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');

  const submit = async () => {
    setError(''); setReply(''); setLoading(true);
    try {
      const resp = await fetch(`${BASE_URL}/api/v1/tools/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, interests, experience })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || 'Request failed');
      setReply(data?.data?.reply || '');
    } catch (e:any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto bg-white border rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">AI-Powered Career Pathfinding</h1>
        <p className="text-gray-600 mb-4">Discover top role matches and a 30/60/90-day plan using Gemini (free model).</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Skills</label>
              <input className="w-full border rounded-md px-3 py-2" value={skills} onChange={(e)=> setSkills(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Interests</label>
              <input className="w-full border rounded-md px-3 py-2" value={interests} onChange={(e)=> setInterests(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Experience</label>
              <select className="w-full border rounded-md px-3 py-2" value={experience} onChange={(e)=> setExperience(e.target.value)}>
                <option value="fresher">Fresher</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
              </select>
            </div>
            <button onClick={submit} disabled={loading} className={`px-4 py-2 rounded-md text-white ${loading?'bg-blue-300':'bg-blue-600 hover:bg-blue-700'}`}>{loading?'Generating…':'Generate Plan'}</button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <div className="border rounded-md p-4 min-h-[320px] whitespace-pre-wrap">{reply || 'Output will appear here.'}</div>
        </div>
      </div>
    </div>
  );
};

export default CareerPathToolPage;
