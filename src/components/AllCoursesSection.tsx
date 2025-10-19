import { useEffect, useState } from 'react';
import { Globe, Clock } from 'lucide-react';
import { courseService, Course } from '../services/courseService';
import { normalizePath } from '../utils/url';
import QueryForm from './queries/QueryForm';

const AllCoursesSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQueryCourse, setActiveQueryCourse] = useState<Course | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourses({ limit: 12 });
        if (mounted) setCourses(data);
      } catch (e) {
        console.error('Failed to load courses', e);
        if (mounted) setError('Failed to load courses');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Show duration exactly as entered by admin; no extra formatting

  return (
    <section className="py-20 bg-gray-50" id="all-courses">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in-down">
            Explore Our Courses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
            Find the perfect course to launch or advance your career in technology.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl">
          {courses.map((course, index) => (
            <div
              key={index}
              className="flex flex-col h-full rounded-2xl bg-white overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
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
              {/* Top image */}
              <div className="h-44 w-full overflow-hidden">
                <img
                  src={course.image || 'https://via.placeholder.com/800x450?text=Course'}
                  alt={course.title || 'Course'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content area */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-xl font-extrabold text-blue-700 leading-snug">
                  {course.title || 'Untitled Course'}
                </h3>
                <p className="mt-2 text-gray-600 text-sm line-clamp-3">
                  {(
                    (course.shortDescription && course.shortDescription.length > 0)
                      ? course.shortDescription
                      : (course.description ? String(course.description) : '')
                  ) || ''}
                </p>
                <div className="mt-3 flex items-center gap-4 text-gray-600 text-sm">
                  <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" />{(course as any).duration ?? ''}</span>
                  <span className="inline-flex items-center gap-1"><Globe className="w-4 h-4" />{course.category || 'General'}</span>
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
        )}
        {/* Query Modal */}
        {activeQueryCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm relative max-h-[90vh]">
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
                className="max-h-[85vh] overflow-y-auto"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllCoursesSection;
