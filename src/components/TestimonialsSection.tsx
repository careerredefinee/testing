import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star, Briefcase, TrendingUp } from 'lucide-react';
import { fetchChampions } from '../services/championService';

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const staticTestimonials = [
    {
      name: "Dhanush",
      company: "Career Redefine",
      beforeRole: "Aspiring Data Professional",
      afterRole: "Data Science Innovator (1st Batch)",
      image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200",
      testimonial:
        "Career Redefine's Data Science course transformed my career. Their dedication, invaluable guidance, ATS resume & job strategies, plus direct referral led me to a great opportunity. In my current company in just 5 months, I learned a year's worth! Grateful for their wisdom. In this challenging market, I hope you continue guiding & inspiring those who've lost hope, showing them the way forward, just as you did for me. Thank you again.",
      rating: 5,
      salaryIncrease: "—"
    },
    {
      name: "Rakshith S R",
      company: "Career Redefine",
      beforeRole: "6-year Career Gap",
      afterRole: "Full Stack Developer (Selected)",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200",
      testimonial:
        "After a 6-year gap, switching to IT felt impossible — until I joined Career Redefine. I recently got selected as a Full Stack Developer! The Python and Data Science foundation, practical approach, and Siddu Sir’s mentorship truly changed my journey. Grateful for the support and mindset this platform gave me!",
      rating: 5,
      salaryIncrease: "—"
    },
    {
      name: "Manoj Kumar",
      company: "Career Redefine",
      beforeRole: "Non-technical Background",
      afterRole: "Data Analyst (Top MNC) — 3rd Batch Data Science Innovator",
      image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=200",
      testimonial:
        "Coming from a non-technical background, I always thought a career in AI & Data Science was out of reach. But joining Career Redefine completely changed my perspective. The structured learning path, hands-on projects, and constant mentor support gave me the confidence to crack multiple interviews. Today, I am working as a Data Analyst in a top MNC, and it feels like a dream come true. I’m grateful to the team for showing me the right direction and helping me believe in myself.",
      rating: 5,
      salaryIncrease: "—"
    }
  ];
  const [testimonials, setTestimonials] = useState(staticTestimonials);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const champions = await fetchChampions({ featured: true });
        if (mounted && champions && champions.length > 0) {
          const mapped = champions.map((c: any) => ({
            name: c.name,
            company: c.company,
            beforeRole: c.beforeRole,
            afterRole: c.afterRole,
            image: c.image,
            testimonial: c.testimonial,
            rating: c.rating ?? 5,
            salaryIncrease: '—',
          }));
          setTestimonials(mapped);
        }
      } catch (e) {
        // Silent fallback to static testimonials
      }
    })();

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % (testimonials.length || 1));
    }, 6000);

    return () => { mounted = false; clearInterval(interval); };
  }, [testimonials.length]);

  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-bounce"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Success Stories</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Journey of Our
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Career Champions
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories of professionals who transformed their careers and achieved their dreams with our programs.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-5xl mx-auto">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full transform transition-all duration-500 hover:shadow-2xl">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                {/* Profile Image */}
                <div className="text-center">
                  <img
                    src={testimonials[activeIndex].image}
                    alt={testimonials[activeIndex].name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-100 object-cover shadow-lg"
                  />
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{testimonials[activeIndex].name}</h3>
                  <p className="text-blue-600 font-medium text-sm">{testimonials[activeIndex].company}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center space-x-1 mt-3">
                    {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* Testimonial Content */}
                <div className="md:col-span-2">
                  {/* Quote Icon */}
                  <div className="mb-4">
                    <Quote className="w-8 h-8 text-blue-500 opacity-50" />
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-gray-700 mb-6 leading-relaxed text-sm">
                    "{testimonials[activeIndex].testimonial}"
                  </blockquote>

                  {/* Career Transformation */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Before */}
                      <div className="bg-white/80 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600 font-medium text-xs">Before</span>
                        </div>
                        <p className="text-gray-800 font-semibold text-sm">{testimonials[activeIndex].beforeRole}</p>
                      </div>

                      {/* After */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-green-700 font-medium text-xs">After</span>
                        </div>
                        <p className="text-gray-800 font-semibold text-sm">{testimonials[activeIndex].afterRole}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center mt-8 space-x-6">
            <button
              onClick={prevSlide}
              className="p-2 bg-white shadow-md rounded-full hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? 'bg-blue-600 w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-2 bg-white shadow-md rounded-full hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-300"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;