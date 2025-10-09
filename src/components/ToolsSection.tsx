import React, { useState } from 'react';
import { Search, MessageCircle, FileText, TrendingUp, BadgeCheck, Bot, Sparkles, X, Target, BadgeDollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CareerTool from './ai-tools/CareerTool';
import InterviewTool from './ai-tools/InterviewTool';
import SkillGapTool from './ai-tools/SkillGapTool';
import SalaryTool from './ai-tools/SalaryTool';
import ResumeTool from './ai-tools/ResumeTool';
import MentorTool from './ai-tools/MentorTool';

const tools = [
  {
    id: 'career-path',
    icon: <Search className="w-8 h-8" />,
    title: 'AI-Powered Career Pathfinding',
    description: 'Uncover your true potential. Our AI analyzes your skills and passions to reveal career paths you’re destined to excel in.',
    gradient: 'from-indigo-500 to-violet-500',
    cta: 'Discover Your Path',
  },
  {
    id: 'interview',
    icon: <MessageCircle className="w-8 h-8" />,
    title: 'Dynamic Interview Simulator',
    description: 'Walk into any interview with unshakable confidence. Practice with an AI that adapts to your target role and provides instant feedback.',
    gradient: 'from-emerald-500 to-teal-500',
    cta: 'Start Practicing',
  },
  {
    id: 'skill-gap',
    icon: <BadgeCheck className="w-8 h-8" />,
    title: 'Skill Gap Identifier',
    description: 'Stay ahead of the curve. Pinpoint the exact skills you need for your dream job and get a personalized roadmap to acquire them.',
    gradient: 'from-purple-500 to-fuchsia-500',
    cta: 'Assess Your Skills',
  },
  {
    id: 'salary',
    icon: <BadgeDollarSign className="w-8 h-8" />,
    title: 'Salary Negotiation Advisor',
    description: 'Know your worth and get paid for it. Our AI provides data-driven insights to help you negotiate the salary you deserve.',
    gradient: 'from-amber-500 to-orange-500',
    cta: 'Maximize Your Offer',
  },
  {
    id: 'resume',
    icon: <FileText className="w-8 h-8" />,
    title: 'Resume Analysis',
    description: 'analysis of resumes with detailed report,including scoring ,suggestions,error findinds and others.',
    gradient: 'from-rose-500 to-pink-500',
    cta: 'Analyse Your Resume',
  },
  {
    id: 'mentor',
    icon: <Bot className="w-8 h-8" />,
    title: '24/7 AI Career Mentor',
    description: 'Never get stuck again. Get instant, confidential advice on any career challenge, anytime, from your personal AI mentor.',
    gradient: 'from-sky-500 to-blue-500',
    cta: 'Ask Your Mentor',
  },
];

const ToolsSection = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const renderTool = () => {
    if (!activeTool) return null;
    const close = () => setActiveTool(null);
    const map: Record<string, React.ReactNode> = {
      'career-path': <CareerTool onClose={close} />,
      interview: <InterviewTool onClose={close} />,
      'skill-gap': <SkillGapTool onClose={close} />,
      salary: <SalaryTool onClose={close} />,
      resume: <ResumeTool onClose={close} />,
      mentor: <MentorTool onClose={close} />,
    };
    const node = map[activeTool];
    if (!node) return null;
    return (
      <div className="max-w-5xl mx-auto mt-10">
        <div className="bg-white rounded-xl shadow-lg p-6 border">
          {node}
        </div>
      </div>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-blue-100 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-down">
          <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full mb-6">
            <Bot className="w-8 h-8 mr-3" />
            <span className="text-xl font-bold">AI-Powered Career Tools</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
            Smart AI Tools for Career Success
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Harness the power of artificial intelligence to accelerate your career growth. Our advanced AI tools provide personalized insights, recommendations, and strategies tailored to your unique career journey.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
              AI-Powered Analysis
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <Bot className="w-4 h-4 mr-2 text-purple-600" />
              Instant Results
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
              <Target className="w-4 h-4 mr-2 text-green-600" />
              Personalized Recommendations
            </div>
          </div>
        </div>
        
        {!activeTool && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, idx) => (
              <div
                key={tool.id}
                className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 animate-fade-in-up"
                style={{ animationDelay: `${idx * 120}ms` }}
              >
                <div className="p-8 text-center">
                  <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${tool.gradient} p-[2px] shadow mb-5`}>
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-slate-800">
                      {tool.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-gray-600 mb-7 text-sm leading-relaxed min-h-16">{tool.description}</p>
                  <button
                    onClick={() => setActiveTool(tool.id)}
                    className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full text-white font-semibold bg-gradient-to-r ${tool.gradient} shadow-sm hover:shadow-md transition-shadow`}
                  >
                    {tool.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTool && (
          <div className="animate-fade-in">
            {renderTool()}
            <div className="max-w-5xl mx-auto mt-4 flex justify-end">
              <button onClick={() => setActiveTool(null)} className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50 inline-flex items-center">
                <X size={18} className="mr-2"/> Close
              </button>
            </div>
          </div>
        )}

        {!activeTool && (
        <div className="text-center mt-20 animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Redefine Your Career?</h2>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            Join thousands of professionals who are building their dream careers with our AI-powered tools.
          </p>
          <button
            onClick={() => {
              if (user?.isPremium) {
                navigate('/premium-tools');
              } else {
                setShowSubscribe(true);
              }
            }}
            className="inline-flex items-center justify-center px-8 py-4 rounded-full text-white font-semibold bg-gradient-to-r from-purple-600 to-blue-500 shadow-sm hover:shadow-md"
          >
            Unlock All Tools Now
          </button>
        </div>
        )}

        {/* Subscribe Modal */}
        {showSubscribe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative text-center">
              <button
                onClick={() => setShowSubscribe(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X />
              </button>
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white mb-4">
                <Sparkles />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Subscribe to Premium</h3>
              <p className="text-gray-600 mt-2">Get unlimited access to all AI tools and premium features.</p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => navigate('/premium')}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold"
                >
                  Go to Premium
                </button>
                <button
                  onClick={() => setShowSubscribe(false)}
                  className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ToolsSection;
