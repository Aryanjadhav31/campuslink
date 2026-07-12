import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTwitter, 
  FaLinkedinIn, 
  FaInstagram, 
  FaYoutube,
  FaGithub
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'Home', path: '/' },
      { name: 'Register', path: '/register' },
      { name: 'Login', path: '/login' },
      { name: 'Students', path: '/students' },
      { name: 'Events', path: '/events' },
      { name: 'Communities', path: '/communities' },
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'FAQ', href: '#' },
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: FaTwitter, href: '#' },
    { name: 'LinkedIn', icon: FaLinkedinIn, href: '#' },
    { name: 'Instagram', icon: FaInstagram, href: '#' },
    { name: 'YouTube', icon: FaYoutube, href: '#' },
    { name: 'GitHub', icon: FaGithub, href: '#' },
  ];

  return (
    <footer className="py-12 text-white bg-gray-900">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4 space-x-2">
              <span className="text-2xl font-bold text-blue-400">Campus</span>
              <span className="text-2xl font-bold text-white">Link</span>
            </div>
            <p className="max-w-xs leading-relaxed text-gray-400">
              A secure networking platform for college students to connect, collaborate, 
              and grow together.
            </p>
            <div className="flex mt-4 space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="p-2 text-gray-400 transition-colors bg-gray-800 rounded-lg hover:text-white hover:bg-gray-700"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              Platform
            </h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              Stay Updated
            </h4>
            <p className="mb-4 text-sm text-gray-400">
              Subscribe to get the latest updates and events from CampusLink.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm text-gray-900 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-r-lg hover:bg-blue-700">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 text-sm text-center text-gray-500 border-t border-gray-800">
          <p>
            &copy; {currentYear} CampusLink. All rights reserved.
          </p>
          <div className="flex items-center justify-center mt-2 space-x-4">
            <a href="#" className="text-xs text-gray-500 transition-colors hover:text-gray-400">
              Privacy
            </a>
            <span className="text-gray-700">|</span>
            <a href="#" className="text-xs text-gray-500 transition-colors hover:text-gray-400">
              Terms
            </a>
            <span className="text-gray-700">|</span>
            <a href="#" className="text-xs text-gray-500 transition-colors hover:text-gray-400">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;