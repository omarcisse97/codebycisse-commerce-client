// utils/regionStorage.js
// Cookie utility functions for guest region storage

export const REGION_COOKIE_NAME = 'preferred_region';
export const COOKIE_EXPIRY_DAYS = 365; // 1 year

/**
 * Set a cookie with proper configuration
 */
export const setCookie = (name, value, days = COOKIE_EXPIRY_DAYS) => {
  if (typeof document === 'undefined') return; // SSR safety
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure=${window.location.protocol === 'https:'}`;
};

/**
 * Get a cookie value
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined') return null; // SSR safety
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

/**
 * Remove a cookie
 */
export const removeCookie = (name) => {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/**
 * Save user's preferred region
 */
export const savePreferredRegion = (regionId) => {
  try {
    setCookie(REGION_COOKIE_NAME, regionId);
    
  } catch (error) {
    console.error('Failed to save region preference:', error);
  }
};

/**
 * Get user's preferred region
 */
export const getPreferredRegion = () => {
  try {
    return getCookie(REGION_COOKIE_NAME);
  } catch (error) {
    console.error('Failed to get region preference:', error);
    return null;
  }
};

/**
 * Clear region preference
 */
export const clearRegionPreference = () => {
  try {
    removeCookie(REGION_COOKIE_NAME);
    
  } catch (error) {
    console.error('Failed to clear region preference:', error);
  }
};

// hooks/useRegionPersistence.js
// React hook for region persistence

import { useState, useEffect } from 'react';
import { savePreferredRegion, getPreferredRegion } from '../utils/regionStorage';

/**
 * Hook for managing region persistence with cookies
 */
export const useRegionPersistence = (defaultRegion = 'us') => {
  const [region, setRegion] = useState(defaultRegion);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load saved region on mount
  useEffect(() => {
    const loadSavedRegion = () => {
      try {
        const savedRegion = getPreferredRegion();
        
        if (savedRegion) {
          setRegion(savedRegion);
        }
      } catch (error) {
        console.error('Error loading region preference:', error);
        // Keep default region
      } finally {
        setIsLoading(false);
        setHasLoaded(true);
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(loadSavedRegion, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Save region and update state
  const updateRegion = (newRegion) => {
    try {
      savePreferredRegion(newRegion);
      setRegion(newRegion);
    } catch (error) {
      console.error('Error saving region preference:', error);
      // Still update state even if save fails
      setRegion(newRegion);
    }
  };

  return {
    region,
    updateRegion,
    isLoading,
    hasLoaded
  };
};

