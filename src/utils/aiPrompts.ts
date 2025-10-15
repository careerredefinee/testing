// Centralized prompt builders for AI tools

export const buildCareerPrompt = (data: {
  name?: string;
  skills?: string;
  interests?: string;
  education?: string;
  experience?: string;
  targetRole?: string;
  industries?: string;
  location?: string;
}) => {
  return (
    `You are an expert career coach. Create a concise, step-by-step career plan.` +
    `\nReturn sections with headers, bullets, and clear actions.` +
    `\n\nInputs:` +
    `\nName: ${data.name || '-'}\nCurrent skills: ${data.skills || '-'}\nInterests: ${data.interests || '-'}\nEducation: ${data.education || '-'}\nExperience: ${data.experience || '-'}\nTarget role: ${data.targetRole || '-'}\nIndustries: ${data.industries || '-'}\nLocation: ${data.location || '-'}\n` +
    `\nOutput sections:` +
    `\n- Summary fit` +
    `\n- Suggested roles` +
    `\n- Learning roadmap (weeks)` +
    `\n- Projects/Portfolio` +
    `\n- Networking plan` +
    `\n- Job search strategy` +
    `\n- 30/60/90-day plan`
  );
};

export const buildInterviewPrompt = (data: {
  role?: string;
  jobDescription?: string;
}) => {
  return (
    `Act as an interviewer for the role: ${data.role || '-'}.` +
    `\nAsk 5 questions one by one. For each, provide model answer hints and evaluation criteria.` +
    `\nJob description (if any):\n${data.jobDescription || '-'}`
  );
};

export const buildSkillGapPrompt = (data: {
  targetRole?: string;
  currentSkills?: string;
}) => {
  return (
    `Analyze skill gaps for role: ${data.targetRole || '-'}.` +
    `\nCurrent skills: ${data.currentSkills || '-'}.` +
    `\nReturn:` +
    `\n- Required skills (core/advanced)` +
    `\n- Missing skills` +
    `\n- Learning resources (links ok as plain text)` +
    `\n- 4-week plan with outcomes`
  );
};

export const buildSalaryPrompt = (data: {
  role?: string;
  location?: string;
  experience?: string;
}) => {
  return (
    `Provide salary research and negotiation strategy.` +
    `\nRole: ${data.role || '-'}\nLocation: ${data.location || '-'}\nExperience: ${data.experience || '-'}` +
    `\nInclude:` +
    `\n- Typical ranges (use general guidance if no data)` +
    `\n- Factors impacting comp` +
    `\n- Negotiation scripts` +
    `\n- Benefits & equity checklist`
  );
};

export const buildResumeAnalysisPrompt = (extractedText: string) => {
  return (
    `You are an ATS and career coach. Analyze the following resume content.` +
    `\nReturn:` +
    `\n- Summary assessment` +
    `\n- Strengths` +
    `\n- Gaps with suggested bullet improvements` +
    `\n- Keyword optimization tips` +
    `\n- 5 tailored bullet points (STAR style)` +
    `\n\nRESUME TEXT:\n${extractedText}`
  );
};

export const buildMentorPrompt = (question: string) => {
  return (
    `You are a concise, supportive AI career mentor. Answer the question clearly with actionable steps.` +
    `\nQuestion: ${question}`
  );
};
