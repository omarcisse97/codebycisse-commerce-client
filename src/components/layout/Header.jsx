// components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ShoppingBagIcon, Bars3Icon, XMarkIcon, UserIcon, ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { useSearch } from '../../contexts/SearchContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../contexts/CategoryContext';
import SearchModal from '../search/SearchModal';
import CartDrawer from '../cart/CartDrawer';
import LoginModal from '../auth/LoginModal';
import RegisterModal from '../auth/RegisterModal';
import RegionModalPost from '../common/RegionModalPost';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);

  const { categories_ } = useCategories();
  const { getCartItemsCount, initMedusaCart } = useCart();
  const { openSearch } = useSearch();
  const { user, isAuthenticated, logout, region, logoutMedusa, darkMode } = useAuth();
  const navigate = useNavigate();

  const cartItemsCount = getCartItemsCount();
  const displayedCategories = categories_?.slice(0, 5);
  const hasMoreCategories = categories_?.length > 5;

  // Close mobile menu on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsCategoriesOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSwitchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logoutMedusa();
      if (localStorage.getItem('medusa_cart_id')) {
        localStorage.removeItem('medusa_cart_id');
      }
      await initMedusaCart({ region_id: region?.code });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsUserMenuOpen(false);
  };

  const handleAccountClick = () => {
    navigate('/account');
    setIsUserMenuOpen(false);
  };

  const handleCategoryClick = (href) => {
    navigate(href);
    setIsCategoriesOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleViewAllCategories = () => {
    navigate('/categories');
    setIsCategoriesOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`border-b sticky top-0 z-40 transition-colors ${darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
        }`}>
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo - Responsive sizing */}
            <div className="flex items-center min-w-0 flex-shrink-0">
              <Link 
                to="/" 
                className={`text-base sm:text-lg lg:text-xl font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}
                title="CodeByCisse-Commerce"
              >
                <span className="block sm:hidden">CBC</span>
                <span className="hidden sm:block lg:hidden">CodeByCisse</span>
                <span className="hidden lg:block">CodeByCisse-Commerce</span>
              </Link>
            </div>

            {/* Desktop Navigation - Hidden on mobile and tablet */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium transition-colors hover:scale-105 ${darkMode
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-700 hover:text-gray-900'
                  }`}
              >
                Home
              </Link>

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  onMouseEnter={() => setIsCategoriesOpen(true)}
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors hover:scale-105 ${darkMode
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-700 hover:text-gray-900'
                    }`}
                >
                  Categories
                  <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoriesOpen && categories_ && (
                  <div 
                    className={`absolute left-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                  >
                    <div className="py-1">
                      {displayedCategories.map((category) => (
                        <button
                          key={category.name}
                          onClick={() => handleCategoryClick(category.href)}
                          className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:scale-105 ${darkMode
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                          {category.name}
                        </button>
                      ))}
                      {hasMoreCategories && (
                        <>
                          <hr className={`my-1 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`} />
                          <button
                            onClick={handleViewAllCategories}
                            className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:scale-105 ${darkMode
                                ? 'text-blue-400 hover:bg-gray-700'
                                : 'text-blue-600 hover:bg-gray-100'
                              }`}
                          >
                            View All Categories
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Right side icons - Responsive spacing and sizing */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              {/* Region Selector Button - Hidden on small screens */}
              <button
                onClick={() => setIsRegionModalOpen(true)}
                className={`hidden sm:flex items-center p-2 transition-colors hover:scale-105 ${darkMode
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-700 hover:text-gray-900'
                  }`}
                aria-label="Select region"
              >
                <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                <span className="hidden md:block text-xs lg:text-sm">{region?.name || 'US'}</span>
              </button>

              {/* Search */}
              <button
                onClick={openSearch}
                className={`p-1.5 sm:p-2 transition-colors hover:scale-105 ${darkMode
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-700 hover:text-gray-900'
                  }`}
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* User Account */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 transition-colors hover:scale-105 ${darkMode
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-700 hover:text-gray-900'
                      }`}
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.first_name}
                        className="h-5 w-5 sm:h-6 sm:w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-xs font-medium ${darkMode
                          ? 'bg-gray-600 text-white'
                          : 'bg-gray-300 text-gray-700'
                        }`}>
                        {((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="hidden md:block text-xs lg:text-sm truncate max-w-20">
                      {user.first_name}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className={`absolute right-0 mt-2 w-44 sm:w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="py-1">
                        <button
                          onClick={handleAccountClick}
                          className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:scale-105 ${darkMode
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          Account Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className={`block w-full text-left px-4 py-2 text-sm transition-colors hover:scale-105 ${darkMode
                              ? 'text-gray-300 hover:bg-gray-700'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className={`p-1.5 sm:p-2 transition-colors hover:scale-105 ${darkMode
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-700 hover:text-gray-900'
                    }`}
                  aria-label="Account"
                >
                  <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative p-1.5 sm:p-2 transition-colors hover:scale-105 ${darkMode
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-700 hover:text-gray-900'
                  }`}
                aria-label="Shopping cart"
              >
                <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                {cartItemsCount > 0 && (
                  <span className={`absolute -top-1 -right-1 text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium ${darkMode
                      ? 'bg-white text-black'
                      : 'bg-black text-white'
                    }`}>
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-1.5 sm:p-2 transition-colors hover:scale-105 ${darkMode
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-700 hover:text-gray-900'
                  }`}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Enhanced responsive design */}
          {isMobileMenuOpen && (
            <div className={`lg:hidden border-t py-3 sm:py-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <nav className="flex flex-col space-y-1">
                <Link
                  to="/"
                  className={`px-3 py-2 text-base font-medium transition-colors hover:scale-105 ${darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>

                {/* Mobile Categories */}
                <div className="px-3 py-2">
                  <div className={`text-base font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Categories
                  </div>
                  <div className="space-y-1">
                    {displayedCategories?.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category.href)}
                        className={`block w-full text-left pl-4 py-1.5 transition-colors rounded hover:scale-105 ${darkMode
                            ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        {category.name}
                      </button>
                    ))}
                    {hasMoreCategories && (
                      <button
                        onClick={handleViewAllCategories}
                        className={`block w-full text-left pl-4 py-1.5 font-medium transition-colors rounded hover:scale-105 ${darkMode 
                            ? 'text-blue-400 hover:bg-gray-700' 
                            : 'text-blue-600 hover:bg-gray-50'
                          }`}
                      >
                        View All Categories
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Region Selector */}
                <div className={`px-3 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => {
                      setIsRegionModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center w-full text-left text-base font-medium py-2 transition-colors rounded hover:scale-105 ${darkMode 
                        ? 'text-white hover:bg-gray-700' 
                        : 'text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <GlobeAltIcon className="h-5 w-5 mr-2" />
                    Region ({region?.name || 'US'})
                  </button>
                </div>

                {/* Mobile Auth Links */}
                {!isAuthenticated ? (
                  <div className={`pt-3 border-t space-y-1 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => {
                        setIsLoginOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors rounded hover:scale-105 ${darkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setIsRegisterOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors rounded hover:scale-105 ${darkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className={`pt-3 border-t space-y-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center px-3 py-2">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.first_name}
                          className="h-8 w-8 rounded-full object-cover mr-3 flex-shrink-0"
                        />
                      ) : (
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0 ${darkMode
                            ? 'bg-gray-600 text-white'
                            : 'bg-gray-300 text-gray-700'
                          }`}>
                          {((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || 'U'}
                        </div>
                      )}
                      <span className={`text-base font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.first_name} {user.last_name}
                      </span>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2 text-base font-medium transition-colors rounded hover:scale-105 ${darkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      Account Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-base font-medium transition-colors rounded hover:scale-105 ${darkMode
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>

        {/* Backdrop for dropdowns */}
        {(isUserMenuOpen || isCategoriesOpen) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsUserMenuOpen(false);
              setIsCategoriesOpen(false);
            }}
          />
        )}
      </header>

      {/* Search Modal */}
      <SearchModal />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Region Modal */}
      <RegionModalPost
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
      />

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
};

export default Header;