import React, { useState, useEffect } from 'react';
import { StarIcon, ArrowLeftIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Computer Science Student',
      college: 'MIT Pune',
      text: 'CampusLink has completely transformed my college experience. I found study partners, joined coding communities, and secured my first internship through the platform.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=0095F6&color=fff&size=80&bold=true'
    },
    {
      id: 2,
      name: 'Rahul Verma',
      role: 'Engineering Student',
      college: 'VIT Vellore',
      text: 'The real-time chat and event features are exceptional. I have attended five hackathons and workshops this semester alone, all discovered through CampusLink.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=0095F6&color=fff&size=80&bold=true'
    },
    {
      id: 3,
      name: 'Sneha Patel',
      role: 'Business Administration',
      college: 'IIM Ahmedabad',
      text: 'CampusLink perfectly combines professional networking with social features. The communities helped me find like-minded individuals and build lasting relationships.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Sneha+Patel&background=0095F6&color=fff&size=80&bold=true'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-24 bg-[#000000] border-t border-[#1f1f23] text-white">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8 max-w-[1440px]">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center px-4 py-1.5 mb-4 text-xs font-semibold text-zinc-300 bg-[#121212] border border-[#262626] rounded-full">
            <SparklesIcon className="w-4 h-4 mr-2 text-[#0095F6]" />
            Student Testimonials
          </div>
          <h2 className="mb-4 text-4xl font-extrabold text-white tracking-tight">
            What Students Are{' '}
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Saying
            </span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 sm:p-10 border border-[#262626] bg-[#121212] rounded-2xl text-center">
            <div className="flex justify-center mb-4 space-x-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="mb-6 text-lg sm:text-xl leading-relaxed text-zinc-300 font-normal">
              "{testimonials[activeIndex].text}"
            </p>
            <div className="flex flex-col items-center">
              <img
                src={testimonials[activeIndex].avatar}
                alt={testimonials[activeIndex].name}
                className="w-14 h-14 mb-3 rounded-full border border-[#262626]"
              />
              <h4 className="text-base font-bold text-white">{testimonials[activeIndex].name}</h4>
              <p className="text-xs text-zinc-400">{testimonials[activeIndex].role}</p>
              <p className="text-xs text-zinc-500">{testimonials[activeIndex].college}</p>
            </div>

            {/* Navigation Controls */}
            <button
              onClick={goToPrevious}
              className="absolute p-2.5 transition-all transform -translate-y-1/2 bg-[#1c1c1e] border border-[#262626] rounded-full left-4 top-1/2 hover:bg-[#26262a] text-white focus:outline-none cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ArrowLeftIcon className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={goToNext}
              className="absolute p-2.5 transition-all transform -translate-y-1/2 bg-[#1c1c1e] border border-[#262626] rounded-full right-4 top-1/2 hover:bg-[#26262a] text-white focus:outline-none cursor-pointer"
              aria-label="Next testimonial"
            >
              <ArrowRightIcon className="w-4 h-4 text-white" />
            </button>

            {/* Progress Dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === index
                      ? 'w-7 bg-[#0095F6]'
                      : 'w-2 bg-[#262626] hover:bg-[#383838]'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;