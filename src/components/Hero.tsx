import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, GraduationCap, MapPin } from 'lucide-react';

const slides = [
  { url: '/assets/hero/slide-1.jpg', caption: 'Excellence in Education' },
  { url: '/assets/hero/slide-2.jpg', caption: 'Building Future Leaders' },
  { url: '/assets/hero/slide-3.jpg', caption: 'Our School, Our Pride' },
  { url: '/assets/hero/slide-4.jpg', caption: 'Growing Together' },
];

export const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const next = useCallback(() => setCurrentIndex((prev) => (prev + 1) % slides.length), []);
  const prev = useCallback(() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[currentIndex];
  const showImage = !!slide.url && !failed[currentIndex];

  return (
    <div className="relative w-full overflow-hidden bg-school-green" style={{ minHeight: '85vh' }}>
      {/* Background slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          {showImage ? (
            <img
              src={slide.url}
              alt={slide.caption}
              className="h-full w-full object-cover object-center"
              onError={() => setFailed((p) => ({ ...p, [currentIndex]: true }))}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[#1B5B3F] via-[#0D4904] to-[#1B5B3F] flex items-center justify-center">
              <div className="text-center text-white/70 px-6">
                <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/15">
                  <ImageIcon />
                </div>
                <div className="font-semibold">Hero image placeholder</div>
                <div className="text-sm text-white/60">
                  Add images to <span className="font-mono">public/assets/hero/</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10" />

      {/* Green accent strip at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#318F61] via-[#4D913D] to-[#1B5B3F] z-30" />

      {/* Main content */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* School badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/20"
            >
              <GraduationCap size={16} />
              <span>Est. 1901 — Moravian Heritage</span>
            </motion.div>

            {/* School name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight"
            >
              Mvenyane
              <br />
              <span className="text-[#4D913D]">Senior Secondary</span>
              <br />
              School
            </motion.h1>

            {/* Motto */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-5 text-xl sm:text-2xl text-white/80 font-light italic"
            >
              "Education is the key to success"
            </motion.p>

            {/* Location tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-4 flex items-center gap-2 text-white/60 text-sm"
            >
              <MapPin size={14} />
              <span>Mvenyane A/A, Cedarville — Eastern Cape</span>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <a
                href="/admissions"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#318F61] text-white font-bold text-base hover:bg-[#4D913D] transition-all shadow-lg shadow-green-900/30 hover:shadow-green-900/50"
              >
                Apply Now
              </a>
              <a
                href="/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold text-base border border-white/30 hover:bg-white/20 transition-all"
              >
                Learn More
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Slide caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`caption-${currentIndex}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-12 right-8 z-20 hidden md:block"
        >
          <p className="text-white/60 text-sm font-medium tracking-wider uppercase">
            {slide.caption}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Slide navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/25 transition-all border border-white/10"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/25 transition-all border border-white/10"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`transition-all duration-300 rounded-full ${
              i === currentIndex
                ? 'bg-[#4D913D] w-8 h-2.5'
                : 'bg-white/40 w-2.5 h-2.5 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
