import AllCoursesSection from './components/AllCoursesSection';
import FeaturedCourseSection from './components/FeaturedCourseSection';
import WhyChooseUsSection from './components/WhyChooseUsSection';
import TestimonialsSection from './components/TestimonialsSection';
import OfferBanner from './components/OfferBanner';
import CallbackButton from './components/CallbackButton';

const CoursesPage = () => {
  return (
    <>
      <FeaturedCourseSection />
      {/* Limited-time banner only on Courses page, above courses */}
      <OfferBanner />
      {/* Heading above courses */}
     
      <AllCoursesSection />
      {/* Intro + single CTA moved below the course cards */}
      <section className="py-16 bg-gray-50">
  <div className="container mx-auto px-6">
    {/* White Container */}
    <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-3xl mx-auto border border-gray-100">
      
      {/* Top Text */}
      <p className="text-lg text-gray-800 mb-3">
        For working professionals & learners with strong academic foundations,  
        ready to grow into <span className="font-semibold text-gray-900">AI-powered decision-makers.</span>
      </p>

      {/* Badge */}
      <p className="mt-4 inline-flex items-center gap-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-full px-6 py-2 shadow-sm">
        🎯 Only 30 Seats | 🎤 Interview-Based Shortlisting
      </p>

      {/* Heading */}
      <h2 className="mt-8 text-3xl md:text-4xl font-extrabold text-gray-900 leading-snug">
        Book Your Free Interview Slot Today
      </h2>

      {/* Blue Button */}
      <div className="mt-10 flex justify-center">
        <a
          href="/support#booking"
          className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-md hover:shadow-xl transition transform hover:-translate-y-1"
        >
          🚀 Book Interview
        </a>
      </div>
    </div>
  </div>
</section>

      <WhyChooseUsSection />
      <TestimonialsSection />
      <CallbackButton />
    </>
  );
};

export default CoursesPage;
