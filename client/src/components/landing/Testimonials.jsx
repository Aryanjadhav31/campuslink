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
      avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=6366f1&color=fff&size=80&bold=true'
    },
    {
      id: 2,
      name: 'Rahul Verma',
      role: 'Engineering Student',
      college: 'VIT Vellore',
      text: 'The real-time chat and event features are exceptional. I have attended five hackathons and workshops this semester alone, all discovered through CampusLink.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Rahul+Verma&background=8b5cf6&color=fff&size=80&bold=true'
    },
    {
      id: 3,
      name: 'Sneha Patel',
      role: 'Business Administration',
      college: 'IIM Ahmedabad',
      text: 'CampusLink perfectly combines professional networking with social features. The communities helped me find like-minded individuals and build lasting relationships.',
      rating: 5,
      avatar: 'https://ui-avatars.com/api/?name=Sneha+Patel&background=ec4899&color=fff&size=80&bold=true'
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
    <section className="py-24 bg-white">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-purple-700 bg-purple-100 rounded-full">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Student Testimonials
          </div>
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            What Students Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Saying</span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative p-8 border border-gray-100 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl md:p-10">
            <div className="text-center">
              <div className="flex justify-center mb-4 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 fill-current text-amber-400" />
                ))}
              </div>
              <p className="mb-6 text-xl leading-relaxed text-gray-700">
                "{testimonials[activeIndex].text}"
              </p>
              <div className="flex flex-col items-center">
                <img
                  src={testimonials[activeIndex].avatar}
                  alt={testimonials[activeIndex].name}
                  className="w-16 h-16 mb-3 rounded-full shadow-lg"
                />
                <h4 className="text-lg font-semibold text-gray-900">{testimonials[activeIndex].name}</h4>
                <p className="text-sm text-gray-500">{testimonials[activeIndex].role}</p>
                <p className="text-sm text-gray-400">{testimonials[activeIndex].college}</p>
              </div>
            </div>

            {/* Navigation Controls */}
            <button
              onClick={goToPrevious}
              className="absolute p-2 transition-all transform -translate-y-1/2 bg-white rounded-full shadow-lg left-4 top-1/2 hover:bg-gray-50 hover:scale-110 focus:outline-none"
              aria-label="Previous testimonial"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={goToNext}
              className="absolute p-2 transition-all transform -translate-y-1/2 bg-white rounded-full shadow-lg right-4 top-1/2 hover:bg-gray-50 hover:scale-110 focus:outline-none"
              aria-label="Next testimonial"
            >
              <ArrowRightIcon className="w-5 h-5 text-gray-600" />
            </button>

            {/* Progress Dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? 'w-8 bg-purple-600'
                      : 'bg-gray-300 hover:bg-gray-400'
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