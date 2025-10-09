import React from 'react';
import { Star, Zap, Award, Users } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-8 h-8 text-blue-500" />,
    title: 'Hands-On Learning',
    description: 'Engage with real-world projects and build a portfolio that showcases your skills.',
  },
  {
    icon: <Award className="w-8 h-8 text-blue-500" />,
    title: 'Expert Instructors',
    description: 'Learn from industry professionals with years of experience in their fields.',
  },
  {
    icon: <Users className="w-8 h-8 text-blue-500" />,
    title: 'Career Support',
    description: 'Get access to our career services, including resume reviews and interview prep.',
  },
];

const WhyChooseUsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Choose Our Courses?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {features.map((feature, index) => (
            <div key={index} className="p-8 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
