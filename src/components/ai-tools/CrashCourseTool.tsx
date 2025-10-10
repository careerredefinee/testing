import React, { useState } from 'react';
import BASE_URL from '../../config';

interface Props { onClose?: () => void }

const CrashCourseTool: React.FC<Props> = ({ onClose }) => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [duration, setDuration] = useState('7 days');
  const [goals, setGoals] = useState('Get hands-on skills and a portfolio mini-project');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string>('');
  const [error, setError] = useState<string>('');

  const generatePlan = async () => {
    setError('');
    setPlan('');
    if (!topic.trim()) {
      setError('Please enter a topic for the crash course.');
      return;
    }
    setLoading(true);
    try {
      const prompt = [
        `Act as an expert instructor.`,
        `Create a concise, step-by-step CRASH COURSE for: ${topic}.`,
        `Audience level: ${level}. Total duration: ${duration}.`,
        `Primary learning goals: ${goals}.`,
        `Provide:`,
        `1) Overview (2-3 lines).`,
        `2) Prerequisites (bullet list).`,
        `3) Day-by-day plan (each day with topics, hands-on tasks, time split).`,
        `4) Mini-project outline with milestones.`,
        `5) Resources (docs, videos, repos) with brief why.`,
        `6) Assessment checklist and what to build next.`,
        `Be specific and practical. Keep it focused for a crash course.`
      ].join('\n');

      const resp = await fetch(`${BASE_URL}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, tool: 'crash-course', context: 'Return structured steps and bullets.' })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || 'Failed to generate.');
      const reply = data?.data?.reply || 'No content generated.';
      setPlan(reply);
    } catch (e:any) {
      setError(e.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              placeholder="e.g., React + TypeScript, Data Analysis with Python, GenAI Basics"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select className="w-full border rounded-md px-3 py-2" value={level} onChange={(e)=> setLevel(e.target.value as any)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input className="w-full border rounded-md px-3 py-2" value={duration} onChange={(e)=> setDuration(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Goals</label>
            <input className="w-full border rounded-md px-3 py-2" value={goals} onChange={(e)=> setGoals(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={generatePlan} disabled={loading} className={`px-4 py-2 rounded-md text-white ${loading? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? 'Generating…' : 'Generate Crash Course'}
            </button>
            {onClose && (
              <button onClick={onClose} className="px-4 py-2 rounded-md border">Close</button>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <div className="bg-white border rounded-md p-4 overflow-auto max-h-[520px] whitespace-pre-wrap">
          {!plan ? (
            <div className="text-gray-500">The generated crash course outline will appear here.</div>
          ) : (
            <>{plan}</>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrashCourseTool;
