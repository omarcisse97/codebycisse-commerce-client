// pages/AccountPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  UserIcon,
  CogIcon,
  MapPinIcon,
  BellIcon,
  ShoppingBagIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import ProfileSettings from '../components/account/ProfileSettings';
import GeneralSettings from '../components/account/GeneralSettings';
import AddressSettings from '../components/account/AddressSettings';
import { medusaClient } from '../utils/client';

const AccountPage = () => {
  const { user, isAuthenticated, logout, darkMode, logoutMedusa } = useAuth();
  const [enhancedUser, setEnhancedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
    { id: 'address', name: 'Address', icon: MapPinIcon },
  ];

  // Generate initials for avatar (consistent with Header and ProfileSettings)
  const getInitials = () => {
    const first_name = user.first_name || '';
    const last_name = user.last_name || '';
    
    return ((first_name?.[0] || '') + (last_name?.[0] || '')).toUpperCase() || 'U';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'settings':
        return <GeneralSettings />;
      case 'address':
        return <AddressSettings />;
      default:
        return <ProfileSettings />;
    }
  };
  console.log('User Profile -> ', user);
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className={`flex items-center space-x-2 text-sm mb-8 transition-colors duration-300 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Link
            to="/"
            className={`transition-colors duration-300 ${
              darkMode ? 'hover:text-gray-300' : 'hover:text-gray-700'
            }`}
          >
            Home
          </Link>
          <ChevronLeftIcon className="h-4 w-4 rotate-180" />
          <span className={`transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Account
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow-sm p-6 transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-6">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white text-lg font-semibold ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-400'
                  }`}>
                    {getInitials()}
                  </div>
                )}
                <div>
                  <h3 className={`text-lg font-medium transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className={`text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
                        activeTab === tab.id
                          ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                          : darkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Actions */}
              <div className={`mt-8 pt-6 border-t transition-colors duration-300 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h4 className={`text-sm font-medium mb-3 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <Link
                    to="/cart"
                    className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors duration-300 ${
                      darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    <span>View Cart</span>
                  </Link>
                </div>
              </div>

              {/* Logout */}
              <div className={`mt-8 pt-6 border-t transition-colors duration-300 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <button
                  onClick={logoutMedusa}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors duration-300 ${
                    darkMode
                      ? 'text-red-400 hover:bg-red-900/20'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className={`rounded-lg shadow-sm transition-colors duration-300 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {/* Tab Header */}
              <div className={`px-6 py-4 border-b transition-colors duration-300 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-xl font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </h2>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;