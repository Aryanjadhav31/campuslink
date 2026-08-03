import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  CalendarIcon, 
  StarIcon 
} from '@heroicons/react/24/outline';

const StatsSection = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalColleges: 0,
    totalEvents: 0,
    averageRating: 4.8,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ students: 0, colleges: 0, events: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          animateCounts();
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('stats-section');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, [stats]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/dashboard/stats');
      setStats(data);
      setCounts({
        students: data.totalStudents || 0,
        colleges: data.totalColleges || 0,
        events: data.totalEvents || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateCounts = () => {
    const duration = 2000;
    const steps = 60;
    const targetStudents = stats.totalStudents || 500;
    const targetColleges = stats.totalColleges || 50;
    const targetEvents = stats.totalEvents || 100;

    const increment = {
      students: targetStudents / steps,
      colleges: targetColleges / steps,
      events: targetEvents / steps
    };

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setCounts({
        students: Math.min(Math.floor(increment.students * currentStep), targetStudents),
        colleges: Math.min(Math.floor(increment.colleges * currentStep), targetColleges),
        events: Math.min(Math.floor(increment.events * currentStep), targetEvents)
      });
      if (currentStep >= steps) clearInterval(interval);
    }, duration / steps);
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  const statCards = [
    {
      id: 'students',
      icon: UsersIcon,
      label: 'Registered Students',
      formatted: isVisible ? formatNumber(counts.students) : '0',
    },
    {
      id: 'colleges',
      icon: BuildingOfficeIcon,
      label: 'Partner Colleges',
      formatted: isVisible ? formatNumber(counts.colleges) : '0',
    },
    {
      id: 'events',
      icon: CalendarIcon,
      label: 'Events Hosted',
      formatted: isVisible ? formatNumber(counts.events) : '0',
    },
    {
      id: 'rating',
      icon: StarIcon,
      label: 'User Rating',
      formatted: (stats.averageRating || 4.8).toFixed(1) + '★',
    }
  ];

  if (loading) {
    return (
      <section className="py-16 bg-[#000000] border-t border-[#1f1f23]">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 text-center bg-[#121212] border border-[#262626] rounded-2xl animate-pulse h-36"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="stats-section" className="py-16 bg-[#000000] border-t border-[#1f1f23]">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8 max-w-[1440px]">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.id}
              className="p-6 text-center transition-all duration-300 bg-[#121212] border border-[#262626] rounded-2xl hover:border-[#383838]"
            >
              <div className="inline-flex p-3 rounded-xl bg-[#1c1c1e] text-[#0095F6] mb-2">
                <card.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mt-2 text-white">
                {card.formatted}
              </div>
              <div className="mt-1 text-sm font-medium text-zinc-400">{card.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;