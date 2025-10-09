import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { aiService } from '../../services/aiService';

interface Props { onClose: () => void }

const MentorTool: React.FC<Props> = ({ onClose }) => {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult('');
    try {
      const message = `Act as a 24/7 AI career mentor. Provide clear, empathetic, and practical advice.\nQuestion: ${question || 'N/A'}`;
      const r = await aiService.chat({ message, tool: 'mentor', context: 'Return short actionable guidance and next steps.' });
      setResult(r?.data?.reply || '');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to get mentor advice.');
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">24/7 AI Career Mentor</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X size={22}/></button>
      </div>
      <form onSubmit={submit} className="space-y-3 bg-white p-4 rounded-lg border">
        <textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask anything about your career..." rows={4} className="border rounded-md px-3 py-2 w-full"/>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-blue-600 text-white inline-flex items-center">{loading && <Loader2 className="animate-spin mr-2" size={18}/>} Ask</button>
        </div>
      </form>
      <div className="mt-4 bg-gray-50 border rounded-lg p-4 min-h-[200px]">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {!error && !result && !loading && <p className="text-gray-500">Type a question and click Ask.</p>}
        {result && (
          <article className="prose max-w-none">
            {(() => {
              const formatted = result
                .replace(/^(\s*)([*-])\s+/gm, '$1• ')
                .replace(/\n/g, '<br/>');
              return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
            })()}
          </article>
        )}
      </div>
    </div>
  );
};

export default MentorTool;
