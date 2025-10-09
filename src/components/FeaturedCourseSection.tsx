import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { courseService, Course } from '../services/courseService';

const FeaturedCourseSection = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const popular = await courseService.getPopular();
        if (mounted) setCourse(popular[0] || null);
      } catch (e) {
        console.error('Failed to load featured course', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!loading && !course) return null;

  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        {loading && (
          <div className="text-center text-gray-600">Loading featured course...</div>
        )}
        {!loading && course && (
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img
                src={course.image}
                alt={course.title}
                className="rounded-lg shadow-xl"
              />
            </div>
            <div className="md:w-1/2 md:pl-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Course: {course.title}
              </h2>
              <p className="text-gray-700 mb-6">
                {course.shortDescription || course.description}
              </p>
              <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <span>Learn More</span>
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCourseSection;
