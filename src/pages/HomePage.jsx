import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, FunnelIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../contexts/SearchContext';
import { useAuth } from '../contexts/AuthContext';
import ProductGrid from '../components/product/ProductGrid';
import { medusaClient } from '../utils/client';
import { useCategories } from '../contexts/CategoryContext';
import { MedusaProduct } from '../models/store/MedusaProduct';

function getPriceOptions(currency) {
  const exchangeRates = {
    USD: 1,
    EUR: 0.92,
    XOF: 600
  };

  const rate = exchangeRates[currency?.toUpperCase()] || 1;

  // Base amounts in USD cents
  const baseUnderAmount = 2500; // $25
  const baseLowerMid = 2500;    // $25
  const baseUpperMid = 5000;    // $50
  const baseOverAmount = 5000;  // $50

  // Convert to selected currency's lowest denomination
  const underAmount = Math.round(baseUnderAmount * rate);
  const lowerMid = Math.round(baseLowerMid * rate);
  const upperMid = Math.round(baseUpperMid * rate);
  const overAmount = Math.round(baseOverAmount * rate);

  return [
    { value: 'all', label: 'All Prices' },
    {
      value: `under-${underAmount}`,
      label: `Under ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
      }).format(underAmount / 100)}`
    },
    {
      value: `${lowerMid}-${upperMid}`,
      label: `${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
      }).format(lowerMid / 100)} - ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
      }).format(upperMid / 100)}`
    },
    {
      value: `over-${overAmount}`,
      label: `Over ${new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
      }).format(overAmount / 100)}`
    }
  ];
}

