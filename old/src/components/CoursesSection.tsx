import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Clock } from 'lucide-react';
import { courseService, Course } from '../services/courseService';
import { normalizePath } from '../utils/url';
import QueryForm from './queries/QueryForm';

const CoursesSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQueryCourse, setActiveQueryCourse] = useState<Course | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourses({ limit: 10 });
        if (mounted) setCourses(data);
      } catch (e) {
        console.error('Failed to load courses', e);
        if (mounted) setError('Failed to load courses');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Internal buttons removed; scrolling will be controlled externally from HomePage via the container id.


  // No extra formatting; show duration exactly as admin added

  return (
    <section className="py-20 bg-white relative" id="courses">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 -left-20 w-40 h-40 bg-blue-100 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 -right-20 w-60 h-60 bg-purple-100 rounded-full opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            <span>Popular Courses</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Transform Your Career with
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Industry-Leading Courses
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn from industry experts with hands-on projects, personalized mentorship, 
            and job placement assistance in multiple languages.
          </p>
        </div>


        {loading && (
          <div className="text-center text-gray-500">Loading courses...</div>
        )}
        {error && (
          <div className="text-center text-red-600">{error}</div>
        )}
        {!loading && !error && (
          <div className="flex justify-center">
            <div className="w-full max-w-7xl">
              <div
                id="courses-scroll"
                ref={scrollRef}
                className="flex space-x-6 overflow-x-auto scrollbar-hide pb-2 pl-24 pr-24"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {courses.map((course, index) => (
                  <div
                    key={index}
                    className="flex-none w-80 rounded-2xl bg-gray-50 border border-gray-200 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:shadow-md"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      const href = normalizePath((course as any).pageLink);
                      if (href) {
                        const isExternal = /^https?:\/\//i.test(String((course as any).pageLink || ''));
                        if (isExternal) {
                          window.open(href, '_blank', 'noopener,noreferrer');
                        } else {
                          window.location.href = href;
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const href = normalizePath((course as any).pageLink);
                        if (href) {
                          const isExternal = /^https?:\/\//i.test(String((course as any).pageLink || ''));
                          if (isExternal) {
                            window.open(href, '_blank', 'noopener,noreferrer');
                          } else {
                            window.location.href = href;
                          }
                        }
                      }
                    }}
                  >
                    {/* Image top */}
                    <div className="h-44 w-full overflow-hidden">
                      <img
                        src={(course as any).image || 'https://via.placeholder.com/800x450?text=Course'}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-xl font-extrabold text-blue-700 leading-snug">
                        {course.title}
                      </h3>
                      <p className="mt-2 text-gray-600 text-sm line-clamp-3">
                        {(
                          (course as any).shortDescription && String((course as any).shortDescription).length > 0
                            ? String((course as any).shortDescription)
                            : (course as any).description ? String((course as any).description) : ''
                        ) || ''}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-gray-600 text-sm">
                        <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{(course as any).duration ?? ''}</span>
                        <span className="inline-flex items-center gap-1"><Globe className="w-4 h-4" />{(course as any).category || 'General'}</span>
                      </div>
                      <div className="mt-auto pt-4 flex items-center gap-3">
                        <a
                          href={normalizePath((course as any).pageLink)}
                          target={/^https?:\/\//i.test(String((course as any).pageLink || '')) ? '_blank' : undefined as any}
                          rel={/^https?:\/\//i.test(String((course as any).pageLink || '')) ? 'noopener noreferrer' : undefined as any}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          VIEW MORE
                        </a>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveQueryCourse(course); }}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors text-sm"
                        >
                          ENQUIRE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Query Modal */}
        {activeQueryCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md relative">
              <button
                onClick={() => setActiveQueryCourse(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
              <QueryForm
                courseId={activeQueryCourse._id}
                courseName={activeQueryCourse.title}
                defaultSubject={`Query about ${activeQueryCourse.title}`}
                onSuccess={() => setActiveQueryCourse(null)}
              />
            </div>
          </div>
        )}

        {/* View All Courses Button */}
        <div className="text-center mt-12">
          <Link to="/courses" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
