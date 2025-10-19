import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Award, Trophy, Star } from 'lucide-react';
import api from '../utils/api';

const AwardsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const iconForCategory = (category?: string) => {
    switch ((category || '').toLowerCase()) {
      case 'professional':
        return Trophy;
      case 'academic':
        return Award;
      default:
        return Star;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchAwards = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try featured first
        const resFeatured = await api.get('/api/v1/awards/featured', { params: { limit: 5 } });
        let list = (resFeatured.data?.data?.awards ?? []) as any[];

        // Fallback to general list if featured empty
        if (!list.length) {
          const resAll = await api.get('/api/v1/awards', { params: { limit: 5, sort: '-date' } });
          list = (resAll.data?.data?.awards ?? []) as any[];
        }

        // Normalize into UI model
        const normalized = list.map((a) => ({
          _id: a._id,
          title: a.title,
          organization: a.issuedBy,
          description: a.description,
          image: a.image,
          year: a.date ? String(new Date(a.date).getFullYear()) : '',
          icon: iconForCategory(a.category),
        }));

        if (isMounted) {
          setAwards(normalized);
          setCurrentSlide(0);
        }
      } catch (e: any) {
        if (isMounted) setError(e?.response?.data?.message || 'Failed to load awards');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAwards();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (awards.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (awards.length || 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [awards.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (awards.length || 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + (awards.length || 1)) % (awards.length || 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section 
      className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-10 right-20 w-20 h-20 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-15 animate-bounce"></div>
        <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-purple-300 rounded-full opacity-40 animate-ping"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            <span>Recognition & Awards</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Our Awards &
            <span className="block bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Achievements
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Recognition from industry leaders and record-breaking achievements that showcase our commitment to excellence.
          </p>
        </div>

        {/* Awards Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">Loading awards...</div>
              )}
              {error && !loading && (
                <div className="absolute inset-0 flex items-center justify-center text-red-500">{error}</div>
              )}
              {!loading && !error && awards.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">No awards to display</div>
              )}
              {awards.map((award, index) => {
                const IconComponent = award.icon;
                return (
                  <div
                    key={award._id || index}
                    className={`${index === currentSlide ? 'block' : 'hidden'}`}
                  >
                    <div className="grid md:grid-cols-2 h-full">
                      {/* Content Side */}
                      <div className="p-8 md:p-12 flex flex-col justify-start order-2 md:order-1">
                        <div className="mb-6">
                          <div className="inline-flex items-center space-x-2 text-sm text-gray-500 uppercase tracking-widest mb-4">
                            <IconComponent className="w-5 h-5" />
                            <span>Awards & Achievements</span>
                          </div>
                          
                          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                            {award.title}
                          </h3>
                          
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              {award.year}
                            </div>
                            <span className="text-gray-600 font-medium">{award.organization}</span>
                          </div>
                        </div>

                        <p className="text-lg text-gray-600 leading-relaxed mb-8">
                          {award.description}
                        </p>

                        {/* Achievement Badge */}
                        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 w-fit">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">Excellence Award</div>
                            <div className="text-sm text-gray-600">{award.organization}</div>
                          </div>
                        </div>
                      </div>

                      {/* Image Side */}
                      <div className="relative order-1 md:order-2 flex items-center justify-center p-4">
                        <img
                          src={award.image}
                          alt={award.title}
                          className="w-full h-auto max-h-[70vh] md:max-h-[75vh] lg:max-h-[80vh] object-contain bg-gray-100"
                        />
                        
                        {/* Floating Award Icon */}
                        <div className="absolute top-6 right-6 w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
                          <IconComponent className="w-8 h-8 text-yellow-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center mt-8 space-x-6">
            <button
              onClick={prevSlide}
              className="p-3 bg-white shadow-lg rounded-full hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 group"
              >
              <ChevronLeft className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
            </button>

            {/* Dots Indicator */}
            <div className="flex space-x-3">
              {awards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide
                      ? 'w-12 h-3 bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-3 bg-white shadow-lg rounded-full hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 group"
              >
              <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AwardsSection;