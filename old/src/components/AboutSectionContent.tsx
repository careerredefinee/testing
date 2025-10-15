import React from 'react';
import { Users, Rocket, Target, Heart } from 'lucide-react';
import MentorsCarousel from './MentorsCarousel';

const AboutSectionContent: React.FC = () => {
  return (
    <div className="bg-gray-50 font-sans">
      {/* Our Story Section */}
      <div className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="prose prose-lg text-gray-700">
              <h2 className="text-3xl font-extrabold text-gray-900">Our Story</h2>
              <p>
                Founded in 2023, Career Redefine was born from a simple yet powerful idea: that everyone deserves to love what they do. Our founders, Jane and John, experienced firsthand the frustrations of navigating the modern job market. They saw a need for a more intelligent, personalized, and supportive approach to career development.
              </p>
              <p>
                We started as a small team of passionate innovators, and have grown into a global platform that has helped thousands of individuals transform their careers. We believe in the power of technology to create opportunities and the power of human connection to guide them.
              </p>
            </div>
            <div className="relative h-96">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" alt="Our team" className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-lg" />
            </div>
          </div>
          {/* Dynamic Mentors Slider */}
          <div className="mt-14">
            <MentorsCarousel featuredOnly />
          </div>
        </div>
      </div>

      

      {/* Our Values Section */}
      <div className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Our Core Values</h2>
            <p className="mt-4 text-lg text-gray-600">The principles that guide everything we do.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-8">
              <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">User-Centric</h3>
              <p className="mt-2 text-gray-600">We put our users at the heart of every decision we make.</p>
            </div>
            <div className="p-8">
              <Rocket className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Innovation-Driven</h3>
              <p className="mt-2 text-gray-600">We constantly push the boundaries of technology to create better solutions.</p>
            </div>
            <div className="p-8">
              <Target className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Results-Oriented</h3>
              <p className="mt-2 text-gray-600">We are committed to helping our users achieve tangible career outcomes.</p>
            </div>
            <div className="p-8">
              <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Community-Focused</h3>
              <p className="mt-2 text-gray-600">We foster a supportive community where everyone can grow together.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meet the Visionaries (CEO) */}
      <div className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Meet the Visionaries</h2>
            <p className="mt-4 text-lg text-gray-600">The leader driving our mission forward.</p>
          </div>
          <div className="grid grid-cols-1 gap-12">
            <div className="relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-200 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                <div className="lg:col-span-1 p-8 flex items-center justify-center bg-gradient-to-b from-gray-100 to-white">
                  <img src="/ceo.png" alt="Siddu Mathapati" className="h-48 w-48 object-cover rounded-2xl shadow-lg" />
                </div>
                <div className="lg:col-span-2 p-8">
                  <h3 className="text-2xl font-bold text-gray-900">Siddu Mathapati</h3>
                  <p className="text-indigo-600 font-semibold">Founder & CEO, Career Redefine</p>
                  <div className="mt-4 space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      I’m Siddu Mathapati — Founder & CEO of Career Redefine, a platform built to empower professionals with the right skills, mindset, and direction to thrive in today’s fast-changing tech world.
                    </p>
                    <p>
                      Over the years, I’ve worked across roles ranging from data science to leadership, collaborating with top industry minds, executive leaders, and fellow entrepreneurs.
                    </p>
                    <p>
                      My journey has involved building AI-powered solutions for real-world challenges, including modern policing initiatives to support smarter decision-making in public systems.
                    </p>
                    <p>
                      As an author and columnist, I regularly share insights on career growth, technology, and the future of work.
                    </p>
                    <p>
                      Through Career Redefine, I’ve helped hundreds of individuals successfully transition into tech careers — offering structured programs in Data Science, Machine Learning, and AI-powered analytics, backed by practical projects, expert mentoring, and complete career support.
                    </p>
                    <p>
                      My mission is simple: to redefine careers with clarity, confidence, and capability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSectionContent;
