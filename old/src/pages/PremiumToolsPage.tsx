import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code as CodeIcon, ListChecks, MessageSquare, Briefcase } from 'lucide-react';
import { aiService } from '../services/aiService';

// Helper: parse AI text into bullet items
function toListItems(text: string): string[] {
  if (!text) return [];
  // Normalize newlines and strip code fences or markdown
  let t = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\r/g, '')
    .trim();
  // Split on newlines; treat lines starting with -, *, or digits. as items
  const lines = t.split(/\n+/).map((l) => l.trim());
  const items: string[] = [];
  for (const l of lines) {
    if (!l) continue;
    const m = l.match(/^[-*\u2022]\s+(.*)$/); // - item or * item or • item
    const n = l.match(/^\d+\.?\s+(.*)$/); // 1. item
    if (m) items.push(m[1].trim());
    else if (n) items.push(n[1].trim());
    else items.push(l);
  }
  // De-duplicate
  return Array.from(new Set(items)).filter(Boolean);
}

// Types for Quiz (MCQ)
type MCQ = { question: string; options: string[]; answerIndex: number };

type ToolState = {
  input: string;
  items: string[];
  shown: number; // how many to display
  loading: boolean;
  error?: string | null;
};

const initialToolState: ToolState = { input: '', items: [], shown: 5, loading: false, error: null };