const HomePage = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { darkMode, region } = useAuth();
  const { categories_ } = useCategories();

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('none');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentCategoryProductCount, setCurrentCategoryProductCount] = useState('Searching...');
  const [priceOptions, setPriceOptions] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Memoized category name
  const categoryNameMedusa = useMemo(() => 
    !handle ? 'All Products' : `${handle[0]?.toUpperCase()}${handle?.substring(1)}`,
    [handle]
  );

  // Memoized categories
  const categoriesMedusa = useMemo(() => {
    if (categories_ && categories_.length > 0) {
      return categories_;
    }
    return [];
  }, [categories_]);

  // Update price options when region changes
  useEffect(() => {
    if (region?.currency) {
      setPriceOptions(getPriceOptions(region.currency));
    }
  }, [region]);

  // Set selected category based on URL handle
  useEffect(() => {
    if (!handle) {
      const allCategory = categoriesMedusa.find(cat => cat.value === 'all');
      setSelectedCategory(allCategory || null);
    } else if (categoriesMedusa.length) {
      const found = categoriesMedusa.find(cat => cat.handle === handle);
      if (found) {
        setSelectedCategory(found);
      } else {
        console.warn(`Category with handle "${handle}" not found.`);
        navigate('/');
      }
    }
  }, [categoriesMedusa, handle, navigate]);

  // Build query parameters for API
  const buildQuery = useMemo(() => {
    const query = {
      region_id: region?.code,
      limit: productsPerPage,
      offset: (currentPage - 1) * productsPerPage,
      fields: '*categories'
    };

    // Add category filter if not "all"
    if (selectedCategory && selectedCategory.value !== 'all' && selectedCategory.id) {
      query.category_id = selectedCategory.id;
    }

    // Add price range filter at API level if possible
    if (priceRange !== 'all') {
      // Note: Medusa might not support price filtering directly
      // This would need to be implemented based on your Medusa version
      // For now, we'll filter after fetching
    }

    // Add sorting
    if (sortBy !== 'none') {
      switch (sortBy) {
        case 'price':
          query.order = 'variants.prices.amount';
          break;
        case '-price':
          query.order = '-variants.prices.amount';
          break;
        case 'title':
          query.order = 'title';
          break;
        case '-title':
          query.order = '-title';
          break;
      }
    }

    return query;
  }, [region, selectedCategory, currentPage, productsPerPage, sortBy, priceRange]);

  // Optimized product fetching
  useEffect(() => {
    const fetchProducts = async () => {
      if (!region || !selectedCategory) return;

      setLoading(true);
      setCurrentCategoryProductCount("Searching...");

      try {
        // Single API call with pagination and filtering
        const { products: fetchedProducts, count } = await medusaClient.store.product?.list(buildQuery);

        // Convert to MedusaProduct instances only for displayed products
        const medusaProducts = fetchedProducts.map(product => 
          new MedusaProduct(
            product.id,
            product.title,
            product.handle,
            product.thumbnail,
            [...product.variants],
            [...product.categories],
            product.description,
            [...product.images]
          )
        );

        // Apply client-side price filtering if needed (since Medusa might not support it)
        let filteredProducts = medusaProducts;
        if (priceRange !== 'all') {
          filteredProducts = medusaProducts.filter(product => {
            const priceAmount = product.getVariantFormattedPriceByIndex(0);
            if (priceAmount === 'Unavailable') return false;

            const numericPrice = parseFloat(priceAmount.replace(/[^0-9.-]+/g, '')) * 100;

            if (priceRange.startsWith('under-')) {
              const limit = Number(priceRange.split('-')[1]);
              return numericPrice < limit;
            } else if (priceRange.startsWith('over-')) {
              const limit = Number(priceRange.split('-')[1]);
              return numericPrice > limit;
            } else if (priceRange.includes('-')) {
              const [min, max] = priceRange.split('-').map(Number);
              return numericPrice >= min && numericPrice <= max;
            }
            return true;
          });
        }

        // Apply client-side sorting if API doesn't support it
        if (sortBy !== 'none') {
          filteredProducts.sort((a, b) => {
            const priceA = a._variants[0]?._prices[0]?._amount || 0;
            const priceB = b._variants[0]?._prices[0]?._amount || 0;

            switch (sortBy) {
              case 'price':
                return priceA - priceB;
              case '-price':
                return priceB - priceA;
              case 'title':
                return a._title.localeCompare(b._title);
              case '-title':
                return b._title.localeCompare(a._title);
              default:
                return 0;
            }
          });
        }

        setProducts(filteredProducts);
        setTotalProducts(count);
        setTotalPages(Math.ceil(count / productsPerPage));
        setCurrentCategoryProductCount(`Found ${count} products`);

      } catch (error) {
        console.error('Error fetching products:', error);
        setCurrentCategoryProductCount("Error loading products.");
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [buildQuery, selectedCategory, region]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [sortBy, priceRange, selectedCategory]);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = window.innerWidth < 640 ? 3 : 5; // Fewer pages on mobile

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= Math.min(4, maxVisible - 1); i++) {
          pageNumbers.push(i);
        }
        if (totalPages > maxVisible - 1) {
          pageNumbers.push('...');
          pageNumbers.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = Math.max(totalPages - 3, 1); i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const sortOptions = [
    { value: 'none', label: 'None' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'title', label: 'Name: A to Z' },
    { value: '-title', label: 'Name: Z to A' }
  ];

  const handleCategoryChange = (categoryHandle, href) => {
    setSortBy('none');
    setPriceRange('all');
    setCurrentPage(1);
    setShowFilters(false); // Close mobile filters
    navigate(href);
  };

  const clearAllFilters = () => {
    setSortBy('none');
    setPriceRange('all');
    setCurrentPage(1);
  };
  
  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Breadcrumb */}
        <nav className={`flex items-center space-x-2 text-xs sm:text-sm mb-4 sm:mb-6 lg:mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Link to="/" className={`transition-colors hover:scale-105 ${darkMode ? 'hover:text-gray-300' : 'hover:text-gray-700'}`}>
            Home
          </Link>
          <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 rotate-180" />
          <span className={`truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {categoryNameMedusa}
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {categoryNameMedusa}
            </h1>
            <p className={`mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentCategoryProductCount}
            </p>
          </div>
          
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`lg:hidden flex items-center px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${darkMode
              ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
            {(sortBy !== 'none' || priceRange !== 'all') && (
              <span className={`ml-2 h-2 w-2 rounded-full ${darkMode ? 'bg-white' : 'bg-black'}`} />
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          
          {/* Mobile Filter Overlay */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
              <div className={`relative w-full max-w-sm mx-auto my-8 rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                  {/* Mobile Filter Content - Same as sidebar but in modal */}
                  <MobileFilterContent 
                    categoriesMedusa={categoriesMedusa}
                    handle={handle}
                    handleCategoryChange={handleCategoryChange}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOptions={sortOptions}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    priceOptions={priceOptions}
                    clearAllFilters={clearAllFilters}
                    darkMode={darkMode}
                    setLoading={setLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
            <div className={`border rounded-lg sm:rounded-xl p-4 sm:p-6 sticky top-4 sm:top-8 max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-6rem)] overflow-y-auto transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-base sm:text-lg font-medium mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Filters
              </h3>

              {/* Categories */}
              <div className="mb-4 sm:mb-6">
                <label className={`block text-xs sm:text-sm font-medium mb-2 sm:mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Categories
                </label>
                <div className="space-y-1 sm:space-y-2">
                  {categoriesMedusa.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setLoading(true);
                        handleCategoryChange(category.handle, category.href);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${(category.handle === handle) || (!handle && category.value === 'all')
                        ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                        : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-4 sm:mb-6">
                <label className={`block text-xs sm:text-sm font-medium mb-2 sm:mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-xs sm:text-sm transition-colors duration-200 ${darkMode
                    ? 'border-gray-600 bg-gray-700 text-white focus:ring-white focus:border-white'
                    : 'border-gray-300 bg-white text-gray-900 focus:ring-black focus:border-black'
                    }`}
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4 sm:mb-6">
                <label className={`block text-xs sm:text-sm font-medium mb-2 sm:mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Price Range
                </label>
                <div className="space-y-2 sm:space-y-3">
                  {priceOptions.map(opt => (
                    <label key={opt.value} className="flex items-center">
                      <input
                        type="radio"
                        value={opt.value}
                        checked={priceRange === opt.value}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className={`h-3 w-3 sm:h-4 sm:w-4 border-gray-300 transition-colors duration-200 ${darkMode
                          ? 'text-white focus:ring-white border-gray-600'
                          : 'text-black focus:ring-black'
                          }`}
                      />
                      <span className={`ml-2 sm:ml-3 text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearAllFilters}
                className={`w-full text-xs sm:text-sm border rounded-lg px-4 py-2 sm:py-2.5 transition-all duration-200 hover:scale-105 active:scale-95 ${darkMode
                  ? 'text-gray-400 hover:text-gray-200 border-gray-600 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Desktop Results Header */}
            <div className="hidden sm:flex items-center justify-between mb-4 sm:mb-6">
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {loading
                  ? 'Loading products...'
                  : `Showing ${(currentPage - 1) * productsPerPage + 1}-${Math.min(currentPage * productsPerPage, totalProducts)} of ${totalProducts} products`
                }
              </p>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`border rounded-lg px-3 py-2 text-xs sm:text-sm transition-colors duration-200 ${darkMode
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                    }`}
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <ProductGrid products={products} loading={loading} />

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center mt-8 sm:mt-12 space-y-4 sm:space-y-0 sm:space-x-2">
                
                {/* Mobile Pagination Info */}
                <div className="sm:hidden text-center mb-4">
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Page {currentPage} of {totalPages}
                  </p>
                </div>

                {/* Previous Button */}
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${currentPage === 1
                    ? darkMode
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-400 cursor-not-allowed'
                    : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {getPageNumbers().map((pageNum, index) => (
                    <React.Fragment key={index}>
                      {pageNum === '...' ? (
                        <span className={`px-2 sm:px-3 py-2 text-xs sm:text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          ...
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${currentPage === pageNum
                            ? darkMode
                              ? 'bg-white text-black'
                              : 'bg-black text-white'
                            : darkMode
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                          {pageNum}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${currentPage === totalPages
                    ? darkMode
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-400 cursor-not-allowed'
                    : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </button>
              </div>
            )}

            {/* No products message */}
            {products.length === 0 && !loading && (
              <div className="text-center py-8 sm:py-12">
                <div className={`mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <svg className={`h-8 w-8 sm:h-10 sm:w-10 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-6m-8 0h6m-6 0h6" />
                  </svg>
                </div>
                <p className={`text-sm sm:text-base lg:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No products found for this category and filter.
                </p>
                <button
                  onClick={clearAllFilters}
                  className={`mt-4 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${darkMode
                    ? 'bg-white text-black hover:bg-gray-100'
                    : 'bg-black text-white hover:bg-gray-800'
                    }`}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Filter Component
const MobileFilterContent = ({ 
  categoriesMedusa, 
  handle, 
  handleCategoryChange, 
  sortBy, 
  setSortBy, 
  sortOptions, 
  priceRange, 
  setPriceRange, 
  priceOptions, 
  clearAllFilters, 
  darkMode,
  setLoading 
}) => (
  <>
    {/* Categories */}
    <div className="mb-6">
      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Categories
      </label>
      <div className="space-y-2">
        {categoriesMedusa.map(category => (
          <button
            key={category.id}
            onClick={() => {
              setLoading(true);
              handleCategoryChange(category.handle, category.href);
            }}
            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${(category.handle === handle) || (!handle && category.value === 'all')
              ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
              : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>

    {/* Sort By */}
    <div className="mb-6">
      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Sort By
      </label>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className={`w-full border rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${darkMode
          ? 'border-gray-600 bg-gray-700 text-white focus:ring-white focus:border-white'
          : 'border-gray-300 bg-white text-gray-900 focus:ring-black focus:border-black'
          }`}
      >
        {sortOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>

    {/* Price Range */}
    <div className="mb-6">
      <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Price Range
      </label>
      <div className="space-y-3">
        {priceOptions.map(opt => (
          <label key={opt.value} className="flex items-center">
            <input
              type="radio"
              value={opt.value}
              checked={priceRange === opt.value}
              onChange={(e) => setPriceRange(e.target.value)}
              className={`h-4 w-4 border-gray-300 transition-colors duration-200 ${darkMode
                ? 'text-white focus:ring-white border-gray-600'
                : 'text-black focus:ring-black'
                }`}
            />
            <span className={`ml-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* Clear Filters */}
    <button
      onClick={clearAllFilters}
      className={`w-full text-sm border rounded-lg px-4 py-2.5 transition-all duration-200 hover:scale-105 active:scale-95 ${darkMode
        ? 'text-gray-400 hover:text-gray-200 border-gray-600 hover:bg-gray-700'
        : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'
        }`}
    >
      Clear All Filters
    </button>
  </>
);

export default HomePage;