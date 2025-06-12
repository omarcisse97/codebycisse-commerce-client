// components/common/RegionModalPost.jsx
import React from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const RegionModalPost = ({ isOpen, onClose }) => {
  const { region, setRegion, regions, darkMode } = useAuth();
  const { initMedusaCart } = useCart();

  const handleRegionChange = async (newRegion) => {
    setRegion(newRegion);
    
    try {
      await initMedusaCart({ region_id: newRegion?.code });
      
      onClose();
      // window.location.reload();
    } catch (error) {
      console.error('Error changing region:', error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 transition-opacity backdrop-blur-sm ${darkMode
            ? 'bg-gray-900 bg-opacity-75'
            : 'bg-gray-100 bg-opacity-75'
          }`}
        onClick={onClose}
      />

      {/* Modal Container - Mobile first approach */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-3 sm:p-4 lg:p-6">
        <div className={`relative rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl transform transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          
          {/* Header */}
          <div className={`flex items-start justify-between p-4 sm:p-5 lg:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex-1 pr-3 sm:pr-4 min-w-0">
              <h2 className={`text-base sm:text-lg lg:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Change Region
              </h2>
              <p className={`text-xs sm:text-sm lg:text-base mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Currently: <span className="font-medium">{region?.name || 'United States'}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className={`transition-all duration-200 p-1.5 sm:p-2 flex-shrink-0 rounded-lg hover:scale-110 active:scale-95 ${darkMode
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 lg:p-6">
            <p className={`text-xs sm:text-sm lg:text-base mb-4 sm:mb-5 lg:mb-6 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Select a region to update product availability, pricing, and shipping options.
              <span className="block sm:inline sm:ml-1 mt-1 sm:mt-0">
                The page will refresh to apply your changes.
              </span>
            </p>

            {/* Regions Grid - Responsive height and scrolling */}
            <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 md:max-h-72 lg:max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              {regions.map((regionOption) => (
                <button
                  key={`${regionOption.code}-${regionOption.name}`}
                  onClick={() => handleRegionChange(regionOption)}
                  className={`flex items-center justify-between w-full p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    region?.flag === regionOption.flag
                      ? darkMode
                        ? 'border-blue-400 bg-blue-900/30 ring-1 sm:ring-2 ring-blue-400 ring-opacity-30 shadow-lg shadow-blue-500/20 focus:ring-blue-400'
                        : 'border-blue-500 bg-blue-50 ring-1 sm:ring-2 ring-blue-500 ring-opacity-20 shadow-lg shadow-blue-500/10 focus:ring-blue-500'
                      : darkMode
                        ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700 focus:ring-gray-400'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:ring-gray-300'
                  }`}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    {/* Flag */}
                    <span className="text-lg sm:text-xl lg:text-2xl mr-3 sm:mr-4 flex-shrink-0">
                      {regionOption.flag}
                    </span>
                    
                    {/* Region Info */}
                    <div className="text-left min-w-0 flex-1">
                      <div className={`font-medium text-sm sm:text-base lg:text-lg truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {regionOption.name}
                      </div>
                      <div className={`text-xs sm:text-sm lg:text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {regionOption.currency}
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {region?.flag === regionOption.flag && (
                    <CheckIcon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 flex-shrink-0 ml-2 sm:ml-3 transition-transform duration-200 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={`px-4 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 border-t rounded-b-2xl ${darkMode
              ? 'border-gray-700 bg-gray-900'
              : 'border-gray-200 bg-gray-50'
            }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              {/* Warning Text */}
              <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
                <span className="text-sm sm:text-base flex-shrink-0">⚠️</span>
                <p className={`text-xs sm:text-sm lg:text-base leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="block sm:inline">Changing region will refresh the app</span>
                  <span className="block sm:inline sm:ml-1">and remove all cart items</span>
                </p>
              </div>
              
              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-xs sm:text-sm lg:text-base font-medium transition-all duration-200 rounded-lg hover:scale-105 active:scale-95 flex-shrink-0 ${darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
                  }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionModalPost;