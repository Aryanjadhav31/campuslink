import React from 'react';
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
  const features = [
    {
      id: 1,
      icon: UsersIcon,
      title: 'Verified Student Network',
      description: 'Connect with verified students from your college and beyond. Build your professional network with trusted peers.',
      points: ['Verified Student Profiles', 'Multiple Colleges', 'Trusted Network'],
    },
    {
      id: 2,
      icon: ChatBubbleLeftRightIcon,
      title: 'Real-Time Messaging',
      description: 'Chat instantly with friends and classmates. Share ideas, collaborate on projects, and stay connected.',
      points: ['Instant Messaging', 'Image Sharing', 'Read Receipts'],
    },
    {
      id: 3,
      icon: UserGroupIcon,
      title: 'College Communities',
      description: 'Join communities based on your interests and passions. Find your tribe and grow together.',
      points: ['Interest-Based Groups', 'Club Management', 'Member Discussions'],
    },
    {
      id: 4,
      icon: CalendarIcon,
      title: 'Events & Workshops',
      description: 'Discover and participate in campus events, workshops, hackathons, and networking meetups.',
      points: ['Hackathons', 'Workshops', 'Networking Events'],
    },
    {
      id: 5,
      icon: AcademicCapIcon,
      title: 'Study Groups',
      description: 'Find study partners for your courses, prepare together for exams, and share resources.',
      points: ['Study Partners', 'Resource Sharing', 'Exam Preparation'],
    },
    {
      id: 6,
      icon: RocketLaunchIcon,
      title: 'Career Development',
      description: 'Network with seniors, find mentors, discover internships, and build your career path.',
      points: ['Mentorship', 'Internships', 'Career Guidance'],
    }
  ];

  return (
    <section className="py-24 bg-[#000000] border-t border-[#1f1f23] text-white">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8 max-w-[1440px]">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div className="inline-flex items-center px-4 py-1.5 mb-4 text-xs font-semibold text-zinc-300 bg-[#121212] border border-[#262626] rounded-full">
            <SparklesIcon className="w-4 h-4 mr-2 text-[#0095F6]" />
            Platform Features
          </div>
          <h2 className="mb-4 text-4xl font-extrabold text-white tracking-tight">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-zinc-400">
            Complete toolkit for building meaningful connections and advancing your career
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="relative p-8 bg-[#121212] border border-[#262626] rounded-2xl transition-all duration-300 hover:border-[#383838] group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1c1c1e] text-[#0095F6] flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6" />
                </div>
                
                <h3 className="mb-2 text-xl font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
                
                <ul className="mb-6 space-y-2">
                  {feature.points.map((point, idx) => (
                    <li key={idx} className="flex items-center text-xs text-zinc-300">
                      <CheckCircleIcon className="flex-shrink-0 w-4 h-4 mr-2 text-[#0095F6]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center text-[#0095F6] text-xs font-semibold pt-2">
                <span>Learn More</span>
                <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;