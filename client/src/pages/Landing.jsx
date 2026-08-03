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
    <div className="min-h-screen overflow-x-hidden bg-[#000000] text-white font-sans antialiased">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <Testimonials />
      
      {/* Top Clubs Section */}
      <section className="py-20 bg-[#000000] border-t border-[#1f1f23]">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8 max-w-[1440px]">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Top Rated{' '}
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Clubs
              </span>
            </h2>
            <p className="mt-2 text-zinc-400">Join the most active communities on CampusLink</p>
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