import { useEffect, useRef, useState } from "react";
import { adminService } from "../services/adminService";

type Brand = {
  _id: string;
  title: string;
  type?: "accreditation" | "partner";
  text?: string;
  link?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
};

const PartnershipsSection = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminService.getBrands(1, 100);
        const list: Brand[] = data?.brands || [];
        setBrands(list.filter((b) => b.isActive !== false));
      } catch (e) {
        setBrands([]);
      }
    };
    load();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollAmount = 0;
    let speed = 1.5; // adjust speed here
    let animationFrame: number;

    const scrollStep = () => {
      if (!container) return;
      container.scrollLeft += speed;
      scrollAmount += speed;

      // reset scroll when half completed (since we duplicated items)
      if (scrollAmount >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
        scrollAmount = 0;
      }

      animationFrame = requestAnimationFrame(scrollStep);
    };

    animationFrame = requestAnimationFrame(scrollStep);

    return () => cancelAnimationFrame(animationFrame);
  }, [brands]);

  const marqueeItems = brands.length > 0 ? brands : [];

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-gray-600">
          From Career Redefine to the world’s best companies 
          </p>
        </div>

        {/* Infinite Scroll Animation */}
        <div
          ref={scrollRef}
          className="relative flex overflow-x-hidden space-x-16"
        >
          {[...marqueeItems, ...marqueeItems].map((b, index) => {
            const content = (
              <div className="w-24 h-12 rounded flex items-center justify-center">
                {b.image ? (
                  <img
                    src={b.image}
                    alt={b.title}
                    className="max-h-10 max-w-[96px] object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-sm font-semibold text-gray-700">
                    {b.title}
                  </span>
                )}
              </div>
            );
            return (
              <div
                key={`${b._id || b.title}-${index}`}
                className="flex-shrink-0 flex items-center justify-center w-32 h-20 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                title={b.title}
              >
                {b.link ? (
                  <a
                    href={b.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PartnershipsSection;
