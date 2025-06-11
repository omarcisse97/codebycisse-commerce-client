// components/search/SearchModal.jsx
import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../../contexts/SearchContext';
import { useAuth } from '../../contexts/AuthContext';


const SearchModal = () => {
  const {
    searchQuery,
    searchResults,
    isSearching,
    isSearchOpen,
    handleSearchChange,
    closeSearch,
    searchResultsMedusa
  } = useSearch();
  const { region, darkMode } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const formatPrice = (amount, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount / 100);
  };

  return (
    <Dialog open={isSearchOpen} onClose={closeSearch} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 flex items-start justify-center p-4 pt-16">
        <DialogPanel className="w-full max-w-2xl bg-white rounded-lg shadow-2xl">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 px-4 py-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value, region?.code)}
              className="flex-1 border-0 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
              inputMode="search"    
              autoComplete="off"     
              enterKeyHint="search"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  closeSearch();
                  navigate(`/search?q=${searchQuery}`);
                }
              }}
            />
            <button
              onClick={closeSearch}
              className="ml-3 p-1 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : searchQuery && searchResultsMedusa.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No products found for "{searchQuery}"
              </div>
            ) : searchResultsMedusa.length > 0 ? (
              <div className="p-2">
                {searchResultsMedusa.map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product._handle}`}
                    onClick={closeSearch}
                    className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <img
                      src={product._thumbnail}
                      alt={product._title}
                      className="h-12 w-12 object-cover rounded-md mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {product._title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {product?.getVariantFormattedPriceByIndex(0)}

                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : searchQuery === '' ? (
              <div className="px-4 py-8 text-center text-gray-500">
                Start typing to search products...
              </div>
            ) : null}
          </div>

          {/* Quick Actions */}
          {!searchQuery && (
            <div className="border-t border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/search`}
                  onClick={closeSearch}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  Search All Products
                </Link>
                <Link
                  to="/"
                  onClick={closeSearch}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  Browse Products
                </Link>
                <Link
                  to="/categories"
                  onClick={closeSearch}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  Browse Categories
                </Link>
              </div>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default SearchModal;