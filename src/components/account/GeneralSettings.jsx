// components/account/GeneralSettings.jsx
import React, { useState } from 'react';
import {
  MoonIcon,
  SunIcon,
  GlobeAltIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const GeneralSettings = () => {
  const { user, updateProfile, darkMode, toggleDarkMode, region, regions, setRegion, loading } = useAuth();
  const [preferences, setPreferences] = useState({
    newsletter: user.preferences?.newsletter || false,
    marketing: user.preferences?.marketing || false,
    orderUpdates: user.preferences?.orderUpdates !== false, // default true
    promotions: user.preferences?.promotions || false
  });
  const [selectedRegion, setSelectedRegion] = useState(region?.code || 'US');

  const handlePreferenceChange = async (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      await updateProfile({
        preferences: {
          ...user.preferences,
          [key]: value
        }
      });
    } catch (error) {
      // Revert on error
      setPreferences(preferences);
    }
  };

  const handleRegionChange = (regionCode) => {
    setSelectedRegion(regionCode);
    const newRegion = regions.find(r => r.code === regionCode);
    if (newRegion) {
      setRegion(newRegion);
    }
  };

  const settingsSections = [
    {
      title: 'Appearance',
      description: 'Customize how the interface looks and feels',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          description: 'Toggle between light and dark themes',
          type: 'toggle',
          value: darkMode,
          onChange: toggleDarkMode,
          icon: darkMode ? MoonIcon : SunIcon
        }
      ]
    },

  ];

  const ToggleSwitch = ({ checked, onChange, disabled = false, darkMode }) => (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode
          ? 'focus:ring-white'
          : 'focus:ring-black'
        } ${checked
          ? darkMode ? 'bg-white' : 'bg-black'
          : darkMode ? 'bg-gray-600' : 'bg-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full transition-all duration-300 ${darkMode
            ? checked ? 'bg-black' : 'bg-white'
            : checked ? 'bg-white' : 'bg-gray-400'
          } ${checked ? 'translate-x-6' : 'translate-x-1'
          }`}
      />
    </button>
  );

  return (
  <div className="space-y-8">
    {settingsSections.map((section) => (
      <div key={section.title}>
        <div className="mb-4">
          <h3 className={`text-lg font-medium transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {section.title}
          </h3>
          <p className={`text-sm transition-colors duration-300 ${
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {section.description}
          </p>
        </div>

        <div className="space-y-4">
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Icon className={`h-5 w-5 mt-0.5 transition-colors duration-300 ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm transition-colors duration-300 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {item.type === 'toggle' && (
                    <ToggleSwitch
                      checked={item.value}
                      onChange={item.onChange}
                      disabled={loading}
                      darkMode={darkMode}
                    />
                  )}

                  {item.type === 'select' && (
                    <select
                      value={item.value}
                      onChange={(e) => item.onChange(e.target.value)}
                      disabled={loading}
                      className={`text-sm border rounded-md px-3 py-1 focus:outline-none focus:ring-2 transition-colors duration-300 ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-800 text-white focus:ring-white' 
                          : 'border-gray-300 bg-white text-gray-900 focus:ring-black'
                      }`}
                    >
                      {item.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ))}

    {/* Save Notice */}
    <div className={`border rounded-lg p-4 transition-colors duration-300 ${
      darkMode 
        ? 'bg-blue-900/20 border-blue-800' 
        : 'bg-blue-50 border-blue-200'
    }`}>
      <p className={`text-sm transition-colors duration-300 ${
        darkMode ? 'text-blue-300' : 'text-blue-700'
      }`}>
        💡 Your preferences are automatically saved when you make changes.
      </p>
    </div>
  </div>
);
};

export default GeneralSettings;