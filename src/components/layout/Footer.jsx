// components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Footer = () => {
  const { darkMode } = useAuth();
  const navigation = {
    shop: [
      { name: 'All Products', href: '/' },
      { name: 'Browse Categories', href: '/categories' },
      { name: 'Search Products', href: '/search' },
      { name: 'View Cart', href: '/cart' },
    ],
    // company: [
    //   { name: 'About', href: '/about' },
    //   { name: 'Contact', href: '/contact' },
    //   { name: 'Careers', href: '/careers' },
    //   { name: 'Press', href: '/press' },
    // ],
    // support: [
    //   { name: 'Help Center', href: '/help' },
    //   { name: 'Shipping', href: '/shipping' },
    //   { name: 'Returns', href: '/returns' },
    //   { name: 'Size Guide', href: '/size-guide' },
    // ],
    // legal: [
    //   { name: 'Privacy Policy', href: '/privacy' },
    //   { name: 'Terms of Service', href: '/terms' },
    //   { name: 'Cookie Policy', href: '/cookies' },
    // ],
  };

  // const social = [
  //   {
  //     name: 'Facebook',
  //     href: '#',
  //     icon: (props) => (
  //       <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
  //         <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  //       </svg>
  //     ),
  //   },
  //   {
  //     name: 'Instagram',
  //     href: '#',
  //     icon: (props) => (
  //       <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
  //         <path fillRule="evenodd" d="M12.017 0C8.396 0 7.989.013 7.041.072 6.094.131 5.43.333 4.844.63c-.611.31-1.13.717-1.65 1.236C2.676 2.386 2.27 2.905 1.96 3.515c-.297.586-.499 1.25-.558 2.197C1.343 6.66 1.33 7.067 1.33 10.688c0 3.621.013 4.028.072 4.976.059.947.261 1.611.558 2.197.31.611.717 1.13 1.236 1.65.52.52 1.039.926 1.65 1.236.586.297 1.25.499 2.197.558.948.059 1.355.072 4.976.072 3.621 0 4.028-.013 4.976-.072.947-.059 1.611-.261 2.197-.558.611-.31 1.13-.717 1.65-1.236.52-.52.926-1.039 1.236-1.65.297-.586.499-1.25.558-2.197.059-.948.072-1.355.072-4.976 0-3.621-.013-4.028-.072-4.976-.059-.947-.261-1.611-.558-2.197-.31-.611-.717-1.13-1.236-1.65C19.455 2.676 18.936 2.27 18.326 1.96c-.586-.297-1.25-.499-2.197-.558C15.181.013 14.774 0 11.153 0h.864zm-.081 1.802c.359 0 .683.006 1.009.016 3.462.156 5.212 1.917 5.368 5.368.01.326.016.65.016 1.009v6.61c0 .359-.006.683-.016 1.009-.156 3.451-1.906 5.212-5.368 5.368-.326.01-.65.016-1.009.016h-6.61c-.359 0-.683-.006-1.009-.016-3.462-.156-5.212-1.917-5.368-5.368-.01-.326-.016-.65-.016-1.009v-6.61c0-.359.006-.683.016-1.009.156-3.451 1.906-5.212 5.368-5.368.326-.01.65-.016 1.009-.016h6.61z" clipRule="evenodd" />
  //       </svg>
  //     ),
  //   },
  //   {
  //     name: 'Twitter',
  //     href: '#',
  //     icon: (props) => (
  //       <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
  //         <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  //       </svg>
  //     ),
  //   },
  // ];

  return (
    <footer className={`transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
      <div className="mx-auto max-w-7xl overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 xl:py-24">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12 xl:gap-16">
          {/* Brand Section - Full width on mobile, 1/3 on large screens */}
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            <Link 
              to="/" 
              className={`inline-block text-xl sm:text-2xl font-bold transition-colors duration-300 hover:scale-105 ${darkMode ? 'text-white hover:text-gray-100' : 'text-gray-900 hover:text-gray-700'}`}
            >
              <span className="block sm:hidden">CBC</span>
              <span className="hidden sm:block lg:hidden">CodeByCisse</span>
              <span className="hidden lg:block">CodeByCisse-Commerce</span>
            </Link>
            <p className={`text-sm sm:text-base leading-6 max-w-md transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              A modern eCommerce platform showcasing quality products with seamless shopping experience
            </p>
            {/* Social Media Section - Uncomment when needed */}
            {/* <div className="flex space-x-4 sm:space-x-6">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`transition-all duration-300 hover:scale-110 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-300' 
                      : 'text-gray-500 hover:text-gray-600'
                  }`}
                  aria-label={item.name}
                >
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </a>
              ))}
            </div> */}
          </div>
          
          {/* Navigation Section - Responsive grid */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-2 lg:gap-12">
            {/* Shop Links */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className={`text-sm sm:text-base font-semibold leading-6 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Shop
              </h3>
              <ul role="list" className="space-y-3 sm:space-y-4">
                {navigation.shop.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`text-sm sm:text-base leading-6 transition-all duration-300 hover:scale-105 inline-block ${darkMode
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Navigation Sections - Uncomment when needed */}
            {/* Company Links */}
            {/* <div className="space-y-4 sm:space-y-6">
              <h3 className={`text-sm sm:text-base font-semibold leading-6 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Company
              </h3>
              <ul role="list" className="space-y-3 sm:space-y-4">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.href} 
                      className={`text-sm sm:text-base leading-6 transition-all duration-300 hover:scale-105 inline-block ${
                        darkMode 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div> */}

            {/* Support Links */}
            {/* <div className="space-y-4 sm:space-y-6">
              <h3 className={`text-sm sm:text-base font-semibold leading-6 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Support
              </h3>
              <ul role="list" className="space-y-3 sm:space-y-4">
                {navigation.support.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.href} 
                      className={`text-sm sm:text-base leading-6 transition-all duration-300 hover:scale-105 inline-block ${
                        darkMode 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div> */}

            {/* Legal Links */}
            {/* <div className="space-y-4 sm:space-y-6">
              <h3 className={`text-sm sm:text-base font-semibold leading-6 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Legal
              </h3>
              <ul role="list" className="space-y-3 sm:space-y-4">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.href} 
                      className={`text-sm sm:text-base leading-6 transition-all duration-300 hover:scale-105 inline-block ${
                        darkMode 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div> */}

            {/* Placeholder for when you add more sections */}
            <div className="hidden sm:block lg:hidden">
              {/* This creates proper spacing when you have an odd number of columns */}
            </div>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className={`mt-8 sm:mt-12 lg:mt-16 xl:mt-20 border-t pt-6 sm:pt-8 transition-colors duration-300 ${darkMode ? 'border-gray-400/10' : 'border-gray-300/30'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className={`text-xs sm:text-sm leading-5 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              &copy; 2025 CodeByCisse. All rights reserved.
            </p>
            
            {/* Additional footer info - uncomment if needed */}
            {/* <div className="flex flex-wrap gap-4 sm:gap-6">
              <Link 
                to="/privacy" 
                className={`text-xs sm:text-sm transition-all duration-300 hover:scale-105 ${
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                }`}
              >
                Privacy
              </Link>
              <Link 
                to="/terms" 
                className={`text-xs sm:text-sm transition-all duration-300 hover:scale-105 ${
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                }`}
              >
                Terms
              </Link>
              <Link 
                to="/cookies" 
                className={`text-xs sm:text-sm transition-all duration-300 hover:scale-105 ${
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                }`}
              >
                Cookies
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;