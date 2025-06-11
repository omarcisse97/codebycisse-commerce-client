import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../contexts/SearchContext';
import ProductGrid from '../components/product/ProductGrid';
import { useAuth } from '../contexts/AuthContext';
import { medusaClient } from '../utils/client';
import { MedusaProduct } from '../models/store/MedusaProduct';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { mockProducts } = useSearch();
  const { region, darkMode } = useAuth();
  const [medusaProducts, setMedusaProducts] = useState([]);
  
  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const productsPerPage = 12;

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  // ✅ Fixed: Handle initial load and URL changes
  useEffect(() => {
    setSearchQuery(query);
    setCurrentPage(page);
    
    if (query && query.trim()) {
      // Let fetchProducts handle the actual search
    } else {
      // Clear everything when no search query
      setProducts([]);
      setMedusaProducts([]);
      setTotalCount(0);
      setTotalPages(1);
      setLoading(false);
    }
  }, [query, page]);

  // ✅ Fixed: Main search logic with proper pagination
  useEffect(() => {
    const fetchProducts = async () => {
      // ✅ Only search if we have a real search query
      if (!searchQuery || !searchQuery.trim()) {
        setMedusaProducts([]);
        setTotalCount(0);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      
      
      try {
        const offset = (currentPage - 1) * productsPerPage;
        const result = await medusaClient.store.product.list({ 
          region_id: region?.id, 
          q: searchQuery.trim(),
          fields: '*categories',
          limit: productsPerPage,
          offset: offset
        });
        
        
        const tempProducts = [];
        
        if (result && result?.products && Array.isArray(result?.products)) {
          
          
          // ✅ Better pagination calculation
          const actualCount = result.count ?? null;
          const productsOnThisPage = result.products.length;
          
          if (actualCount !== null) {
            // We have total count from API
            setTotalCount(actualCount);
            setTotalPages(Math.ceil(actualCount / productsPerPage));
          } else {
            // Estimate pagination based on results
            if (productsOnThisPage < productsPerPage) {
              // This is the last page
              setTotalCount((currentPage - 1) * productsPerPage + productsOnThisPage);
              setTotalPages(currentPage);
            } else {
              // There might be more pages
              setTotalCount((currentPage - 1) * productsPerPage + productsOnThisPage);
              setTotalPages(currentPage + 1); // Show one more page possibility
            }
          }
          
          // Convert to MedusaProduct objects
          for (let i = 0; i < result.products.length; i++) {
            try {
              const product = result.products[i];
              const tempProduct = new MedusaProduct(
                product?.id,
                product?.title,
                product?.handle,
                product?.thumbnail,
                [...(product?.variants || [])],
                [...(product?.categories || [])],
                product?.description,
                [...(product?.images || [])]
              );
              
              if (tempProduct) {
                tempProducts.push(tempProduct);
              }
            } catch (productError) {
              console.warn('Error creating product:', productError);
            }
          }
          
          setMedusaProducts(tempProducts);
        } else {
          // No products found
          setMedusaProducts([]);
          setTotalCount(0);
          setTotalPages(1);
        }
        
      } catch (error) {
        console.error('Medusa API Error:', error);
        
        // ✅ Fallback to mock products
        
        await performMockSearch(searchQuery.trim(), currentPage);
      } finally {
        setLoading(false);
      }
    };
    
    // ✅ Only fetch if we have region and a real search query
    if (region && searchQuery && searchQuery.trim()) {
      setLoading(true);
      fetchProducts();
    } else if (!searchQuery || !searchQuery.trim()) {
      // Clear results if no search query
      setMedusaProducts([]);
      setProducts([]);
      setTotalCount(0);
      setTotalPages(1);
      setLoading(false);
    }
  }, [searchQuery, region, currentPage]);

  // ✅ Mock products fallback function
  const performMockSearch = async (searchTerm, pageNum = 1) => {
    if (!searchTerm.trim()) {
      setProducts([]);
      setMedusaProducts([]);
      return;
    }

    try {
      // Filter mock products
      const results = mockProducts.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categories?.some(cat =>
          cat.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );

      // Apply pagination to mock results
      const startIndex = (pageNum - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      const paginatedResults = results.slice(startIndex, endIndex);
      
      setProducts(paginatedResults);
      setMedusaProducts([]); // Clear Medusa products when using mock
      setTotalCount(results.length);
      setTotalPages(Math.ceil(results.length / productsPerPage));
      
    } catch (error) {
      console.error('Mock search error:', error);
      setProducts([]);
      setMedusaProducts([]);
      setTotalCount(0);
      setTotalPages(1);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1); // Reset to page 1
      setSearchParams({ q: searchQuery.trim(), page: '1' });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setProducts([]);
    setMedusaProducts([]);
    setCurrentPage(1);
    setTotalCount(0);
    setTotalPages(1);
  };

  // ✅ Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && searchQuery && searchQuery.trim()) {
      setCurrentPage(newPage);
      setSearchParams({ 
        q: searchQuery.trim(), 
        page: newPage.toString() 
      });
      
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ✅ Generate pagination numbers
  const getPaginationNumbers = () => {
    if (totalPages <= 1) return [];
    
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Calculate range around current page
    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    // Add first page and dots if needed
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Add middle range
    rangeWithDots.push(...range);

    // Add last page and dots if needed
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return [...new Set(rangeWithDots)]; // Remove duplicates
  };

  // ✅ Determine which products to display
  const displayProducts = medusaProducts.length > 0 ? medusaProducts : products;
  const hasResults = displayProducts.length > 0;
  const hasSearchQuery = searchQuery && searchQuery.trim();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className={`flex items-center space-x-2 text-sm mb-8 transition-colors duration-300 ${
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Link 
            to="/" 
            className={`transition-colors duration-300 ${
              darkMode ? 'hover:text-gray-200' : 'hover:text-gray-700'
            }`}
          >
            Home
          </Link>
          <ChevronLeftIcon className="h-4 w-4 rotate-180" />
          <span className={`transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Search
          </span>
          {query && (
            <>
              <ChevronLeftIcon className="h-4 w-4 rotate-180" />
              <span className={`transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                "{query}"
              </span>
            </>
          )}
        </nav>

        {/* Search Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-6 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Search Products
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-300 ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:ring-white' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-black'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                    darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className={`mt-4 sm:mt-0 sm:ml-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md transition-colors duration-300 ${
                darkMode 
                  ? 'text-black bg-white hover:bg-gray-100' 
                  : 'text-white bg-black hover:bg-gray-800'
              }`}
            >
              Search
            </button>
          </form>
        </div>

        {/* Search Results */}
        {hasSearchQuery ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {loading ? 'Searching...' : `Search results for "${searchQuery}"`}
              </h2>
              {!loading && (
                <p className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {totalCount} {totalCount === 1 ? 'result' : 'results'} found
                  {totalPages > 1 && (
                    <span> • Page {currentPage} of {totalPages}</span>
                  )}
                </p>
              )}
            </div>

            {loading ? (
              <ProductGrid loading={true} />
            ) : hasResults ? (
              <>
                <ProductGrid products={displayProducts} />
                
                {/* ✅ Pagination Component */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
                        currentPage === 1
                          ? darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                          : darkMode 
                            ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ChevronLeftIcon className="h-4 w-4 mr-1" />
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {getPaginationNumbers().map((pageNum, index) => (
                        <button
                          key={index}
                          onClick={() => pageNum !== '...' && handlePageChange(pageNum)}
                          disabled={pageNum === '...'}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
                            pageNum === currentPage
                              ? darkMode 
                                ? 'bg-white text-black' 
                                : 'bg-black text-white'
                              : pageNum === '...'
                              ? darkMode ? 'text-gray-600 cursor-default' : 'text-gray-400 cursor-default'
                              : darkMode 
                                ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-300 ${
                        currentPage === totalPages
                          ? darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                          : darkMode 
                            ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Next
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* No Results Found */
              <div className="text-center py-12">
                <MagnifyingGlassIcon className={`mx-auto h-12 w-12 transition-colors duration-300 ${
                  darkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <h3 className={`mt-4 text-lg font-medium transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  No results found
                </h3>
                <p className={`mt-2 transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  We couldn't find any products matching "{searchQuery}". Try adjusting your search terms.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* No Search Query - Show Start Screen */
          <div className="text-center py-12">
            <MagnifyingGlassIcon className={`mx-auto h-12 w-12 transition-colors duration-300 ${
              darkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h2 className={`mt-4 text-lg font-medium transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Start your search
            </h2>
            <p className={`mt-2 mb-6 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Enter a product name or browse popular searches below.
            </p>

            {/* Quick Category Links */}
            <Link  
              to="/categories" 
              className={`inline-block mt-12 p-4 border rounded-lg transition-all duration-300 ${
                darkMode 
                  ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-800 text-gray-300 hover:text-white' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-700 hover:text-gray-900'
              }`}
            >
              Browse Categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;