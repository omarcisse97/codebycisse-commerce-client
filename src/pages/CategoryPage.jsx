// pages/CategoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeftIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useSearch } from '../contexts/SearchContext';
import ProductGrid from '../components/product/ProductGrid';

const CategoryPage = () => {
  const { handle } = useParams();
  const { mockProducts } = useSearch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categoryNames = {
    shirts: 'Shirts',
    accessories: 'Accessories', 
    kids: 'Kids',
    stickers: 'Stickers'
  };

  const categoryName = categoryNames[handle] || 'Products';

  useEffect(() => {
    const loadCategoryProducts = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter products by category
      let filteredProducts = mockProducts.filter(product => 
        product.categories?.some(cat => cat.handle === handle)
      );

      // Apply price filter
      if (priceRange !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
          const price = product.variants?.[0]?.prices?.[0]?.amount || 0;
          switch (priceRange) {
            case 'under-25':
              return price < 2500;
            case '25-50':
              return price >= 2500 && price <= 5000;
            case 'over-50':
              return price > 5000;
            default:
              return true;
          }
        });
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          filteredProducts.sort((a, b) => {
            const priceA = a.variants?.[0]?.prices?.[0]?.amount || 0;
            const priceB = b.variants?.[0]?.prices?.[0]?.amount || 0;
            return priceA - priceB;
          });
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => {
            const priceA = a.variants?.[0]?.prices?.[0]?.amount || 0;
            const priceB = b.variants?.[0]?.prices?.[0]?.amount || 0;
            return priceB - priceA;
          });
          break;
        case 'name':
          filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
          break;
        default:
          // Featured - keep original order
          break;
      }

      setProducts(filteredProducts);
      setLoading(false);
    };

    loadCategoryProducts();
  }, [handle, mockProducts, sortBy, priceRange]);

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' }
  ];

  const priceOptions = [
    { value: 'all', label: 'All Prices' },
    { value: 'under-25', label: 'Under $25' },
    { value: '25-50', label: '$25 - $50' },
    { value: 'over-50', label: 'Over $50' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <ChevronLeftIcon className="h-4 w-4 rotate-180" />
          <span className="text-gray-900">{categoryName}</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{categoryName}</h1>
            <p className="mt-2 text-lg text-gray-600">
              {loading ? 'Loading...' : `${products.length} products`}
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden mt-4 flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
              
              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Price Range
                </label>
                <div className="space-y-2">
                  {priceOptions.map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        value={option.value}
                        checked={priceRange === option.value}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSortBy('featured');
                  setPriceRange('all');
                }}
                className="w-full text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Desktop Sort/Filter Header */}
            <div className="hidden sm:flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                {loading ? 'Loading products...' : `Showing ${products.length} products`}
              </p>
              
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <ProductGrid 
              products={products}
              loading={loading}
            />

            {/* Load More Button (for future pagination) */}
            {!loading && products.length >= 12 && (
              <div className="text-center mt-12">
                <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  Load More Products
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;