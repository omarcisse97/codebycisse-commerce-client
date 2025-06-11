import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, FunnelIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../contexts/SearchContext';
import { useAuth } from '../contexts/AuthContext';
import ProductGrid from '../components/product/ProductGrid';
import { medusaClient } from '../utils/client';
import { useCategories } from '../contexts/CategoryContext';
import { MedusaProduct } from '../models/store/MedusaProduct';
import { MedusaCategory } from '../models/store/MedusaCategory';

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
  const [categoriesMedusa, setCategoriesMedusa] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [baseProducts, setBaseProducts] = useState([]);
  const [currentCategoryProductCount, setCurrentCategoryProductCount] = useState('Searching...');
  const [priceOptions, setPriceOptions] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [paginatedProducts, setPaginatedProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const categoryNameMedusa = !handle ? 'All Products' : `${handle[0]?.toUpperCase()}${handle?.substring(1)}`;

  // Initialize categories from context (already formatted)
  useEffect(() => {
    if (categories_ && categories_.length > 0) {
      setLoading(true);
      setCategoriesMedusa(categories_);
      setSelectedCategory(null);
      setLoading(false);
    }
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

  // Fetch and process products using MedusaProduct class
  useEffect(() => {
    const fetchProducts = async () => {
      if (!region || !selectedCategory) return;

      setLoading(true);
      setCurrentCategoryProductCount("Searching...");

      try {
        const allProducts = [];
        const query = { region_id: region?.code };

        // Add category filter if not "all"
        if (selectedCategory && selectedCategory.value !== 'all' && selectedCategory.id && selectedCategory.id !== '') {
          query.category_id = selectedCategory.id;
        }

        let offsetCount = 0;
        let hasMorePages = true;

        // Fetch all products in batches
        while (hasMorePages) {
          const { products: pageProducts, count } = await medusaClient.store.product?.list({
            limit: 100,
            offset: offsetCount,
            ...query,
            fields: '*categories'
          });

          allProducts.push(...pageProducts);
          offsetCount += pageProducts.length;
          hasMorePages = pageProducts.length === 100 && offsetCount < count;
        }
        

        let temp = [];
        if (allProducts.length > 0) {
          for (let i = 0; i < allProducts.length; i++) {
            temp.push(
              new MedusaProduct(
                allProducts[i]?.id,
                allProducts[i]?.title,
                allProducts[i]?.handle,
                allProducts[i]?.thumbnail,
                [...allProducts[i]?.variants],
                [...allProducts[i]?.categories],
                allProducts[i]?.description,
                [...allProducts[i]?.images]
              )
            );
          }
        }
        // setBaseProducts(medusaProducts);
        setBaseProducts([...temp]);
        setCurrentCategoryProductCount(`Found ${temp.length} products`);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setCurrentCategoryProductCount("Error loading products.");
        setBaseProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, region]);

  // Apply filters and sorting
  useEffect(() => {


    if (baseProducts && baseProducts?.length > 0) {
      // Price filtering using MedusaProduct methods
      let flatProducts = [];

      if (Array.isArray(baseProducts)) {
        // Use flat(Infinity) to handle any level of nesting
        flatProducts = baseProducts.flat(Infinity);
      } else {
        flatProducts = [baseProducts];
      }
      let filtered = flatProducts;
      
      
      if (priceRange !== 'all') {

        filtered = filtered.filter(product => {
          
          const priceAmount = product?.getVariantFormattedPriceByIndex(0);
          
          if (priceAmount === 'Unavailable') return false;

          // Extract numeric value from formatted price
          const numericPrice = parseFloat(priceAmount.replace(/[^0-9.-]+/g, '')) * 100; // Convert to cents

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

      // Sorting
      if (sortBy !== 'none') {
        filtered.sort((a, b) => {
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
      setProducts(filtered);
      setCurrentPage(1);
    }


    // Reset to first page when filters change
  }, [baseProducts, priceRange, sortBy]);

  // Pagination logic
  useEffect(() => {

    const totalPages = Math.ceil(products.length / productsPerPage);
    setTotalPages(totalPages);

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;

   
    const paginated = products.slice(startIndex, endIndex);



    setPaginatedProducts(paginated);
  }, [products, currentPage, productsPerPage]);

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
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
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
    navigate(href);
  };

  const clearAllFilters = () => {
    setSortBy('none');
    setPriceRange('all');
    setCurrentPage(1);
  };
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className={`flex items-center space-x-2 text-sm mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Link to="/" className={`${darkMode ? 'hover:text-gray-300' : 'hover:text-gray-700'}`}>
            Home
          </Link>
          <ChevronLeftIcon className="h-4 w-4 rotate-180" />
          <span className={darkMode ? 'text-white' : 'text-gray-900'}>
            {categoryNameMedusa}
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {categoryNameMedusa}
            </h1>
            <p className={`mt-2 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentCategoryProductCount}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`sm:hidden mt-4 flex items-center px-4 py-2 border rounded-md text-sm font-medium ${darkMode
              ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className={`border rounded-lg p-6 sticky top-8 max-h-[calc(100vh-6rem)] overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Filters
              </h3>

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
                      className={`w-full text-left px-3 py-2 text-sm rounded-md ${(category.handle === handle) || (!handle && category.value === 'all')
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
                  className={`w-full border rounded-md px-3 py-2 text-sm ${darkMode
                    ? 'border-gray-600 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
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
                <div className="space-y-2">
                  {priceOptions.map(opt => (
                    <label key={opt.value} className="flex items-center">
                      <input
                        type="radio"
                        value={opt.value}
                        checked={priceRange === opt.value}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className={`h-4 w-4 border-gray-300 ${darkMode
                          ? 'text-white focus:ring-white border-gray-600'
                          : 'text-black focus:ring-black'
                          }`}
                      />
                      <span className={`ml-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearAllFilters}
                className={`w-full text-sm border rounded-md px-4 py-2 ${darkMode
                  ? 'text-gray-400 hover:text-gray-200 border-gray-600 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="hidden sm:flex items-center justify-between mb-6">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {loading
                  ? 'Loading products...'
                  : `Showing ${(currentPage - 1) * productsPerPage + 1}-${Math.min(currentPage * productsPerPage, products.length)} of ${products.length} products`
                }
              </p>
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`border rounded-md px-3 py-2 text-sm ${darkMode
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

            <ProductGrid products={paginatedProducts} loading={loading} />

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 space-x-2">
                {/* Previous Button */}
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${currentPage === 1
                    ? darkMode
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-400 cursor-not-allowed'
                    : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {getPageNumbers().map((pageNum, index) => (
                    <React.Fragment key={index}>
                      {pageNum === '...' ? (
                        <span className={`px-3 py-2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          ...
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === pageNum
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
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${currentPage === totalPages
                    ? darkMode
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-400 cursor-not-allowed'
                    : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}

            {/* No products message */}
            {paginatedProducts.length === 0 && !loading && (
              <p className={`text-center text-lg mt-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No products found for this category and filter.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;