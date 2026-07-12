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
      value: isVisible ? counts.students : 0,
      formatted: isVisible ? formatNumber(counts.students) : '0',
      color: 'text-blue-600',
      bg: 'from-blue-50 to-blue-100/30',
      iconBg: 'bg-blue-100'
    },
    {
      id: 'colleges',
      icon: BuildingOfficeIcon,
      label: 'Partner Colleges',
      value: isVisible ? counts.colleges : 0,
      formatted: isVisible ? formatNumber(counts.colleges) : '0',
      color: 'text-indigo-600',
      bg: 'from-indigo-50 to-indigo-100/30',
      iconBg: 'bg-indigo-100'
    },
    {
      id: 'events',
      icon: CalendarIcon,
      label: 'Events Hosted',
      value: isVisible ? counts.events : 0,
      formatted: isVisible ? formatNumber(counts.events) : '0',
      color: 'text-purple-600',
      bg: 'from-purple-50 to-purple-100/30',
      iconBg: 'bg-purple-100'
    },
    {
      id: 'rating',
      icon: StarIcon,
      label: 'User Rating',
      value: stats.averageRating || 4.8,
      formatted: (stats.averageRating || 4.8).toFixed(1) + '★',
      color: 'text-yellow-600',
      bg: 'from-yellow-50 to-yellow-100/30',
      iconBg: 'bg-yellow-100'
    }
  ];

  if (loading) {
    return (
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 text-center bg-gray-100 rounded-2xl animate-pulse h-36"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="stats-section" className="py-16 bg-white border-t border-gray-100">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.id}
              className={`p-6 text-center transition-all duration-300 bg-gradient-to-br ${card.bg} rounded-2xl hover:shadow-xl hover:-translate-y-1 group`}
            >
              <div className={`inline-flex p-3 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className={`text-3xl md:text-4xl font-bold mt-3 ${card.color} transition-all duration-300`}>
                {card.formatted}
              </div>
              <div className="mt-1 text-sm font-medium text-gray-600">{card.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;