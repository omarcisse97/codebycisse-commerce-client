// contexts/CategoryContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { medusaClient } from '../utils/client';

const CategoryContext = createContext();

// Cache configuration
const CACHE_CONFIG = {
  CACHE_TIME: 2 * 60 * 60 * 1000, // 2 hours cache time
  STORAGE_KEY: 'ecommerce_categories',
  LAST_FETCH_KEY: 'categories_last_fetch',
};

export const CategoryProvider = ({ children }) => {
  const [categories_, setCategories_] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Get cached categories from localStorage
  const getCachedCategories = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_CONFIG.STORAGE_KEY);
      const lastFetchTime = localStorage.getItem(CACHE_CONFIG.LAST_FETCH_KEY);
      
      if (cached && lastFetchTime) {
        const parsedCategories = JSON.parse(cached);
        const fetchTime = parseInt(lastFetchTime);
        const now = Date.now();
        
        // Check if cache is still valid
        if ((now - fetchTime) < CACHE_CONFIG.CACHE_TIME) {
          setLastFetch(fetchTime);
          return parsedCategories;
        }
      }
      return null;
    } catch (error) {
      console.error('Error reading cached categories:', error);
      return null;
    }
  }, []);

  // Save categories to localStorage
  const setCachedCategories = useCallback((categoriesData) => {
    try {
      const now = Date.now();
      localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(categoriesData));
      localStorage.setItem(CACHE_CONFIG.LAST_FETCH_KEY, now.toString());
      setLastFetch(now);
    } catch (error) {
      console.error('Error caching categories:', error);
    }
  }, []);

  // Fetch categories from API
  const fetchCategories = useCallback(async (force = false) => {
    try {
      // If not forcing refresh, check cache first
      if (!force) {
        const cached = getCachedCategories();
        if (cached) {
          setCategories_(cached);
          setLoading(false);
          return cached;
        }
      }

      setLoading(true);
      setError(null);

      // Fetch from API
      const result = await medusaClient.store.category.list({
        fields: '*parent_category',
        include_descendants_tree: true,
      });

      if (result && result.product_categories) {
        const fetchedCategories = result.product_categories.map(category => ({
          id: category.id,
          name: category.name,
          handle: category.handle,
          description: category.description,
          parent_category_id: category.parent_category_id,
          parent_category: category.parent_category,
          category_children: category.category_children || [],
          metadata: category.metadata,
          created_at: category.created_at,
          updated_at: category.updated_at,
          value: category.handle,
          label: category.name,
          href: `/${category.handle}`,
          
        }));
       
        fetchedCategories.push({
            id: '',
          name: 'All products',
          handle: '',
          description: 'All products',
          parent_category_id: '',
          parent_category: null,
          category_children: null,
          metadata: null,
          created_at: '',
          updated_at: '',
          value: 'all',
          label: 'All Products',
          href: `/`,
        })
        setCategories_(fetchedCategories);
        setCachedCategories(fetchedCategories);
        setLoading(false);
        return fetchedCategories;
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Failed to fetch categories');
      setLoading(false);
      
      // Try to use cached categories as fallback
      const cached = getCachedCategories();
      if (cached) {
        setCategories_(cached);
      }
    }
  }, [getCachedCategories, setCachedCategories]);

  // Force refresh categories (for admin actions)
  const refreshCategories = useCallback(async () => {
    return await fetchCategories(true);
  }, [fetchCategories]);

  // Clear cache (useful for debugging or logout)
  const clearCategoriesCache = useCallback(() => {
    localStorage.removeItem(CACHE_CONFIG.STORAGE_KEY);
    localStorage.removeItem(CACHE_CONFIG.LAST_FETCH_KEY);
    setCategories_([]);
    setLastFetch(null);
  }, []);

  // Check if cache is stale
  const isCacheStale = useCallback(() => {
    if (!lastFetch) return true;
    const now = Date.now();
    return (now - lastFetch) > CACHE_CONFIG.CACHE_TIME;
  }, [lastFetch]);

  // Get categories by parent (for nested navigation)
  const getCategoriesByParent = useCallback((parentId = null) => {
    return categories_.filter(category => 
      category.parent_category_id === parentId
    );
  }, [categories_]);

  // Get category by handle
  const getCategoryByHandle = useCallback((handle) => {
    return categories_.find(category => category.handle === handle);
  }, [categories_]);

  // Get category hierarchy (breadcrumb)
  const getCategoryHierarchy = useCallback((categoryId) => {
    const hierarchy = [];
    let currentCategory = categories_.find(cat => cat.id === categoryId);
    
    while (currentCategory) {
      hierarchy.unshift(currentCategory);
      currentCategory = categories_.find(cat => 
        cat.id === currentCategory.parent_category_id
      );
    }
    
    return hierarchy;
  }, [categories_]);

  // Initial load on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Refresh when user comes back to the app (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isCacheStale()) {
        fetchCategories();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchCategories, isCacheStale]);

  // Refresh when window gains focus (user switches back to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (isCacheStale()) {
        fetchCategories();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchCategories, isCacheStale]);

  const value = {
    // Data
    categories_,
    loading,
    error,
    lastFetch,
    
    // Actions
    fetchCategories,
    refreshCategories,
    clearCategoriesCache,
    
    // Helpers
    getCategoriesByParent,
    getCategoryByHandle,
    getCategoryHierarchy,
    isCacheStale,
    
    // Cache info (useful for debugging)
    cacheInfo: {
      cacheTime: CACHE_CONFIG.CACHE_TIME,
      isStale: isCacheStale(),
      lastFetch: lastFetch ? new Date(lastFetch).toISOString() : null,
    }
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

// Custom hook to use categories
export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

// HOC for components that need categories
export const withCategories = (Component) => {
  return function CategoryComponent(props) {
    const categoryProps = useCategories();
    return <Component {...props} {...categoryProps} />;
  };
};

export default CategoryContext;