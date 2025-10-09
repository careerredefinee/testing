import { 
  GraduationCap, 
  Users, 
  Heart, 
  TestTube, 
  Target, 
  Briefcase,
  ChevronRight 
} from 'lucide-react';
import styles from './CorporateSection.module.css';
import { useNavigate } from 'react-router-dom';

const CorporateSection = () => {
  const navigate = useNavigate();
  const services = [
    {
      icon: GraduationCap,
      title: "Specialized Corporate Training",
      description: "Customized training programs designed for your team's specific needs and industry requirements.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Streamlined Corporate Hiring",
      description: "End-to-end recruitment solutions with skill assessment and candidate matching.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Heart,
      title: "Corporate Social Responsibility",
      description: "Partner with us for impactful CSR initiatives that upskill underserved communities.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: TestTube,
      title: "HYRE Assessment",
      description: "Advanced AI-powered assessment platform for technical and behavioral evaluations.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Target,
      title: "End-to-End Campus Hiring",
      description: "Complete campus recruitment solutions with pre-screening and onboarding support.",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <section className="py-20 bg-white relative">

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Briefcase className="w-4 h-4" />
            <span>Enterprise Solutions</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            CareerRedefine for
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Corporates
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our customized corporate solutions designed to enhance your workforce capabilities and drive organizational growth.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
                
                {/* Icon Container */}
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>

                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <div className={`w-8 h-8 bg-gradient-to-r ${service.color} rounded-full flex items-center justify-center`}>
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Animated Border */}
                <div className={`absolute inset-0 rounded-2xl overflow-hidden ${styles.borderAnimation}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl transition-all duration-500 group-hover:scale-105"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Workforce?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Let's discuss how our corporate solutions can drive growth and innovation in your organization.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/support#booking')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="flex items-center space-x-2">
                  <span>Schedule Consultation</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <a
                href="/brochure.pdf"
                download
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg text-center"
              >
                Download Brochure
              </a>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default CorporateSection;