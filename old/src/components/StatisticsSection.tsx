import React, { useState, useEffect, useRef } from 'react';
import { Users, BookOpen, Code, Video, TrendingUp, Award, Target, Zap } from 'lucide-react';

const StatisticsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    learners: 0,
    mentors: 0,
    linesOfCode: 0,
    videos: 0,
    completionRate: 0,
    conceptRetention: 0,
    topicUnderstanding: 0
  });

  const sectionRef = useRef<HTMLDivElement>(null);

  const targetValues = {
    learners: 1000,
    mentors: 20,
    // 5 Lakhs = 500,000
    linesOfCode: 500000,
    videos: 100,
    completionRate: 72,
    conceptRetention: 78,
    topicUnderstanding: 84
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const animateCounters = () => {
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    Object.keys(targetValues).forEach((key) => {
      const targetValue = targetValues[key as keyof typeof targetValues];
      let currentValue = 0;
      const increment = targetValue / steps;

      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
          currentValue = targetValue;
          clearInterval(timer);
        }
        
        setCounters(prev => ({
          ...prev,
          [key]: Math.floor(currentValue)
        }));
      }, stepTime);
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const CircularProgress = ({ percentage, children }: { percentage: number; children: React.ReactNode }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  };

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.6'%3E%3Cpath d='m40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm-1.5-.5c0 10.237-8.263 18.5-18.5 18.5s-18.5-8.263-18.5-18.5 8.263-18.5 18.5-18.5 18.5 8.263 18.5 18.5z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            <span>Our Impact</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            We Are Proud Of
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Our Achievements
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Numbers that showcase our commitment to transforming careers and building the future workforce.
          </p>
        </div>

        {/* Statistics Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12">
          {/* Number Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatNumber(counters.learners)}+
                </div>
                <div className="text-gray-600 font-medium">Learners Worldwide</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <BookOpen className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {counters.mentors.toLocaleString()}+
                </div>
                <div className="text-gray-600 font-medium">Expert Mentors</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <Code className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {counters.linesOfCode >= 500000 ? '5 Lakhs' : formatNumber(counters.linesOfCode)}
                </div>
                <div className="text-gray-600 font-medium">Lines of Code</div>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <Video className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {counters.videos.toLocaleString()}+
                </div>
                <div className="text-gray-600 font-medium">Learning Videos</div>
              </div>
            </div>
          </div>

          {/* Circular Progress Statistics */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <CircularProgress percentage={isVisible ? targetValues.completionRate : 0}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{counters.completionRate}%</div>
                </div>
              </CircularProgress>
              <div className="mt-4">
                <h4 className="font-bold text-gray-900 mb-2">Course Completion</h4>
                <p className="text-sm text-gray-600">Learners complete courses within 3 months</p>
              </div>
            </div>

            <div className="text-center">
              <CircularProgress percentage={isVisible ? targetValues.conceptRetention : 0}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{counters.conceptRetention}%</div>
                </div>
              </CircularProgress>
              <div className="mt-4">
                <h4 className="font-bold text-gray-900 mb-2">Concept Retention</h4>
                <p className="text-sm text-gray-600">Learners recollect concepts faster</p>
              </div>
            </div>

            <div className="text-center">
              <CircularProgress percentage={isVisible ? targetValues.topicUnderstanding : 0}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{counters.topicUnderstanding}%</div>
                </div>
              </CircularProgress>
              <div className="mt-4">
                <h4 className="font-bold text-gray-900 mb-2">Topic Understanding</h4>
                <p className="text-sm text-gray-600">Better grasp of complex topics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;