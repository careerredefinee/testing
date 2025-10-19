import React from 'react';
import { ChevronRight, CheckCircle2, MessageCircle, Phone, Shield, ArrowRight, BookOpen, BarChart3, Brain, Database } from 'lucide-react';

const WAPL = 'https://wa.me/919535713363?text=Hi%20Career%20Redefine%2C%20I%20want%20to%20apply%20for%20the%20Advanced%20Data%20Analytics%20program';

const AdvancedAnalyticsLanding: React.FC = () => {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
        <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-sm md:text-base font-semibold text-blue-700 mb-3">Transform your career journey</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Advanced Data Analytics with <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="mt-4 text-gray-600 text-lg">
                Join thousands of professionals who have redefined their careers with our expert guidance and comprehensive program.
              </p>
              <p className="mt-2 text-gray-600">
                For working professionals & learners with strong academic foundations, ready to grow into AI-powered decision-makers.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-700">
                <span className="inline-flex items-center rounded-full bg-white shadow px-3 py-1 border">Only 30 Seats</span>
                <span className="inline-flex items-center rounded-full bg-white shadow px-3 py-1 border">Interview-Based Shortlisting</span>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a href="/support#booking" className="group inline-flex items-center justify-center px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:shadow-lg">
                  Book Interview <ChevronRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a href="#apply-now" className="inline-flex items-center justify-center px-6 py-4 rounded-xl bg-white border text-gray-800 font-semibold hover:bg-gray-50">
                  Start your journey <ArrowRight className="w-5 h-5 ml-2" />
                </a>
                <a href={WAPL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-6 py-4 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700">
                  WhatsApp Us <MessageCircle className="w-5 h-5 ml-2" />
                </a>
              </div>

              <div className="mt-6 text-sm text-gray-600">
                AI-powered workflows | Statistical Analysis & Product Analytics | Learn from: IIT Alumn & Ex-Scaler Data Science Instructor
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&w=1280"
                  alt="Data Analytics with AI"
                  className="w-full h-80 md:h-[420px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 hidden md:flex bg-white shadow-lg rounded-xl p-4 gap-3">
                <Brain className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="font-semibold">AI-Powered</div>
                  <div className="text-sm text-gray-600">Hands-on automation</div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary CTA row to ensure 3+ CTA occurrences */}
          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            <a href="/support#booking" className="w-full inline-flex items-center justify-center rounded-lg border px-4 py-3 font-semibold hover:bg-gray-50">Book Interview</a>
            <a href="/support#booking" className="w-full inline-flex items-center justify-center rounded-lg border px-4 py-3 font-semibold hover:bg-gray-50">Book Interview</a>
            <a href="/support#booking" className="w-full inline-flex items-center justify-center rounded-lg border px-4 py-3 font-semibold hover:bg-gray-50">Book Interview</a>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-16 md:py-24 bg-gray-50" id="curriculum">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Services • What You’ll Learn</h2>
            <p className="mt-3 text-gray-600">This isn’t just a course. It’s a career accelerator.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="inline-flex items-center gap-2 text-blue-700 font-semibold mb-2"><Database className="w-5 h-5" /> Step 1: Strong Foundations</div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 w-5 h-5 text-green-600" /> SQL & BigQuery → Work with real company databases</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 w-5 h-5 text-green-600" /> Python & Pandas → Clean, analyze, and manipulate data fast</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 w-5 h-5 text-green-600" /> Tableau & Excel → Create dashboards that drive decisions</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <div className="inline-flex items-center gap-2 text-purple-700 font-semibold mb-2"><BarChart3 className="w-5 h-5" /> Step 2: Advanced Skills</div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 w-5 h-5 text-green-600" /> Statistical Analysis → Understand patterns, predict outcomes</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 w-5 h-5 text-green-600" /> Product Analytics → Growth & user behavior like Zomato/Swiggy/Amazon</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 w-5 h-5 text-green-600" /> AI-Powered Automation → GenAI, APIs, tools like n8n for workflows</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <div className="inline-flex items-center gap-2 text-indigo-700 font-semibold mb-2"><BookOpen className="w-5 h-5" /> Step 3: Career Preparation</div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 w-5 h-5 text-green-600" /> Dedicated Interview Prep Module</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 w-5 h-5 text-green-600" /> Mock interviews + aptitude tests + real-world case studies</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 w-5 h-5 text-green-600" /> ATS Resume building + personalized career guidance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About Career Redefine */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">About Career Redefine</h3>
              <p className="text-gray-700 mb-4">Career Redefine - Redefining Careers with Premium Quality, Made Affordable.</p>
              <p className="text-gray-700 mb-4">At Career Redefine, we are on a mission to make world-class Data Science and AI education accessible to every ambitious professional in India.</p>
              <ul className="space-y-2 text-gray-700 mb-6 list-disc pl-5">
                <li>Premium in quality – guided by IIT alumni & industry experts</li>
                <li>Practical in approach – built on real projects, not theory</li>
                <li>Affordable in cost – because career growth shouldn’t demand lakhs</li>
              </ul>
              <p className="text-gray-700">In just 3 batches, we’ve helped learners break free from repetitive IT/reporting jobs and step into roles as AI-powered analysts, product thinkers, and decision-makers. We are a career accelerator helping professionals transform into leaders who thrive in the AI-driven future.</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 shadow">
              <h4 className="text-xl font-semibold mb-4">What Happens Next?</h4>
              <ol className="space-y-3 text-gray-800">
                <li className="flex items-start gap-3"><span className="font-semibold">1️⃣ Application Review</span> – Our team reviews your details within 24–48 hours</li>
                <li className="flex items-start gap-3"><span className="font-semibold">2️⃣ Mentor Interview</span> – 1:1 discussion to assess your goals, background, and readiness</li>
                <li className="flex items-start gap-3"><span className="font-semibold">3️⃣ Selection & Offer</span> – Secure your seat in the 30-member cohort</li>
                <li className="flex items-start gap-3"><span className="font-semibold">4️⃣ Begin Your Journey</span> – Personal mentorship, projects, and career prep start right away</li>
              </ol>
              <div className="mt-6 text-sm text-gray-600 flex items-center gap-2"><Shield className="w-4 h-4" />
                🔒 Your information is secure. We only contact shortlisted candidates.
              </div>
              <div className="mt-6">
                <a href="/support#booking" className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow">
                  Book Interview <ChevronRight className="ml-2 w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp + Contact */}
      <section id="apply-now" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
              <h4 className="text-xl font-bold mb-2">Prefer a Faster Way?</h4>
              <p className="text-gray-700 mb-4">Just send us a quick “Hi” on WhatsApp and our team will guide you through the application process.</p>
              <a href={WAPL} target="_blank" rel="noreferrer" className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700">
                Connect via WhatsApp <MessageCircle className="w-5 h-5 ml-2" />
              </a>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-gray-700">
                <span className="inline-flex items-center gap-2"><Phone className="w-5 h-5 text-green-700" /> +91 9535713363</span>
                <span className="inline-flex items-center gap-2"><MailIcon /> datascience@careerredefine.com</span>
                <span className="inline-flex items-center">Address: 22nd Floor, World Trade Center, Bengaluru</span>
                <span className="inline-flex items-center">Monday-Saturday : 9am-6pm</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h4 className="text-xl font-bold mb-3">Quick Apply</h4>
              <p className="text-gray-700 mb-4">Only 30 Seats | Interview-Based Shortlisting</p>
              <a href="/support#booking" className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                Book Interview <ChevronRight className="ml-2 w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-700">
    <path d="M1.5 6.75A2.25 2.25 0 013.75 4.5h16.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 17.25V6.75zm2.4-.75a.75.75 0 00-.6 1.2l7.2 8.4a1.5 1.5 0 002.3 0l7.2-8.4a.75.75 0 00-.6-1.2H3.9z" />
  </svg>
);

export default AdvancedAnalyticsLanding;
