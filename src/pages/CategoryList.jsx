// pages/categories.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import ProductGrid from '../components/product/ProductGrid';
import { useCategories } from '../contexts/CategoryContext';
import CategoryIcons from '../utils/categoryIcons';
import { useAuth } from '../contexts/AuthContext';

const CategoryList = () => {
  const { mockProducts } = useSearch();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const { categories_ } = useCategories();
  const [enhancedCategories, setEnhancedCategories] = useState(null);
  const { darkMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading products
    const loadProducts = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
      setLoading(false);
    };

    if(categories_){
      if(enhancedCategories){
        setEnhancedCategories(null);
      }
      const temp = [];
      for(let i = 0; i < categories_?.length; i++){
        const t = {
          ...categories_[i],
          image: <CategoryIcons categoryName={categories_[i]?.name?.toLowerCase()} classNameIcon="h-35 w-35 transition-transform duration-300 group-hover:scale-110" />
        }
        temp.push(t);
      }
      setEnhancedCategories(temp);
      
      
    }

    loadProducts();
  }, [categories_]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
            darkMode ? 'border-blue-400' : 'border-blue-500'
          }`}></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Hero Section */}
      {/** Removed Hero Section */}

      {/* Categories Section */}
      <section className={`py-16 transition-colors duration-300 ${
        darkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Shop by Category</h2>
            <p className={`mt-4 text-lg transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Find exactly what you're looking for
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            { enhancedCategories && enhancedCategories?.map((category) => (
              <div
                key={category?.handle}
                onClick={() => navigate(`${category?.href}`)}
                className={`group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  darkMode ? 'bg-gray-700' : 'bg-white'
                }`}
              >
                <div className={`p-8 flex items-center justify-center min-h-[200px] transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                    : 'bg-gradient-to-br from-gray-50 to-gray-100'
                }`}>
                  {category?.image}
                  {/* <img
                    src={category.image}
                    alt={category.name}
                    className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  /> */}
                </div>
                <div className="p-6">
                  <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                    darkMode ? 'text-white group-hover:text-gray-200' : 'text-gray-900 group-hover:text-gray-700'
                  }`}>
                    {category.name}
                  </h3>
                  <p className={`mt-2 text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {category.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
            <div className="text-center mt-12">
              <div
                onClick={() => navigate('/')}
                className={`inline-flex items-center px-6 py-3 border text-base font-medium rounded-md transition-colors duration-300 cursor-pointer ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                View All Products
              </div>
            </div>
        </div>
      </section>

      {/* Featured Products */}
      

      {/* Newsletter Section */}
      <section className={`text-white transition-colors duration-300 ${
        darkMode ? 'bg-black' : 'bg-gray-900'
      }`}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Stay in the loop</h2>
            <p className={`mt-4 text-lg transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-300'
            }`}>
              Get the latest updates on new products and exclusive offers.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 px-4 py-3 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors duration-300 ${
                  darkMode 
                    ? 'border-gray-500 bg-gray-800' 
                    : 'border-gray-600 bg-gray-800'
                }`}
              />
              
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryList;