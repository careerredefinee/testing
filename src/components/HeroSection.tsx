import React, { useState, useEffect } from 'react';
import { ChevronRight, Play, Star, Users, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const navigate = useNavigate();

  const heroSlides = [
    {
      title: "Transform Your Career with",
      highlight: "AI-Powered Learning",
      description: "Join 5000+ professionals who've transformed their careers with our industry-relevant courses and personalized mentorship.",
      image: "hero1.png"
    },
    {
      title: "Master the Future of",
      highlight: "Data Science & AI",
      description: "Learn from industry experts and work on real-world projects that prepare you for tomorrow's opportunities.",
      image: "hero2.png"
    },
    {
      title: "Build Your Tech Career with",
      highlight: "Expert Mentorship",
      description: "Get personalized guidance from industry veterans and accelerate your journey to career success.",
      image: "hero3.png"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Star className="w-4 h-4" />
              <span>India's #1 Career Platform</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
            </div>

            {/* Dynamic Title */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                <span className="block transition-all duration-700">
                  {heroSlides[currentSlide].title}
                </span>
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  {heroSlides[currentSlide].highlight}
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl transition-all duration-700">
                {heroSlides[currentSlide].description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-8">
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">5000+</span>
                <span className="text-gray-600">Learners</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">95%</span>
                <span className="text-gray-600">Success Rate</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="flex items-center space-x-2">
                  <span>Start Your Journey</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <a href="/support#booking" className="group px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-800 font-semibold rounded-xl hover:bg-white transition-all duration-300 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg">
                <span className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Book a Session</span>
                </span>
              </a>
            </div>
          </div>

          {/* Right Content - Dynamic Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
              <img
                src={heroSlides[currentSlide].image}
                alt="Career Transformation"
                className="w-full h-96 md:h-[500px] object-cover transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Star className="w-8 h-8 text-white" />
            </div>
            
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full shadow-lg animate-pulse"></div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center mt-12 space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-blue-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Background Animation */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
    </div>
  );
};

export default HeroSection;
