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
      <DialogBackdrop className="fixed inset-0 bg-black/50" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className={`w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl max-h-[90vh] flex flex-col`}>
          <div className="p-6 flex-shrink-0">
            {/* Header */}
            <div className="text-center mb-6">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} mb-4`}>
                <GlobeAltIcon className={`h-6 w-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Your Region
              </h3>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Choose your region to see relevant products, pricing, and shipping options.
              </p>
            </div>
          </div>

          {/* Scrollable Region Options */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-3 mb-6">
              {regions.map((regionOption) => (
                <button
                  key={regionOption.flag}
                  onClick={() => handleSelectRegion(regionOption)}
                  className={`w-full text-left p-4 border rounded-lg transition-all ${selectedRegion?.flag === regionOption.flag
                      ? `border-blue-500 ${darkMode ? 'bg-blue-900/20 border-blue-400' : 'bg-blue-50'}`
                      : `${darkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`
                    }`}
                  style={{ cursor: "pointer"}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{regionOption?.flag !== 'N/A' && <ReactCountryFlag countryCode={regionOption.flag} svg />}</span>
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {regionOption.name}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Currency: {regionOption.currency}
                        </p>
                      </div>
                    </div>
                    {selectedRegion?.flag === regionOption.flag && (
                      <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className={`p-6 flex-shrink-0 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={!selectedRegion}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${selectedRegion
                  ? `${darkMode ? 'bg-white text-black hover:bg-gray-100' : 'bg-black hover:bg-gray-800 text-white'}`
                  : `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                }`}
              style={{ cursor: "pointer"}}
            >
              Continue to Store
            </button>

            {/* Info Text */}
            <p className={`mt-4 text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              You can change your region later in the settings.
            </p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default RegionModal;