const PremiumToolsPage: React.FC = () => {
  const navigate = useNavigate();
  // Quiz specialized state
  const [quizInput, setQuizInput] = useState<string>('');
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [selected, setSelected] = useState<number[]>([]); // selected option index per question
  const [finished, setFinished] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Interview and Jobs simple list tools
  const [interview, setInterview] = useState<ToolState>({ ...initialToolState });
  const [jobs, setJobs] = useState<ToolState>({ ...initialToolState });
  // Debug Code tool
  const [debugInput, setDebugInput] = useState<string>('');
  const [debugOutput, setDebugOutput] = useState<string>('');
  const [debugLoading, setDebugLoading] = useState<boolean>(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  // Page-level tool selection
  const [activeTool, setActiveTool] = useState<null | 'debug' | 'quiz' | 'interview' | 'jobs'>(null);

  const canLoadMore = (s: ToolState) => s.items.length > s.shown && s.shown < 20;

  const runAI = async (
    toolKey: 'interview' | 'jobs',
    prompt: string,
    system: string
  ) => {
    const setState = toolKey === 'interview' ? setInterview : setJobs;

    if (!prompt.trim()) {
      setState((s) => ({ ...s, error: 'Please enter a value', loading: false }));
      return;
    }

    try {
      setState((s) => ({ ...s, loading: true, error: null }));
      const message = `${system}\n\nUser Input: ${prompt}\n\nReturn only clear bullet points, no paragraphs.`;
      const resp = await aiService.chat({ message, tool: toolKey });
      const text = (resp as any)?.data?.reply || '';
      const parsed = toListItems(text);
      setState((s) => ({ ...s, items: parsed.slice(0, 20), shown: 5 }));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to generate';
      setState((s) => ({ ...s, error: msg }));
    } finally {
      setState((s) => ({ ...s, loading: false }));
    }
  };

  // Generate 25 MCQs for quiz using structured JSON
  const generateQuiz = async () => {
    if (!quizInput.trim()) {
      setQuizError('Please enter a course or subject');
      return;
    }
    try {
      setQuizLoading(true);
      setQuizError(null);
      setFinished(false);
      setScore(0);
      setCurrent(0);
      setSelected([]);
      setMcqs([]);
      const system = `Generate a quiz of EXACTLY 25 multiple-choice questions for the given course/subject.
Return STRICT JSON only, no markdown fences, with this exact shape:
[
  {"question": "...", "options": ["...","...","...","..."], "answerIndex": 0}
]
Rules:
- 4 options per question
- answerIndex is the 0-based index of the correct option
- No explanations, no extra text, only the JSON array`;
      const message = `${system}\n\nCourse/Subject: ${quizInput}`;
      const resp = await aiService.chat({ message, tool: 'quiz' });
      const text = (resp as any)?.data?.reply || '';
      // Attempt to parse JSON from the response
      const jsonMatch = text.match(/\[([\s\S]*)\]$/);
      const payload = jsonMatch ? `[${jsonMatch[1]}]` : text;
      const parsed = JSON.parse(payload) as MCQ[];
      const cleaned = parsed
        .filter(q => q && typeof q.question === 'string' && Array.isArray(q.options) && typeof q.answerIndex === 'number')
        .slice(0, 25)
        .map(q => ({
          question: q.question.trim(),
          options: q.options.slice(0, 4).map(o => String(o).trim()),
          answerIndex: Math.min(3, Math.max(0, q.answerIndex | 0))
        }));
      if (cleaned.length < 25) {
        // If fewer than 25, it's acceptable but we still proceed
      }
      setMcqs(cleaned);
      setSelected(new Array(cleaned.length).fill(-1));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to generate quiz';
      setQuizError(msg);
    } finally {
      setQuizLoading(false);
    }
  };

  const selectOption = (qIndex: number, optIndex: number) => {
    setSelected(prev => {
      const next = [...prev];
      next[qIndex] = optIndex;
      return next;
    });
  };

  const finishQuiz = () => {
    let sc = 0;
    for (let i = 0; i < mcqs.length; i++) {
      if (selected[i] === mcqs[i].answerIndex) sc++;
    }
    setScore(sc);
    setFinished(true);
  };

  const closeQuiz = () => {
    setQuizInput('');
    setQuizError(null);
    setQuizLoading(false);
    setMcqs([]);
    setSelected([]);
    setCurrent(0);
    setFinished(false);
    setScore(0);
  };

  const sections = useMemo(
    () => [
      {
        key: 'quiz' as const,
        title: 'Quiz (by Course/Subject)',
        placeholder: 'Enter course or subject, e.g., Data Structures',
        button: 'Generate 25-Question Quiz',
      },
      {
        key: 'interview' as const,
        title: 'Interview Questions Generator',
        placeholder: 'Enter job role, e.g., Frontend Developer',
        button: 'Generate Questions',
        state: interview,
        setState: setInterview,
        system:
          'Generate 5 focused interview questions tailored to the given job role. Each bullet point is a single question. No numbering, no extra text.',
      },
      {
        key: 'jobs' as const,
        title: 'Job Suggestions (by Skills)',
        placeholder: 'Enter your key skills, e.g., React, Node.js, SQL',
        button: 'Suggest Roles',
        state: jobs,
        setState: setJobs,
        system:
          'Based on the listed skills, provide 5 suitable job role suggestions. Each bullet point is a role title with a short 8-12 word justification. No numbering.',
      },
    ],
    [interview, jobs]
  );

  const runDebug = async () => {
    if (!debugInput.trim()) {
      setDebugError('Please paste the code to debug');
      return;
    }
    try {
      setDebugLoading(true);
      setDebugError(null);
      setDebugOutput('');
      const system = `You are a strict code debugging assistant. Analyze the provided code (up to ~200 lines). Return:\n- Key issues and bugs\n- Exact error messages if any\n- Fixed code snippets only for the parts that change (wrap snippets in triple backticks with language)\n- Suggestions to improve performance or readability.\nBe concise and structured.`;
      const message = `${system}\n\nCODE:\n\n${debugInput}`;
      const resp = await aiService.chat({ message, tool: 'debug' });
      const text = (resp as any)?.data?.reply || (resp as any)?.reply || '';
      setDebugOutput(text);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to debug code';
      setDebugError(msg);
    } finally {
      setDebugLoading(false);
    }
  };

  const renderTiles = () => (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exclusive Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Debug Code */}
        <button
          onClick={() => setActiveTool('debug')}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-left hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center">
              <CodeIcon size={22} />
            </div>
            <div className="font-semibold text-gray-900">Debug Code</div>
          </div>
          <div className="text-sm text-gray-600">Analyze code up to ~200 lines and get fixes.</div>
        </button>

        {/* Quiz */}
        <button
          onClick={() => setActiveTool('quiz')}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-left hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white flex items-center justify-center">
              <ListChecks size={22} />
            </div>
            <div className="font-semibold text-gray-900">Quiz Generator</div>
          </div>
          <div className="text-sm text-gray-600">Create a 25-question MCQ quiz for any subject.</div>
        </button>

        {/* Interview */}
        <button
          onClick={() => setActiveTool('interview')}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-left hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center">
              <MessageSquare size={22} />
            </div>
            <div className="font-semibold text-gray-900">Interview Questions</div>
          </div>
          <div className="text-sm text-gray-600">Generate 5 focused interview questions for a role.</div>
        </button>

        {/* Jobs */}
        <button
          onClick={() => setActiveTool('jobs')}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-left hover:shadow-md transition"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center">
              <Briefcase size={22} />
            </div>
            <div className="font-semibold text-gray-900">Job Suggestions</div>
          </div>
          <div className="text-sm text-gray-600">Suggest 5 suitable roles based on listed skills.</div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      {/* Back button outside main container, top-left */}
      <div className="max-w-5xl mx-auto px-4 mb-4">
        <button
          onClick={() => navigate('/premium')}
          className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
      </div>
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Premium AI Tools</h1>
        <p className="text-gray-600 mb-8">Choose a tool below to get started.</p>

        {/* When no tool selected, show tiles */}
        {activeTool === null && renderTiles()}

        {/* When a tool is selected, show a Back-to-tiles button and the tool's container */}
        {activeTool === 'debug' && (
          <>
            <div className="max-w-5xl mx-auto mb-4">
              <button onClick={() => setActiveTool(null)} className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Back</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Debug Code (Gemini)</h2>
              <p className="text-sm text-gray-600 mb-3">Paste up to ~200 lines. We’ll analyze and suggest fixes. No code is stored.</p>
              <textarea
                value={debugInput}
                onChange={(e) => setDebugInput(e.target.value)}
                rows={10}
                placeholder="Paste your code here..."
                className="w-full resize-y rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={runDebug}
                  disabled={debugLoading}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {debugLoading ? 'Debugging…' : 'Debug with Gemini'}
                </button>
                <button
                  onClick={() => { setDebugInput(''); setDebugOutput(''); setDebugError(null); }}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
              {debugError && <div className="text-sm text-red-600 mt-2">{debugError}</div>}
              {debugOutput && (
                <div className="mt-4 bg-gray-50 rounded-md p-4 border prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap break-words">{debugOutput}</pre>
                </div>
              )}
            </div>
          </>
        )}

        {activeTool === 'quiz' && (
          <>
            <div className="max-w-5xl mx-auto mb-4">
              <button onClick={() => setActiveTool(null)} className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Back</button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Quiz (by Course/Subject)</h2>
              {!finished ? (
                <>
                  <div className="flex flex-col md:flex-row gap-3 mb-4">
                    <input
                      value={quizInput}
                      onChange={(e) => setQuizInput(e.target.value)}
                      placeholder="Enter course or subject, e.g., Data Structures"
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={generateQuiz}
                      disabled={quizLoading}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {quizLoading ? 'Generating…' : 'Generate 25-Question Quiz'}
                    </button>
                    <button
                      onClick={closeQuiz}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  </div>
                  {quizError && <div className="text-sm text-red-600 mb-2">{quizError}</div>}

                  {mcqs.length > 0 && (
                    <div>
                      <div className="mb-3 text-sm text-gray-600">Question {current + 1} of {mcqs.length}</div>
                      <div className="bg-gray-50 rounded-md p-4 border">
                        <div className="font-medium text-gray-900 mb-3">{mcqs[current].question}</div>
                        <div className="space-y-2">
                          {mcqs[current].options.map((opt, idx) => (
                            <label key={idx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`q${current}`}
                                checked={selected[current] === idx}
                                onChange={() => selectOption(current, idx)}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                          disabled={current === 0}
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {current < mcqs.length - 1 ? (
                          <button
                            onClick={() => setCurrent((c) => Math.min(mcqs.length - 1, c + 1))}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            Next
                          </button>
                        ) : (
                          <button
                            onClick={finishQuiz}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700"
                          >
                            Finish
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 rounded-md p-6 border text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">Your Score</div>
                  <div className="text-3xl text-green-700 font-extrabold mb-4">{score} / {mcqs.length}</div>
                  <button
                    onClick={closeQuiz}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {(activeTool === 'interview' || activeTool === 'jobs') && (() => {
          const secMaybe = sections.find(s => s.key === (activeTool as any));
          if (!secMaybe) return null;
          const sec = secMaybe!;
          return (
            <>
              <div className="max-w-5xl mx-auto mb-4">
                <button onClick={() => setActiveTool(null)} className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Back</button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{sec.title}</h2>
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <input
                    value={sec.state!.input}
                    onChange={(e) => sec.setState!((s) => ({ ...s, input: e.target.value }))}
                    placeholder={sec.placeholder!}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={() => runAI(sec.key as 'interview' | 'jobs', sec.state!.input, sec.system!)}
                    disabled={sec.state!.loading}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {sec.state!.loading ? 'Generating…' : sec.button}
                  </button>
                  {sec.state!.items.length > 0 && (
                    <>
                      <button
                        onClick={() => sec.setState!((s) => ({ ...s, items: [], shown: 5 }))}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                      >
                        Clear
                      </button>
                      {canLoadMore(sec.state!) && (
                        <button
                          onClick={() => sec.setState!((s) => ({ ...s, shown: Math.min(20, s.shown + 5) }))}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          Load More
                        </button>
                      )}
                    </>
                  )}
                </div>
                {sec.state!.error && (
                  <div className="text-sm text-red-600 mb-2">{sec.state!.error}</div>
                )}
                {sec.state!.items.length > 0 && (
                  <div>
                    <ul className="list-disc pl-5 space-y-1 text-gray-800">
                      {sec.state!.items.slice(0, sec.state!.shown).map((it, idx) => (
                        <li key={idx}>{it.replace(/\*/g, '')}</li>
                      ))}
                    </ul>
                    <div className="mt-3" />
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default PremiumToolsPage;
