import { useEffect, useRef, useState } from 'react';

const MS_IN_SECOND = 1000;
const MS_IN_MINUTE = 60 * MS_IN_SECOND;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const MS_IN_DAY = 24 * MS_IN_HOUR;

const OfferBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const targetRef = useRef<number>(Date.now() + 7 * MS_IN_DAY);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      let diff = targetRef.current - now;
      if (diff <= 0) {
        // Reset to another 7 days rolling countdown
        targetRef.current = Date.now() + 7 * MS_IN_DAY;
        diff = targetRef.current - Date.now();
      }
      setTimeLeft({
        days: Math.floor(diff / MS_IN_DAY),
        hours: Math.floor((diff % MS_IN_DAY) / MS_IN_HOUR),
        minutes: Math.floor((diff % MS_IN_HOUR) / MS_IN_MINUTE),
        seconds: Math.floor((diff % MS_IN_MINUTE) / MS_IN_SECOND),
      });
    };

    // Initial call and interval
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 text-center">
      <div className="container mx-auto px-4">
        <p className="font-semibold text-sm md:text-base">
          ✨ Limited-Time Offer! Get 20% off on all courses. Ends in
          <span className="ml-2 font-bold">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </span>
        </p>
      </div>
    </div>
  );
};

export default OfferBanner;
