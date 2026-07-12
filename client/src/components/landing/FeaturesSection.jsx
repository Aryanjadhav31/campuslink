import React, { useState } from 'react';
import { 
  UsersIcon, 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon, 
  CalendarIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const FeaturesSection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const features = [
    {
      id: 1,
      icon: UsersIcon,
      title: 'Verified Student Network',
      description: 'Connect with verified students from your college and beyond. Build your professional network with trusted peers.',
      points: ['Verified Student Profiles', 'Multiple Colleges', 'Trusted Network'],
      color: 'text-blue-600',
      iconBg: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 2,
      icon: ChatBubbleLeftRightIcon,
      title: 'Real-Time Messaging',
      description: 'Chat instantly with friends and classmates. Share ideas, collaborate on projects, and stay connected.',
      points: ['Instant Messaging', 'Image Sharing', 'Read Receipts'],
      color: 'text-purple-600',
      iconBg: 'bg-purple-50',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 3,
      icon: UserGroupIcon,
      title: 'College Communities',
      description: 'Join communities based on your interests and passions. Find your tribe and grow together.',
      points: ['Interest-Based Groups', 'Club Management', 'Member Discussions'],
      color: 'text-green-600',
      iconBg: 'bg-green-50',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 4,
      icon: CalendarIcon,
      title: 'Events & Workshops',
      description: 'Discover and participate in campus events, workshops, hackathons, and networking meetups.',
      points: ['Hackathons', 'Workshops', 'Networking Events'],
      color: 'text-orange-600',
      iconBg: 'bg-orange-50',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      id: 5,
      icon: AcademicCapIcon,
      title: 'Study Groups',
      description: 'Find study partners for your courses, prepare together for exams, and share resources.',
      points: ['Study Partners', 'Resource Sharing', 'Exam Preparation'],
      color: 'text-red-600',
      iconBg: 'bg-red-50',
      gradient: 'from-red-500 to-red-600'
    },
    {
      id: 6,
      icon: RocketLaunchIcon,
      title: 'Career Development',
      description: 'Network with seniors, find mentors, discover internships, and build your career path.',
      points: ['Mentorship', 'Internships', 'Career Guidance'],
      color: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center px-4 py-2 mb-4 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Platform Features
          </div>
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Succeed</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-500">
            Complete toolkit for building meaningful connections and advancing your career
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="relative p-8 overflow-hidden transition-all duration-500 bg-white border border-gray-100 shadow-sm group rounded-2xl hover:shadow-xl hover:-translate-y-2"
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} transition-all duration-500 ${hoveredCard === feature.id ? 'opacity-5' : 'opacity-0'}`}></div>
              
              <div className="relative">
                <div className={`${feature.iconBg} w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                
                <h3 className="mb-3 text-xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-600">
                  {feature.title}
                </h3>
                <p className="mb-4 leading-relaxed text-gray-500">
                  {feature.description}
                </p>
                
                <ul className="mb-4 space-y-2">
                  {feature.points.map((point, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircleIcon className="flex-shrink-0 w-4 h-4 mr-2 text-blue-500" />
                      {point}
                    </li>
                  ))}
                </ul>
                
                <div className="flex items-center text-blue-600 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                  <span className="text-sm font-medium">Learn More</span>
                  <ArrowRightIcon className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;