import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTwitter, 
  FaLinkedinIn, 
  FaInstagram, 
  FaYoutube,
  FaGithub
} from 'react-icons/fa';
import Logo from '../auth/Logo';

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
    <footer className="py-16 text-white bg-[#000000] border-t border-[#1f1f23]">
      <div className="container px-4 mx-auto sm:px-6 lg:px-8 max-w-[1440px]">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="md:col-span-1 space-y-4">
            <Logo size="small" />
            <p className="max-w-xs text-xs leading-relaxed text-zinc-400">
              A secure networking platform for college students to connect, collaborate, 
              and grow together.
            </p>
            <div className="flex space-x-2 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="p-2 text-zinc-400 transition-colors bg-[#121212] border border-[#262626] rounded-xl hover:text-white hover:bg-[#1c1c1e]"
                  aria-label={social.name}
                >
                  <social.icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="mb-4 text-xs font-semibold tracking-wider text-white uppercase">
              Platform
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-xs text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="mb-4 text-xs font-semibold tracking-wider text-white uppercase">
              Support
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    className="text-xs text-zinc-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h4 className="mb-4 text-xs font-semibold tracking-wider text-white uppercase">
              Stay Updated
            </h4>
            <p className="mb-4 text-xs text-zinc-400">
              Subscribe to get the latest updates and events from CampusLink.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-xs text-white bg-[#121212] border border-[#262626] rounded-l-xl focus:outline-none focus:border-[#0095F6] placeholder-zinc-500"
              />
              <button className="px-4 py-2 text-xs font-semibold text-white bg-[#0095F6] rounded-r-xl hover:bg-[#1877F2] transition-colors cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-12 text-xs text-center text-zinc-500 border-t border-[#1f1f23]">
          <p>
            &copy; {currentYear} CampusLink. All rights reserved.
          </p>
          <div className="flex items-center justify-center mt-2 space-x-4">
            <a href="#" className="text-xs text-zinc-500 transition-colors hover:text-zinc-300">
              Privacy
            </a>
            <span className="text-zinc-700">|</span>
            <a href="#" className="text-xs text-zinc-500 transition-colors hover:text-zinc-300">
              Terms
            </a>
            <span className="text-zinc-700">|</span>
            <a href="#" className="text-xs text-zinc-500 transition-colors hover:text-zinc-300">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;