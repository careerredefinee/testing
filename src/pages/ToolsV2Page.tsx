import React, { useState } from 'react';
import BASE_URL from '../config';

// Fresh, minimal, self-contained tool widgets (no reuse of old components)

type ToolId = 'career-path' | 'interview' | 'skill-gap' | 'salary' | 'resume' | 'mentor';

const endpointMap: Record<ToolId, string> = {
  'career-path': '/api/v2/tools/career-path',
  interview: '/api/v2/tools/interview',
  'skill-gap': '/api/v2/tools/skill-gap',
  salary: '/api/v2/tools/salary',
  resume: '/api/v2/tools/resume',
  mentor: '/api/v2/tools/mentor',
};

const Section: React.FC<{ title: string; subtitle: string; children: React.ReactNode }>
= ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border p-6">
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    <p className="text-gray-600 mt-1 mb-4">{subtitle}</p>
    {children}
  </div>
);

const ToolsV2Page: React.FC = () => {
  const [active, setActive] = useState<ToolId | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900">AI Career Tools</h1>
          <p className="text-gray-600 mt-2">Freshly rebuilt with Gemini via environment variables</p>
        </div>

        {!active && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Section title="Career Path" subtitle="Personalized role matches and roadmap">
              <button className="px-4 py-2 rounded-md bg-blue-600 text-white" onClick={()=> setActive('career-path')}>Open</button>
            </Section>
            <Section title="Interview Simulator" subtitle="Questions with strong answer cues">
              <button className="px-4 py-2 rounded-md bg-emerald-600 text-white" onClick={()=> setActive('interview')}>Open</button>
            </Section>
            <Section title="Skill Gap" subtitle="Gaps vs target role + 4-week plan">
              <button className="px-4 py-2 rounded-md bg-purple-600 text-white" onClick={()=> setActive('skill-gap')}>Open</button>
            </Section>
            <Section title="Salary Advisor" subtitle="Market range and negotiation script">
              <button className="px-4 py-2 rounded-md bg-amber-600 text-white" onClick={()=> setActive('salary')}>Open</button>
            </Section>
            <Section title="Resume Assistant" subtitle="ATS issues and bullet rewrites">
              <button className="px-4 py-2 rounded-md bg-rose-600 text-white" onClick={()=> setActive('resume')}>Open</button>
            </Section>
            <Section title="AI Mentor" subtitle="Actionable career guidance on-demand">
              <button className="px-4 py-2 rounded-md bg-sky-600 text-white" onClick={()=> setActive('mentor')}>Open</button>
            </Section>
          </div>
        )}

        {active && (
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <button className="mb-4 px-3 py-1.5 border rounded-md" onClick={()=> setActive(null)}>Back</button>
            {active === 'career-path' && <CareerPathWidget />}
            {active === 'interview' && <InterviewWidget />}
            {active === 'skill-gap' && <SkillGapWidget />}
            {active === 'salary' && <SalaryWidget />}
            {active === 'resume' && <ResumeWidget />}
            {active === 'mentor' && <MentorWidget />}
          </div>
        )}
      </div>
    </div>
  );
};

