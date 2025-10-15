import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Users, 
  Award, 
  Globe,
  BookOpen,
  Target,
  Zap,
  Heart
} from 'lucide-react';

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById('about-section');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const highlights = [
    {
      icon: Users,
      value: "3M+",
      label: "Learners Worldwide",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Globe,
      value: "50+",
      label: "Countries Reached",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Award,
      value: "95%",
      label: "Success Rate",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BookOpen,
      value: "100+",
      label: "Course Programs",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section id="about-section" className="py-20 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 left-10 w-24 h-24 bg-purple-100 rounded-full opacity-30 animate-bounce"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Image and Stats */}
          <div className={`relative transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            {/* Main Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-xl">
                <img
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="EdTech Learning"
                  className="w-full rounded-2xl shadow-lg object-cover h-80"
                />
                
                {/* Floating Stats */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Live Classes</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Career Focused</span>
                  </div>
                </div>
              </div>

              {/* Highlights Grid */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                {highlights.map((highlight, index) => {
                  const IconComponent = highlight.icon;
                  return (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow group">
                      <div className={`w-10 h-10 bg-gradient-to-r ${highlight.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{highlight.value}</div>
                      <div className="text-sm text-gray-600">{highlight.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              <span>About Career Redefine</span>
            </div>

            {/* Main Content */}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Leading EdTech Platform for Learning in
              <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Native Languages
              </span>
            </h2>

            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                <span className="font-bold text-green-600">CareerRedefine</span>, India's premier tech-driven EdTech platform. We specialize in delivering personalized learning experiences in both regional and global languages.
              </p>

              <p>
                With over <span className="font-bold text-blue-600">1000+ learners</span> worldwide, we offer comprehensive online learning programs, professional upskilling opportunities, and dedicated job placement assistance. Our mission is to bridge the skill gap and empower professionals to achieve their career aspirations.
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center space-x-3 mb-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                  <span className="font-bold text-gray-900 text-xl">Our Mission</span>
                </div>
                <p className="text-gray-700 italic">
                  "To democratize quality education and create pathways for career transformation through innovative, accessible, and personalized learning experiences."
                </p>
              </div>
            </div>

            {/* Key Features */}
            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Why Choose Career Redefine?</h3>
              <div className="space-y-3">
                {[
                  "Industry-relevant curriculum designed with experts",
                  "Personalized mentorship from seasoned professionals",
                  "Hands-on projects with real-world applications",
                  "Job placement assistance with 95% success rate",
                  "Multi-language learning support",
                  "Flexible learning schedules for working professionals"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border-l-4 border-green-500">
              <p className="text-gray-700 font-medium italic">
                <span className="text-green-600 font-bold">CareerRedefine</span> – Build Your Professional Legacy
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;