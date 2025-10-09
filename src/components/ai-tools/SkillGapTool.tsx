import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { aiService } from '../../services/aiService';

interface Props { onClose: () => void }

const SkillGapTool: React.FC<Props> = ({ onClose }) => {
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult('');
    try {
      const message = `Act as a skill-gap analyzer for the role: ${targetRole || 'N/A'}.
Given the user's current skills: ${currentSkills || 'N/A'}
Return: \n- Missing critical skills \n- Priority order \n- 8-week learning roadmap (weekly) \n- Minimal projects to prove skills \n- Resources (free first).`;
      const r = await aiService.chat({ message, tool: 'skill-gap', context: 'Return concise bullets with week-by-week plan.' });
      setResult(r?.data?.reply || '');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to analyze skill gaps.');
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Skill Gap Identifier</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X size={22}/></button>
      </div>
      <form onSubmit={submit} className="space-y-3 bg-white p-4 rounded-lg border">
        <input value={targetRole} onChange={e=>setTargetRole(e.target.value)} placeholder="Target role" className="border rounded-md px-3 py-2 w-full" />
        <textarea value={currentSkills} onChange={e=>setCurrentSkills(e.target.value)} placeholder="Your current skills (comma separated)" rows={3} className="border rounded-md px-3 py-2 w-full"/>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-blue-600 text-white inline-flex items-center">{loading && <Loader2 className="animate-spin mr-2" size={18}/>} Analyze</button>
        </div>
      </form>
      <div className="mt-4 bg-gray-50 border rounded-lg p-4 min-h-[200px]">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {!error && !result && !loading && <p className="text-gray-500">Enter your details and click Analyze.</p>}
        {result && (
          <article className="prose max-w-none">
            {(() => {
              const formatted = result
                .replace(/^(\s*)([*-])\s+/gm, '$1• ')
                .replace(/\*/g, '')
                .replace(/\n/g, '<br/>');
              return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
            })()}
          </article>
        )}
      </div>
    </div>
  );
};

export default SkillGapTool;
