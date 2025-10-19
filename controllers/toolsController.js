import { GoogleGenerativeAI } from '@google/generative-ai';

// Fresh Gemini client/init (separate from aiController)
const buildClient = () => {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return null;
  try { return new GoogleGenerativeAI(key); } catch { return null; }
};
const getModel = () => {
  const client = buildClient();
  if (!client) return null;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  return client.getGenerativeModel({ model: modelName });
};

const gen = async (instruction) => {
  const model = getModel();
  if (!model) return { fallback: true, text: 'AI is not configured. Please set GEMINI_API_KEY in environment.' };
  const result = await model.generateContent(instruction);
  const text = result?.response?.text?.() || 'No response.';
  return { fallback: false, text };
};

export const careerPath = async (req, res) => {
  try {
    const { skills = '', interests = '', experience = 'fresher' } = req.body || {};
    const prompt = `You are a world-class career strategist. Build a concise, actionable career path plan.
Input:
- Skills: ${skills}
- Interests: ${interests}
- Experience level: ${experience}
Return:
1) Top 3 role matches (why fit)
2) 30/60/90-day upskilling roadmap (specific resources)
3) Portfolio/Proof-of-work ideas
4) Interview topics to prepare
Keep it crisp, step-by-step, India job market relevant.`;
    const { fallback, text } = await gen(prompt);
    return res.status(200).json({ status: 'success', data: { reply: text, fallback } });
  } catch (e) {
    return res.status(200).json({ status: 'success', data: { reply: 'Temporary fallback. Try again.' } });
  }
};

export const interviewSim = async (req, res) => {
  try {
    const { role = 'Software Engineer', seniority = 'junior', domain = 'general' } = req.body || {};
    const prompt = `Act as an interviewer for ${role} (${seniority}). Domain: ${domain}.
Give 8 questions with:
- Question
- What a strong answer includes (bullet points)
- A follow-up probe
Keep concise, practical, Indian market context.`;
    const { fallback, text } = await gen(prompt);
    return res.status(200).json({ status: 'success', data: { reply: text, fallback } });
  } catch (e) {
    return res.status(200).json({ status: 'success', data: { reply: 'Temporary fallback. Try again.' } });
  }
};

export const skillGap = async (req, res) => {
  try {
    const { targetRole = 'Data Analyst', currentSkills = '' } = req.body || {};
    const prompt = `You are a career trainer. Analyze skill gaps.
Target Role: ${targetRole}
Current Skills: ${currentSkills}
Return:
1) Must-have skills (beginner→advanced)
2) Gaps vs target role
3) 4-week learning plan (weekly milestones + resources)
4) Practice exercises & small project ideas.`;
    const { fallback, text } = await gen(prompt);
    return res.status(200).json({ status: 'success', data: { reply: text, fallback } });
  } catch (e) {
    return res.status(200).json({ status: 'success', data: { reply: 'Temporary fallback. Try again.' } });
  }
};

export const salaryAdvisor = async (req, res) => {
  try {
    const { role = 'Software Engineer', location = 'Bengaluru', years = 2 } = req.body || {};
    const prompt = `Salary negotiation advisor:
Role: ${role}
Location: ${location}
Experience: ${years} years
Return:
1) Market range (junior/avg/top) with assumptions
2) Negotiation script (with counters)
3) Non-compensation levers (benefits, remote, sign-on)
4) Do/Don’t checklist.`;
    const { fallback, text } = await gen(prompt);
    return res.status(200).json({ status: 'success', data: { reply: text, fallback } });
  } catch (e) {
    return res.status(200).json({ status: 'success', data: { reply: 'Temporary fallback. Try again.' } });
  }
};

export const resumeAssistant = async (req, res) => {
  try {
    const { resumeText = '', targetRole = '' } = req.body || {};
    const prompt = `Resume assistant. Analyze and enhance for role: ${targetRole}.
RESUME:
${resumeText}
Return:
1) ATS red flags
2) Bullet rewrite (use strong verbs, metrics)
3) Section suggestions
4) Final summary profile (3-4 lines).`;
    const { fallback, text } = await gen(prompt);
    return res.status(200).json({ status: 'success', data: { reply: text, fallback } });
  } catch (e) {
    return res.status(200).json({ status: 'success', data: { reply: 'Temporary fallback. Try again.' } });
  }
};

export const mentor = async (req, res) => {
  try {
    const { question = '' } = req.body || {};
    const prompt = `You are a compassionate career mentor. Give actionable guidance.
Question: ${question}
Return:
- Diagnosis (what’s really going on)
- Options (with pros/cons)
- Recommended next 3 steps (specific)
- Encouragement (1 line).`;
    const { fallback, text } = await gen(prompt);
    return res.status(200).json({ status: 'success', data: { reply: text, fallback } });
  } catch (e) {
    return res.status(200).json({ status: 'success', data: { reply: 'Temporary fallback. Try again.' } });
  }
};
