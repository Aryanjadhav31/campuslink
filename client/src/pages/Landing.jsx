import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import StatsSection from '../components/landing/StatsSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import Testimonials from '../components/landing/Testimonials';
import TopClubs from '../components/landing/TopClubs';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <Testimonials />
      
      {/* Top Clubs Section */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Top Rated <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Clubs</span>
            </h2>
            <p className="mt-2 text-gray-500">Join the most active communities on CampusLink</p>
          </div>
          <TopClubs />
        </div>
      </section>
      
      <CTASection />
      <Footer />
    </div>
  );
};

export default Landing;