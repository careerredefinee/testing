import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { aiService } from '../../services/aiService';

interface Props { onClose: () => void }

const SalaryTool: React.FC<Props> = ({ onClose }) => {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult('');
    try {
      const message = `Act as a salary negotiation advisor for ${role || 'N/A'} in ${location || 'N/A'} with ${experience || 'N/A'} experience.
Return: \n- Market range (low/median/high) \n- Levers to increase offer \n- Negotiation script variants \n- Counter-offer strategy \n- Benefits checklist.`;
      const r = await aiService.chat({ message, tool: 'salary', context: 'Provide actionable bullets and short scripts.' });
      setResult(r?.data?.reply || '');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate advice.');
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Salary Negotiation Advisor</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X size={22}/></button>
      </div>
      <form onSubmit={submit} className="space-y-3 bg-white p-4 rounded-lg border">
        <input value={role} onChange={e=>setRole(e.target.value)} placeholder="Role" className="border rounded-md px-3 py-2 w-full" />
        <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Location" className="border rounded-md px-3 py-2 w-full" />
        <input value={experience} onChange={e=>setExperience(e.target.value)} placeholder="Experience (e.g., 3 years)" className="border rounded-md px-3 py-2 w-full" />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-blue-600 text-white inline-flex items-center">{loading && <Loader2 className="animate-spin mr-2" size={18}/>} Get Advice</button>
        </div>
      </form>
      <div className="mt-4 bg-gray-50 border rounded-lg p-4 min-h-[200px]">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {!error && !result && !loading && <p className="text-gray-500">Fill details and click Get Advice.</p>}
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

export default SalaryTool;
