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
    console.log('Region set up. Will try to create cart below');
    try {
      await initMedusaCart({ region_id: newRegion?.code });
      console.log('Confirmed cart :)');
      onClose();
      // window.location.reload();
    } catch (error) {
      console.log('Cart could not get created. Please check the logs -> ', error);
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
        className={`fixed inset-0 transition-opacity ${darkMode
            ? 'bg-gray-900 bg-opacity-75'
            : 'bg-gray-100 bg-opacity-75'
          }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-4">
        <div className={`relative rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-lg mx-4 ${darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
          {/* Header */}
          <div className={`flex items-start justify-between p-4 sm:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <div className="flex-1 pr-4">
              <h2 className={`text-lg sm:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                Change Region
              </h2>
              <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                Currently: <span className="font-medium">{region?.name || 'United States'}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className={`transition-colors p-1 flex-shrink-0 ${darkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              aria-label="Close modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <p className={`text-xs sm:text-sm mb-4 sm:mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
              Select a region to update product availability, pricing, and shipping options.
              The page will refresh to apply your changes.
            </p>

            {/* Regions Grid */}
            <div className="grid grid-cols-1 gap-2 sm:gap-3 max-h-64 sm:max-h-80 overflow-y-auto">
              {regions.map((regionOption) => (
                <button
                  key={`${regionOption.code}-${regionOption.name}`}
                  onClick={() => handleRegionChange(regionOption)}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${region?.flag === regionOption.flag
                      ? darkMode
                        ? 'border-blue-400 bg-blue-900/30 ring-1 sm:ring-2 ring-blue-400 ring-opacity-30'
                        : 'border-blue-500 bg-blue-50 ring-1 sm:ring-2 ring-blue-500 ring-opacity-20'
                      : darkMode
                        ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <span className="text-lg sm:text-2xl mr-3 flex-shrink-0">{regionOption.flag}</span>
                    <div className="text-left min-w-0">
                      <div className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                        {regionOption.name}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {regionOption.currency}
                      </div>
                    </div>
                  </div>

                  {region?.flag === regionOption.flag && (
                    <CheckIcon className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ml-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className={`px-6 py-4 border-t rounded-b-lg ${darkMode
              ? 'border-gray-700 bg-gray-900'
              : 'border-gray-200 bg-gray-50'
            }`}>
            <div className="flex items-center justify-between">
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                ⚠️ Changing region will refresh the app and remove all cart items
              </p>
              <button
                onClick={handleCancel}
                className={`px-4 py-2 text-sm font-medium transition-colors ${darkMode
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-700 hover:text-gray-900'
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