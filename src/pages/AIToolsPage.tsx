import React, { useState } from 'react';
import { Search, MessageSquare, BarChart3, FileText, MessageCircle, X, Code as CodeIcon, Image as ImageIcon, Music as MusicIcon, Video as VideoIcon, BadgeDollarSign } from 'lucide-react';
import CodeTool from '../components/ai-tools/CodeTool';
import CareerTool from '../components/ai-tools/CareerTool';
import InterviewTool from '../components/ai-tools/InterviewTool';
import SkillGapTool from '../components/ai-tools/SkillGapTool';
import SalaryTool from '../components/ai-tools/SalaryTool';
import ResumeTool from '../components/ai-tools/ResumeTool';
import MentorTool from '../components/ai-tools/MentorTool';
import ImageTool from '../components/ai-tools/ImageTool';
import DocumentTool from '../components/ai-tools/DocumentTool';
import MusicTool from '../components/ai-tools/MusicTool';
import VideoTool from '../components/ai-tools/VideoTool';

interface ToolCardProps {
  title: string;
  description: string;
  buttonText: string;
  icon: React.ReactNode;
  gradient: string; // tailwind gradient like 'from-indigo-500 to-violet-500'
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  buttonText,
  icon,
  gradient,
  onClick,
}) => (
  <div className={`bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100`}> 
    <div className="p-8 text-center">
      <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${gradient} p-[2px] shadow-md mb-5`}> 
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-700 to-slate-900">
            {icon}
          </span>
        </div>
      </div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-7 text-sm leading-relaxed">{description}</p>
      <button
        onClick={onClick}
        className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full text-white font-semibold bg-gradient-to-r ${gradient} shadow-sm hover:shadow-md transition-shadow`}
      >
        {buttonText}
      </button>
    </div>
  </div>
);

const AIToolsPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'career-path',
      title: 'AI-Powered Career Pathfinding',
      description: 'Uncover your true potential. Our AI analyzes your skills and passions to reveal high-fit career paths.',
      buttonText: 'Discover Your Path',
      icon: <Search size={28} />,
      gradient: 'from-indigo-500 to-violet-500'
    },
    {
      id: 'interview',
      title: 'Dynamic Interview Simulator',
      description: 'Practice role-specific interviews with adaptive questions and instant feedback.',
      buttonText: 'Start Practicing',
      icon: <MessageSquare size={28} />,
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'skill-gap',
      title: 'Skill Gap Identifier',
      description: 'Pinpoint missing skills for your target role and get a personalized upskilling roadmap.',
      buttonText: 'Assess Your Skills',
      icon: <BarChart3 size={28} />,
      gradient: 'from-purple-500 to-fuchsia-500'
    },
    {
      id: 'salary',
      title: 'Salary Negotiation Advisor',
      description: 'Get data-driven insights and scripts to negotiate a better offer.',
      buttonText: 'Maximize Your Offer',
      icon: <BadgeDollarSign size={28} />,
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      id: 'resume',
      title: 'Resume & Cover Letter Builder',
      description: 'Generate ATS-friendly resumes and compelling cover letters in minutes.',
      buttonText: 'Build Your Resume',
      icon: <FileText size={28} />,
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      id: 'mentor',
      title: '24/7 AI Career Mentor',
      description: 'Instant, confidential advice on any career challenge — anytime.',
      buttonText: 'Ask Your Mentor',
      icon: <MessageCircle size={28} />,
      gradient: 'from-sky-500 to-blue-500'
    },
    // Core AI utilities
    {
      id: 'code',
      title: 'Code Generator',
      description: 'Generate code snippets in multiple languages from natural language prompts.',
      buttonText: 'Open Code Tool',
      icon: <CodeIcon size={26} />,
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'image',
      title: 'Image Generator',
      description: 'Create stunning AI images from detailed prompts in various styles.',
      buttonText: 'Open Image Tool',
      icon: <ImageIcon size={26} />,
      gradient: 'from-fuchsia-500 to-purple-600'
    },
    {
      id: 'document',
      title: 'Document Assistant',
      description: 'Summarize, extract key points, and analyze documents or pasted text.',
      buttonText: 'Open Document Tool',
      icon: <FileText size={26} />,
      gradient: 'from-amber-500 to-yellow-600'
    },
    {
      id: 'music',
      title: 'Music Generator',
      description: 'Generate short music clips based on mood and style prompts.',
      buttonText: 'Open Music Tool',
      icon: <MusicIcon size={26} />,
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      id: 'video',
      title: 'Video Generator',
      description: 'Prototype video concepts from prompts and style guides.',
      buttonText: 'Open Video Tool',
      icon: <VideoIcon size={26} />,
      gradient: 'from-teal-500 to-cyan-600'
    },
  ];

  const renderToolContent = () => {
    const tool = tools.find(t => t.id === activeTool);
    if (!tool) return null;

    const close = () => setActiveTool(null);

    // Render real tools for known utility IDs
    const realToolMap: Record<string, React.ReactNode> = {
      'career-path': <CareerTool onClose={close} />,
      interview: <InterviewTool onClose={close} />,
      'skill-gap': <SkillGapTool onClose={close} />,
      salary: <SalaryTool onClose={close} />,
      resume: <ResumeTool onClose={close} />,
      mentor: <MentorTool onClose={close} />,
      code: <CodeTool onClose={close} />,
      image: <ImageTool onClose={close} />,
      document: <DocumentTool onClose={close} />,
      music: <MusicTool onClose={close} />,
      video: <VideoTool onClose={close} />,
    };

    const realTool = realToolMap[tool.id];

    return (
      <div className="bg-white rounded-xl shadow-lg max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tool.title}</h2>
            <p className="text-gray-600 mt-2">{tool.description}</p>
          </div>
          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close tool"
          >
            <X size={24} />
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-0 min-h-[400px]">
          {realTool ? (
            <div className="h-full">
              {realTool}
            </div>
          ) : (
            <div className="p-6 min-h-[400px] flex items-center justify-center">
              <p className="text-lg text-gray-500 text-center">
                {tool.title} feature will be available here. This is a preview of how the tool will look when implemented.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Career Tools</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empower your career journey with our suite of AI-powered tools designed to help you succeed.
          </p>
        </div>

        {activeTool ? (
          renderToolContent()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                title={tool.title}
                description={tool.description}
                buttonText={tool.buttonText}
                icon={tool.icon}
                gradient={tool.gradient}
                onClick={() => setActiveTool(tool.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIToolsPage;
