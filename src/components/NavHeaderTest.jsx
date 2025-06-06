import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, MapPin, Menu } from 'lucide-react';

// Mock client for demonstration
const mockMedusaClient = {
  store: {
    region: {
      list: async () => ({
        regions: [
          { id: 'us', name: 'United States' },
          { id: 'eu', name: 'Europe' },
          { id: 'ca', name: 'Canada' }
        ]
      }),
      retrieve: async (id) => ({
        region: { id, name: id === 'us' ? 'United States' : id === 'eu' ? 'Europe' : 'Canada' }
      })
    }
  }
};

function SearchBar({ searchTerm, setSearchTerm, onSearch }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex-1 max-w-md mx-4">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search products..."
          className="w-full px-4 py-2 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <button
          onClick={onSearch}
          className="absolute right-2 top-1.5 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );
}

export default function NavHeader({ regionid, onRegionSelect }) {
  const [cartCount, setCartCount] = useState(3); // Demo cart count
  const [regions, setRegions] = useState([]);
  const [region, setRegion] = useState({});
  const [currentRegionId, setCurrentRegionId] = useState(regionid || 'us');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  useEffect(() => {
    const loadRegions = async () => {
      const res = await mockMedusaClient.store.region.list();
      setRegions(res.regions);
    };

    loadRegions();
  }, []);

  useEffect(() => {
    const getRegion = async () => {
      if (currentRegionId) {
        const res = await mockMedusaClient.store.region.retrieve(currentRegionId);
        setRegion(res.region);
      }
    };

    getRegion();
  }, [currentRegionId]);

  useEffect(() => {
    if (regionid && regionid !== currentRegionId) {
      setCurrentRegionId(regionid);
    }
  }, [regionid]);

  const handleRegionSelect = (regionId) => {
    setCurrentRegionId(regionId);
    setIsRegionDropdownOpen(false);
    if (onRegionSelect) {
      onRegionSelect(regionId);
    }
  };

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
    // Navigate to search results
    setSearchTerm('');
  };

  const addToCart = () => {
    setCartCount(prev => prev + 1);
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button className="text-2xl font-bold text-white hover:text-gray-200 transition-colors">
              CodeByCisse
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            <button className="text-white hover:text-gray-200 font-semibold transition-colors">
              Products
            </button>

            {/* Region Selector */}
            <div className="relative">
              <button
                onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span>{region?.name || "Loading..."}</span>
                <svg className={`h-4 w-4 transition-transform ${isRegionDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isRegionDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <div className="py-1">
                    {regions.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleRegionSelect(r.id)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-md">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearch}
            />
          </div>

          {/* Cart Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={addToCart}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-white text-green-600 px-2 py-1 rounded-full text-sm font-semibold min-w-[24px] text-center">
                {cartCount}
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700">
            <div className="px-2 pt-4 pb-3 space-y-3">
              <button className="block text-white hover:text-gray-200 font-semibold">
                Products
              </button>
              
              <div className="space-y-2">
                <div className="text-gray-300 text-sm font-medium">Region:</div>
                {regions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleRegionSelect(r.id)}
                    className={`block text-left w-full px-3 py-1 rounded ${
                      currentRegionId === r.id ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>

              <div className="pt-4">
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onSearch={handleSearch}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}