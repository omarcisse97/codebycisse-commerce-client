// components/modals/RegionModal.jsx
import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import ReactCountryFlag from "react-country-flag"

const RegionModal = () => {
  const { region, regions, setRegion, darkMode } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState(null);

  const isOpen = !region; // Modal is open when no region is selected

  const handleSelectRegion = (regionData) => {
    setSelectedRegion(regionData);
  };

  const handleConfirm = () => {
    if (selectedRegion) {
      setRegion(selectedRegion);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => { }} // Prevent closing without selection
      className="relative z-50"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 lg:p-6">
        <DialogPanel className={`w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg sm:rounded-xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] lg:max-h-[85vh] flex flex-col mx-auto`}>
          
          {/* Header Section */}
          <div className="p-4 sm:p-6 lg:p-8 flex-shrink-0">
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} mb-3 sm:mb-4`}>
                <GlobeAltIcon className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-base sm:text-lg lg:text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Your Region
              </h3>
              <p className={`mt-2 text-xs sm:text-sm lg:text-base leading-relaxed max-w-sm mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Choose your region to see relevant products, pricing, and shipping options.
              </p>
            </div>
          </div>

          {/* Scrollable Region Options */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {regions.map((regionOption) => (
                <button
                  key={regionOption.flag}
                  onClick={() => handleSelectRegion(regionOption)}
                  className={`w-full text-left p-3 sm:p-4 lg:p-5 border rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${selectedRegion?.flag === regionOption.flag
                      ? `border-blue-500 ${darkMode ? 'bg-blue-900/20 border-blue-400 shadow-lg shadow-blue-500/20' : 'bg-blue-50 shadow-lg shadow-blue-500/10'}`
                      : `${darkMode ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`
                    }`}
                  style={{ cursor: "pointer"}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      {/* Country Flag */}
                      <div className="flex-shrink-0">
                        <span className="text-xl sm:text-2xl lg:text-3xl">
                          {regionOption?.flag !== 'N/A' && (
                            <ReactCountryFlag 
                              countryCode={regionOption.flag} 
                              svg 
                              style={{
                                width: '1.5em',
                                height: '1.5em',
                              }}
                            />
                          )}
                        </span>
                      </div>
                      
                      {/* Region Info */}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm sm:text-base lg:text-lg font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {regionOption.name}
                        </p>
                        <p className={`text-xs sm:text-sm lg:text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Currency: {regionOption.currency}
                        </p>
                      </div>
                    </div>
                    
                    {/* Selection Indicator */}
                    {selectedRegion?.flag === regionOption.flag && (
                      <div className="flex-shrink-0">
                        <div className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3 rounded-full bg-white"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className={`p-4 sm:p-6 lg:p-8 flex-shrink-0 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={!selectedRegion}
              className={`w-full py-3 sm:py-4 lg:py-5 px-4 sm:px-6 lg:px-8 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base lg:text-lg transition-all duration-200 ${selectedRegion
                  ? `${darkMode 
                      ? 'bg-white text-black hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] shadow-lg' 
                      : 'bg-black hover:bg-gray-800 text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg'
                    }`
                  : `${darkMode 
                      ? 'bg-gray-700 text-gray-500 border border-gray-600' 
                      : 'bg-gray-200 text-gray-400 border border-gray-300'
                    } cursor-not-allowed`
                }`}
              style={{ cursor: selectedRegion ? "pointer" : "not-allowed"}}
            >
              Continue to Store
            </button>

            {/* Info Text */}
            <p className={`mt-3 sm:mt-4 lg:mt-5 text-xs sm:text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              You can change your region later in the settings.
            </p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default RegionModal;