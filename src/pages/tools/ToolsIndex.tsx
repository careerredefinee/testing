import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, BarChart3, BadgeDollarSign, FileText, MessageCircle } from 'lucide-react';

type CardProps = {
  title: string;
  desc: string;
  href: string;
  cta: string;
  color: string; // button color classes
  Icon: React.ElementType; // lucide icon component
};

const Card: React.FC<CardProps> = ({ title, desc, href, cta, color, Icon }) => (
  <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 p-8 text-center">
    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 border border-gray-200 flex items-center justify-center mb-5">
      <Icon size={26} />
    </div>
    <h3 className="text-lg font-extrabold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 text-sm leading-relaxed">{desc}</p>
    <Link to={href} className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full text-white font-semibold ${color}`}>
      {cta}
    </Link>
  </div>
);

const ToolsIndex: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full mb-4 text-sm font-semibold">AI-Powered Career Tools</div>
          <h1 className="text-4xl font-extrabold text-gray-900">Smart AI Tools for Career Success</h1>
          <p className="text-gray-600 mt-3 max-w-3xl mx-auto">Harness the power of AI to accelerate your career growth.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Removed Career Path card as requested */}
          <Card Icon={MessageSquare} title="Dynamic Interview Simulator" desc="Walk into any interview with confidence. Practice with adaptive Q&A and instant feedback." href="/tools/interview" cta="Start Practicing" color="bg-emerald-600 hover:bg-emerald-700" />
          <Card Icon={BarChart3} title="Skill Gap Identifier" desc="Pinpoint missing skills and get a personalized plan to bridge them." href="/tools/skill-gap" cta="Assess Your Skills" color="bg-purple-600 hover:bg-purple-700" />
          <Card Icon={BadgeDollarSign} title="Salary Negotiation Advisor" desc="See market ranges and get a negotiation script you can use today." href="/tools/salary" cta="Maximize Your Offer" color="bg-amber-600 hover:bg-amber-700" />
          <Card Icon={FileText} title="Resume Analysis" desc="Analyze your resume and get actionable, ATS-friendly improvements." href="/tools/resume-analysis" cta="Analyse Your Resume" color="bg-rose-600 hover:bg-rose-700" />
          <Card Icon={MessageCircle} title="24/7 AI Career Mentor" desc="Get instant, confidential career advice whenever you need it." href="/tools/mentor" cta="Ask Your Mentor" color="bg-sky-600 hover:bg-sky-700" />
        </div>
      </div>
    </div>
  );
};

export default ToolsIndex;
