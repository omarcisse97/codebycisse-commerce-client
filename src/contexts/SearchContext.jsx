// contexts/SearchContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { MedusaProduct } from '../models/store/MedusaProduct';
import { medusaClient } from '../utils/client';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsMedusa, setSearchResultsMedusa] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Mock products for demo - replace with actual Medusa API calls
  const mockProducts = [
    {
      id: '1',
      title: 'Acme Circles T-Shirt',
      handle: 'acme-circles-tshirt',
      thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
      variants: [{ id: 'v1', title: 'Default', prices: [{ amount: 2000, currency_code: 'usd' }] }],
      categories: [{ handle: 'shirts' }]
    },
    {
      id: '2',
      title: 'Acme Drawstring Bag',
      handle: 'acme-drawstring-bag',
      thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop',
      variants: [{ id: 'v2', title: 'Default', prices: [{ amount: 1200, currency_code: 'usd' }] }],
      categories: [{ handle: 'accessories' }]
    },
    {
      id: '3',
      title: 'Acme Cup',
      handle: 'acme-cup',
      thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=300&h=300&fit=crop',
      variants: [{ id: 'v3', title: 'Default', prices: [{ amount: 1500, currency_code: 'usd' }] }],
      categories: [{ handle: 'accessories' }]
    },
    {
      id: '4',
      title: 'Acme Hoodie',
      handle: 'acme-hoodie',
      thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
      variants: [{ id: 'v4', title: 'Default', prices: [{ amount: 5000, currency_code: 'usd' }] }],
      categories: [{ handle: 'shirts' }]
    },
    {
      id: '5',
      title: 'Acme Baby Onesie',
      handle: 'acme-baby-onesie',
      thumbnail: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300&h=300&fit=crop',
      variants: [{ id: 'v5', title: 'Default', prices: [{ amount: 1000, currency_code: 'usd' }] }],
      categories: [{ handle: 'kids' }]
    }
  ];



  const searchProducts = useCallback(async (query, region_id) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);


    const fetchProductsByQuery = async (query, region_id) => {
      const result = await medusaClient.store.product.list({ q: query, limit: 5, fields: '*categories', region_id:region_id });
      if (result && result?.products) {
        const products = [];
        for (let i = 0; i < result?.products.length; i++) {
          const product = new MedusaProduct(
            result?.products[i]?.id,
            result?.products[i]?.title,
            result?.products[i]?.handle,
            result?.products[i]?.thumbnail,
            [...result?.products[i]?.variants],
            [...result?.products[i]?.categories],
            result?.products[i]?.description,
            [...result?.products[i]?.images]

          ) || null;
          if (product) {
            products.push(product);
          }
        }
        return products;
      } 
      return [];
    }

    try {
      // Simulate API delay
      // await new Promise(resolve => setTimeout(resolve, 300));
     
      const resultMedusa = await fetchProductsByQuery(query, region_id);
      setSearchResultsMedusa(resultMedusa);
      // Mock search - replace with actual Medusa search API
      const results = mockProducts.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.categories.some(cat => cat.handle.toLowerCase().includes(query.toLowerCase()))
      );

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSearchResultsMedusa([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (query, region_id) => {
    setSearchQuery(query);
    searchProducts(query, region_id);
  };

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const value = {
    searchQuery,
    searchResults,
    searchResultsMedusa,
    isSearching,
    isSearchOpen,
    handleSearchChange,
    openSearch,
    closeSearch,
    mockProducts // Expose for other components to use
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};