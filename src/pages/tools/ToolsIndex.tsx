import React from 'react';
import { Link } from 'react-router-dom';

const Card: React.FC<{title:string; desc:string; href:string; cta:string; color:string}> = ({title, desc, href, cta, color}) => (
  <div className="bg-white rounded-2xl shadow-sm border p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4 text-sm">{desc}</p>
    <Link to={href} className={`inline-flex items-center px-4 py-2 rounded-md text-white ${color}`}>{cta}</Link>
  </div>
);

const ToolsIndex: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full mb-4 text-sm font-semibold">AI-Powered Career Tools</div>
          <h1 className="text-4xl font-extrabold text-gray-900">Smart AI Tools for Career Success</h1>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto">Harness the power of AI to accelerate your career growth. These tools use Gemini free models via environment variables.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="AI-Powered Career Pathfinding" desc="Discover top role matches and a 30/60/90-day plan." href="/tools/career-path" cta="Discover Your Path" color="bg-blue-600 hover:bg-blue-700" />
          <Card title="Dynamic Interview Simulator" desc="Get adaptive questions and strong-answer cues." href="/tools/interview" cta="Start Practicing" color="bg-emerald-600 hover:bg-emerald-700" />
          <Card title="Skill Gap Identifier" desc="Find gaps vs target role with a 4-week plan." href="/tools/skill-gap" cta="Assess Your Skills" color="bg-purple-600 hover:bg-purple-700" />
          <Card title="Salary Negotiation Advisor" desc="Market range estimates and negotiation scripts." href="/tools/salary" cta="Maximize Your Offer" color="bg-amber-600 hover:bg-amber-700" />
          <Card title="Resume Analysis" desc="Upload or paste resume, get detailed analysis and suggestions." href="/tools/resume-analysis" cta="Analyse Your Resume" color="bg-rose-600 hover:bg-rose-700" />
          <Card title="24/7 AI Career Mentor" desc="Actionable, confidential guidance anytime." href="/tools/mentor" cta="Ask Your Mentor" color="bg-sky-600 hover:bg-sky-700" />
        </div>
      </div>
    </div>
  );
};

export default ToolsIndex;
