import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { aiService } from '../../services/aiService';

interface CareerToolProps {
  onClose: () => void;
}

const CareerTool: React.FC<CareerToolProps> = ({ onClose }) => {
  const [form, setForm] = useState({
    name: '',
    skills: '',
    interests: '',
    education: '',
    experience: '',
    location: '',
    targetRole: '',
    industries: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const message = `You are an expert career advisor. Using the details below, generate a succinct, motivating and actionable career discovery plan.

Return clear sections with markdown headings: "Profile Snapshot", "Top 3 Career Paths (with why)", "Skills Gap & Roadmap (12 weeks)", "Projects to Build Portfolio", "Interview Prep Focus", "Learning Resources", and "Next 7-Day Action Plan". Use bullet points and make it practical for the user.

DETAILS:
Name: ${form.name || 'N/A'}
Current/Target Role: ${form.targetRole || 'N/A'}
Skills: ${form.skills || 'N/A'}
Interests: ${form.interests || 'N/A'}
Education: ${form.education || 'N/A'}
Experience: ${form.experience || 'N/A'}
Preferred Industries: ${form.industries || 'N/A'}
Location: ${form.location || 'N/A'}
`;

      const response = await aiService.chat({
        message,
        tool: 'career-path',
        context: 'Generate a structured career discovery and planning guide based on the provided inputs. Keep it concise and actionable.'
      });

      const text = response?.data?.reply || response?.reply || '';
      setResult(text);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to generate career path.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Career Discovery</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
          <X size={22} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg border">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your name (optional)"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring w-full"
        />
        <input
          name="targetRole"
          value={form.targetRole}
          onChange={handleChange}
          placeholder="Target role (e.g., Frontend Developer)"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring w-full"
        />
        <input
          name="skills"
          value={form.skills}
          onChange={handleChange}
          placeholder="Key skills (comma separated)"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring w-full"
        />
        <input
          name="interests"
          value={form.interests}
          onChange={handleChange}
          placeholder="Interests (comma separated)"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring w-full"
        />
        <input
          name="education"
          value={form.education}
          onChange={handleChange}
          placeholder="Education (e.g., BSc CS, Coursera certs)"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring w-full"
        />
        <input
          name="experience"
          value={form.experience}
          onChange={handleChange}
          placeholder="Experience (e.g., 1 year internships)"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring w-full"
        />
        <input
          name="industries"
          value={form.industries}
          onChange={handleChange}
          placeholder="Preferred industries (comma separated)"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring w-full"
        />
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location / Remote preference"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring w-full"
        />

        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 inline-flex items-center"
          >
            {loading && <Loader2 className="animate-spin mr-2" size={18} />} Generate Plan
          </button>
        </div>
      </form>

      <div className="mt-6 bg-gray-50 border rounded-lg p-4 min-h-[200px]">
        {error && (
          <div className="text-red-600 mb-2">{error}</div>
        )}
        {!error && !result && !loading && (
          <p className="text-gray-500">Fill out the details above and click Generate to see your personalized career path.</p>
        )}
        {result && (
          <article className="prose max-w-none">
            {/* eslint-disable-next-line react/no-danger */}
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

export default CareerTool;
