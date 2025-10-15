import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { resumeService } from '../../services/resumeService';

interface Props { onClose: () => void }

const ResumeTool: React.FC<Props> = ({ onClose }) => {
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [result, setResult] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult('');
    try {
      if (file) {
        // File upload + backend analysis flow
        const res = await resumeService.analyze(file);
        setResult(res?.data?.analysis || '');
      } else {
        // Text-only analysis fallback (no cover letter)
        const message = `You are an ATS and career coach. Analyze the following candidate profile for resume improvements.
Target role: ${role || 'N/A'}\nExperience summary: ${experience || 'N/A'}\nSkills: ${skills || 'N/A'}
Return: \n- Summary assessment \n- Strengths \n- Gaps with suggested bullet improvements \n- Keyword optimization tips \n- 5 tailored STAR-style bullet points.`;
        const r = await aiService.chat({ message, tool: 'resume_analysis', context: 'Resume analysis only (no cover letter).' });
        setResult(r?.data?.reply || '');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate resume/cover letter.');
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Resume Analyzer</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close"><X size={22}/></button>
      </div>
      <form onSubmit={submit} className="space-y-4 bg-white p-4 rounded-lg border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Resume (PDF/DOCX/TXT)</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={(e)=> setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <span className="text-xs text-gray-600">{file.name}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">Or leave empty and use the text fields below.</p>
        </div>
        <input value={role} onChange={e=>setRole(e.target.value)} placeholder="Target role" className="border rounded-md px-3 py-2 w-full" />
        <textarea value={experience} onChange={e=>setExperience(e.target.value)} placeholder="Experience summary" rows={3} className="border rounded-md px-3 py-2 w-full"/>
        <input value={skills} onChange={e=>setSkills(e.target.value)} placeholder="Key skills (comma separated)" className="border rounded-md px-3 py-2 w-full" />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-blue-600 text-white inline-flex items-center">{loading && <Loader2 className="animate-spin mr-2" size={18}/>} Analyze</button>
        </div>
      </form>
      <div className="mt-4 bg-gray-50 border rounded-lg p-4 min-h-[240px] max-h-[420px] overflow-auto">
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {!error && !result && !loading && <p className="text-gray-500">Enter details and click Build.</p>}
        {result && (
          <article className="prose max-w-none">
            {(() => {
              const formatted = result
                // Convert markdown headings (e.g., # Title, ## Title) to bullet points
                .replace(/^\s*#+\s+/gm, '• ')
                // Convert markdown list markers * or - to bullet points
                .replace(/^(\s*)([*-])\s+/gm, '$1• ')
                // Strip markdown bold/italic while keeping text
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                // Normalize multiple consecutive bullets (edge cases)
                .replace(/^\s*•\s*•\s*/gm, '• ')
                // Convert newlines to <br/>
                .replace(/\n/g, '<br/>' );
              return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
            })()}
          </article>
        )}
      </div>
    </div>
  );
};

export default ResumeTool;