const useAI = <T extends Record<string, any>>(tool: ToolId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [reply, setReply] = useState<string>('');

  const call = async (body: T) => {
    setLoading(true); setError(''); setReply('');
    try {
      const resp = await fetch(`${BASE_URL}${endpointMap[tool]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || 'Request failed');
      setReply(data?.data?.reply || '');
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally { setLoading(false); }
  };

  return { loading, error, reply, call };
};

const CareerPathWidget: React.FC = () => {
  const { loading, error, reply, call } = useAI<{skills:string; interests:string; experience:string}>('career-path');
  const [skills, setSkills] = useState('React, Node.js, SQL');
  const [interests, setInterests] = useState('building products, data, startups');
  const [experience, setExperience] = useState('fresher');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-700">Skills</label>
          <input className="w-full border rounded-md px-3 py-2" value={skills} onChange={(e)=> setSkills(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-700">Interests</label>
          <input className="w-full border rounded-md px-3 py-2" value={interests} onChange={(e)=> setInterests(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-700">Experience</label>
          <select className="w-full border rounded-md px-3 py-2" value={experience} onChange={(e)=> setExperience(e.target.value)}>
            <option value="fresher">Fresher</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>
        </div>
        <button className={`px-4 py-2 rounded-md text-white ${loading?'bg-blue-300':'bg-blue-600 hover:bg-blue-700'}`} onClick={()=> call({ skills, interests, experience })} disabled={loading}> {loading?'Generating…':'Generate Plan'} </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="border rounded-md p-4 min-h-[320px] whitespace-pre-wrap">{reply || 'Output will appear here.'}</div>
    </div>
  );
};

const InterviewWidget: React.FC = () => {
  const { loading, error, reply, call } = useAI<{role:string; seniority:string; domain:string}>('interview');
  const [role, setRole] = useState('Software Engineer');
  const [seniority, setSeniority] = useState('junior');
  const [domain, setDomain] = useState('web');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-700">Role</label>
          <input className="w-full border rounded-md px-3 py-2" value={role} onChange={(e)=> setRole(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-700">Seniority</label>
          <select className="w-full border rounded-md px-3 py-2" value={seniority} onChange={(e)=> setSeniority(e.target.value)}>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-700">Domain</label>
          <input className="w-full border rounded-md px-3 py-2" value={domain} onChange={(e)=> setDomain(e.target.value)} />
        </div>
        <button className={`px-4 py-2 rounded-md text-white ${loading?'bg-emerald-300':'bg-emerald-600 hover:bg-emerald-700'}`} onClick={()=> call({ role, seniority, domain })} disabled={loading}> {loading?'Generating…':'Generate Questions'} </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="border rounded-md p-4 min-h-[320px] whitespace-pre-wrap">{reply || 'Output will appear here.'}</div>
    </div>
  );
};

const SkillGapWidget: React.FC = () => {
  const { loading, error, reply, call } = useAI<{targetRole:string; currentSkills:string}>('skill-gap');
  const [targetRole, setTargetRole] = useState('Data Analyst');
  const [currentSkills, setCurrentSkills] = useState('Excel, SQL, Python basics');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-700">Target Role</label>
          <input className="w-full border rounded-md px-3 py-2" value={targetRole} onChange={(e)=> setTargetRole(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-700">Current Skills</label>
          <input className="w-full border rounded-md px-3 py-2" value={currentSkills} onChange={(e)=> setCurrentSkills(e.target.value)} />
        </div>
        <button className={`px-4 py-2 rounded-md text-white ${loading?'bg-purple-300':'bg-purple-600 hover:bg-purple-700'}`} onClick={()=> call({ targetRole, currentSkills })} disabled={loading}> {loading?'Analyzing…':'Analyze Gaps'} </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="border rounded-md p-4 min-h-[320px] whitespace-pre-wrap">{reply || 'Output will appear here.'}</div>
    </div>
  );
};

const SalaryWidget: React.FC = () => {
  const { loading, error, reply, call } = useAI<{role:string; location:string; years:number}>('salary');
  const [role, setRole] = useState('Software Engineer');
  const [location, setLocation] = useState('Bengaluru');
  const [years, setYears] = useState(2);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-700">Role</label>
          <input className="w-full border rounded-md px-3 py-2" value={role} onChange={(e)=> setRole(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-700">Location</label>
          <input className="w-full border rounded-md px-3 py-2" value={location} onChange={(e)=> setLocation(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-700">Years of Experience</label>
          <input type="number" min={0} className="w-full border rounded-md px-3 py-2" value={years} onChange={(e)=> setYears(parseInt(e.target.value || '0', 10))} />
        </div>
        <button className={`px-4 py-2 rounded-md text-white ${loading?'bg-amber-300':'bg-amber-600 hover:bg-amber-700'}`} onClick={()=> call({ role, location, years })} disabled={loading}> {loading?'Estimating…':'Estimate & Script'} </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="border rounded-md p-4 min-h-[320px] whitespace-pre-wrap">{reply || 'Output will appear here.'}</div>
    </div>
  );
};

const ResumeWidget: React.FC = () => {
  const { loading, error, reply, call } = useAI<{resumeText:string; targetRole:string}>('resume');
  const [resumeText, setResumeText] = useState('Paste your resume text here...');
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-700">Target Role</label>
          <input className="w-full border rounded-md px-3 py-2" value={targetRole} onChange={(e)=> setTargetRole(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-700">Resume Text</label>
          <textarea className="w-full border rounded-md px-3 py-2 h-40" value={resumeText} onChange={(e)=> setResumeText(e.target.value)} />
        </div>
        <button className={`px-4 py-2 rounded-md text-white ${loading?'bg-rose-300':'bg-rose-600 hover:bg-rose-700'}`} onClick={()=> call({ resumeText, targetRole })} disabled={loading}> {loading?'Analyzing…':'Analyze Resume'} </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="border rounded-md p-4 min-h-[320px] whitespace-pre-wrap">{reply || 'Output will appear here.'}</div>
    </div>
  );
};

const MentorWidget: React.FC = () => {
  const { loading, error, reply, call } = useAI<{question:string}>('mentor');
  const [question, setQuestion] = useState('I have 1 year gap after graduation. How to position it?');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-700">Your Question</label>
          <textarea className="w-full border rounded-md px-3 py-2 h-32" value={question} onChange={(e)=> setQuestion(e.target.value)} />
        </div>
        <button className={`px-4 py-2 rounded-md text-white ${loading?'bg-sky-300':'bg-sky-600 hover:bg-sky-700'}`} onClick={()=> call({ question })} disabled={loading}> {loading?'Thinking…':'Ask Mentor'} </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <div className="border rounded-md p-4 min-h-[320px] whitespace-pre-wrap">{reply || 'Output will appear here.'}</div>
    </div>
  );
};

export default ToolsV2Page;
