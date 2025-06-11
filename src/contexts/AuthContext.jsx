// contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import countries from "i18n-iso-countries";
import { toast } from 'sonner';
import { medusaClient } from '../utils/client';
import { login_, logout_, register_ } from '../utils/auth';

import enLocale from "i18n-iso-countries/langs/en.json";
countries.registerLocale(enLocale);

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false };
    case 'SET_REGION':
      return { ...state, region: action.payload };
    case 'SET_REGIONS':
      return { ...state, regions: action.payload };
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false };
    default:
      return state;
  }
};

// ✅ Function to get initial dark mode value
const getInitialDarkMode = () => {
  try {
    // Check localStorage first
    const savedDarkMode = localStorage.getItem('medusa-dark-mode');
    if (savedDarkMode !== null) {
      return savedDarkMode === 'true';
    }

    // Check user preferences if available
    const savedUser = localStorage.getItem('medusa-user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return user.preferences?.darkMode || false;
    }

    // Default to false
    return false;
  } catch (error) {
    console.error('Error getting initial dark mode:', error);
    return false;
  }
};

const resetDarkModeOnLogout = () => {
  localStorage.setItem('medusa-dark-mode', 'false');
}

// Mock users database
const mockUsers = [
  {
    id: '1',
    email: 'john@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 123-4567',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    preferences: {
      newsletter: true,
      marketing: false,
      darkMode: false
    },
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    email: 'jane@example.com',
    password: 'password456',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1 (555) 987-6543',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'United States'
    },
    preferences: {
      newsletter: true,
      marketing: true,
      darkMode: false
    },
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face'
  }
];

export const AuthProvider = ({ children }) => {
  // ✅ Initialize with correct dark mode value
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: false,
    region: null,
    regions: [],
    darkMode: getInitialDarkMode() // ✅ Get initial value correctly
  });

  // Load regions from Medusa
  const loadRegions = async () => {
    try {
      const result = await medusaClient.store.region.list();
      const retVal = [];

      if (result?.regions && result?.regions?.length > 0) {
        for (let i = 0; i < result?.regions?.length; i++) {
          if (result?.regions[i]?.countries && result?.regions[i]?.countries?.length > 0) {

            // Add individual countries
            for (let j = 0; j < result?.regions[i]?.countries.length; j++) {
              const country = result?.regions[i]?.countries[j];
              retVal.push({
                code: result?.regions[i]?.id,
                name: country.display_name,
                currency: result?.regions[i]?.currency_code,
                flag: countries.getAlpha2Code(country.display_name, "en")
              });
            }

            // Add regional "Other" option for large regions
            if (
              result?.regions[i]?.name.toLowerCase() === 'europe' ||
              result?.regions[i]?.name.toLowerCase() === 'africa' ||
              result?.regions[i]?.name.toLowerCase() === 'asia'
            ) {
              retVal.push({
                code: result?.regions[i]?.id,
                name: `Other (${result?.regions[i]?.name})`,
                currency: result?.regions[i]?.currency_code,
                flag: countries.getAlpha2Code("N/A", "en")
              });
            }
          }
        }
      }

      dispatch({ type: 'SET_REGIONS', payload: retVal });
    } catch (error) {
      console.error('Failed to load regions:', error);
      const fallbackRegions = [
        { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
        { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
        { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
        { code: 'EU', name: 'European Union', currency: 'EUR', flag: '🇪🇺' },
        { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
        { code: 'JP', name: 'Japan', currency: 'JPY', flag: '🇯🇵' },
      ];
      dispatch({ type: 'SET_REGIONS', payload: fallbackRegions });
    }
  };

  // ✅ Apply dark mode immediately on mount (before useEffect)
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []); // Run once on mount

  // Initialize from localStorage and load regions
  useEffect(() => {
    const savedUser = localStorage.getItem('medusa-user');
    const savedRegion = localStorage.getItem('medusa-region');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });

        // ✅ Only update dark mode if user has a specific preference
        // and it's different from what's already set
        if (user.preferences?.darkMode !== undefined && user.preferences.darkMode !== state.darkMode) {
          dispatch({ type: 'SET_DARK_MODE', payload: user.preferences.darkMode });
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }

    if (savedRegion) {
      try {
        const region = JSON.parse(savedRegion);
        dispatch({ type: 'SET_REGION', payload: region });
      } catch (error) {
        console.error('Error parsing saved region:', error);
      }
    }

    // Load regions
    loadRegions();
  }, []);

  // ✅ Apply dark mode to document whenever it changes
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // ✅ Always save to localStorage when dark mode changes
    localStorage.setItem('medusa-dark-mode', state.darkMode.toString());
  }, [state.darkMode]);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user in mock database
      const user = mockUsers.find(u => u.email === email && u.password === password);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      dispatch({ type: 'SET_USER', payload: userWithoutPassword });
      // ✅ Only update dark mode if user has a specific preference
      if (userWithoutPassword.preferences?.darkMode !== undefined) {
        dispatch({ type: 'SET_DARK_MODE', payload: userWithoutPassword.preferences.darkMode });
      }

      localStorage.setItem('medusa-user', JSON.stringify(userWithoutPassword));
      toast.success('Successfully logged in!');

      return userWithoutPassword;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loginMedusa = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });


      const tryLogin = await login_(email, password);
      if (tryLogin === true) {
        const user = await medusaClient.store.customer.retrieve();
        if (!user || !user.customer) {
          throw new Error('Invalid email or password');
        }
        /**
         * "default_billing_address_id": "string",
   "default_shipping_address_id": "string",
   "company_name": "string",
         */
        
        const enhancedUser = {
          id: user?.customer?.id,
          email: user?.customer?.email,
          first_name: user?.customer?.first_name,
          last_name: user?.customer?.last_name,
          phone: user?.customer?.phone,
          company_name: user?.customer?.company_name,
          addresses: [...user?.customer?.addresses],
          preferences: {
            darkMode: state.darkMode, // ✅ Keep current dark mode setting
          }
        };

        // ✅ Handle user preferences storage
        const existingUsers = JSON.parse(localStorage.getItem('users') || '{}');
        if (existingUsers[enhancedUser.id]) {
          // Use existing preferences
          enhancedUser.preferences = { ...existingUsers[enhancedUser.id].preferences };
        } else {
          // Save new user preferences
          existingUsers[enhancedUser.id] = { preferences: { ...enhancedUser.preferences } };
          localStorage.setItem('users', JSON.stringify(existingUsers));
        }

        dispatch({ type: 'SET_USER', payload: enhancedUser });
        // ✅ Only update dark mode if user has a specific preference
        if (enhancedUser.preferences?.darkMode !== undefined) {
          dispatch({ type: 'SET_DARK_MODE', payload: enhancedUser.preferences.darkMode });
        }

        localStorage.setItem('medusa-user', JSON.stringify(enhancedUser));
        toast.success('Successfully logged in!');

        return user;
      } else {
        throw new Error('Invalid email or password');
      }

    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * sdk.store.customer.createAddress({
      first_name: firstName,
      last_name: lastName,
      address_1: address1,
      company,
      postal_code: postalCode,
      city,
      country_code: countryCode,
      province,
      phone: phoneNumber,
    })
    .then(({ customer }) => {
      setCustomer(customer)
    })
    .finally(() => setLoading(false))
  }

   */

  /**
   * const newDarkMode = !state.darkMode;
    dispatch({ type: 'SET_DARK_MODE', payload: newDarkMode });

    // ✅ Update user preferences if logged in
    if (state.user) {
      const updatedUser = {
        ...state.user,
        preferences: {
          ...state.user.preferences,
          darkMode: newDarkMode
        }
      };

      // ✅ Update localStorage users preferences
      const existingUsers = JSON.parse(localStorage.getItem('users') || '{}');
      if (existingUsers[updatedUser.id]) {
        existingUsers[updatedUser.id].preferences = { ...updatedUser.preferences };
        localStorage.setItem('users', JSON.stringify(existingUsers));
      }

      dispatch({ type: 'SET_USER', payload: updatedUser });
      localStorage.setItem('medusa-user', JSON.stringify(updatedUser));
    }
   */
  /**
   * try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUser = { ...state.user, ...updatedData };

      // Update in mock database
      const userIndex = mockUsers.findIndex(u => u.id === state.user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedData };
      }

      dispatch({ type: 'SET_USER', payload: updatedUser });
      localStorage.setItem('medusa-user', JSON.stringify(updatedUser));

      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
   */

  const createAddress = async (newAddress) => {
    if (state.user) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        await medusaClient.store.customer.createAddress({
          first_name: newAddress?.first_name,
          last_name: newAddress?.last_name,
          address_1: newAddress?.address_1,
          address_2: newAddress?.address_2,
          company: newAddress?.company,
          postal_code: newAddress?.postal_code,
          city: newAddress?.city,
          country_code: newAddress?.country_code,
          province: newAddress?.province,
          phone: newAddress?.phone,
          address_name: newAddress?.address_name
        });
        const addressList = await medusaClient.store.customer.listAddress({ fields: '*address_name' });
        // dispatch({ type: 'SET_LOADING', payload: false });
        toast.success('Successfully created address!');
        
        return addressList;
      } catch (error) {
        toast.error('Failed to create new address');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  const deleteAddress = async (id) => {
    if (state.user) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        await medusaClient.store.customer.deleteAddress(id);
        const addressList = await medusaClient.store.customer.listAddress({ fields: '*address_name' });
        // dispatch({ type: 'SET_LOADING', payload: false });
        toast.success('Successfully deleted address!');
        return addressList;
      } catch (error) {
        toast.error('Failed to delete address', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }


  };
  /**
   * sdk.store.customer.updateAddress(address.id, {
      first_name: firstName,
      last_name: lastName,
      address_1: address1,
      company,
      postal_code: postalCode,
      city,
      country_code: countryCode,
      province,
      phone: phoneNumber,
    })
    .then(({ customer }) => {
      setCustomer(customer)
    })
    .finally(() => setLoading(false))
  }

   */
  const updateAddress = async (addressObj) => {
    if (state.user) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await medusaClient.store.customer.updateAddress(addressObj.id, {
          first_name: addressObj?.first_name,
          last_name: addressObj?.last_name,
          address_1: addressObj?.address_1,
          address_2: addressObj?.address_2,
          company: addressObj?.company,
          postal_code: addressObj?.postal_code,
          city: addressObj?.city,
          country_code: addressObj?.country_code,
          province: addressObj?.province,
          phone: addressObj?.phone,
          address_name: addressObj?.address_name
        })

        const addressList = await medusaClient.store.customer.listAddress({ fields: '*address_name' });
        // dispatch({ type: 'SET_LOADING', payload: false });
        toast.success('Successfully updated address!');
        return addressList;
      } catch (error) {
        toast.error('Failed to update address', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

  }

  const updateCustomerDetails = async (newDetails) => {
    if (state.user) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Update customer in Medusa
        await medusaClient.store.customer.update({ ...newDetails });

        // Get fresh customer data from Medusa
        const userWithUpdatedDetails = await medusaClient.store.customer.retrieve();

        // Create the updated user object with all existing preferences preserved
        const updatedUser = {
          id: userWithUpdatedDetails?.customer?.id,
          email: userWithUpdatedDetails?.customer?.email,
          first_name: userWithUpdatedDetails?.customer?.first_name,
          last_name: userWithUpdatedDetails?.customer?.last_name,
          phone: userWithUpdatedDetails?.customer?.phone,
          company_name: userWithUpdatedDetails?.customer?.company_name,
          addresses: [...(userWithUpdatedDetails?.customer?.addresses || [])],
          preferences: {
            ...state.user.preferences, // Keep existing preferences (like darkMode)
          }
        };

        // Update local state immediately
        dispatch({ type: 'SET_USER', payload: updatedUser });

        // Update localStorage immediately
        localStorage.setItem('medusa-user', JSON.stringify(updatedUser));

        // Update the users preferences storage as well
        const existingUsers = JSON.parse(localStorage.getItem('users') || '{}');
        if (existingUsers[updatedUser.id]) {
          existingUsers[updatedUser.id].preferences = { ...updatedUser.preferences };
          localStorage.setItem('users', JSON.stringify(existingUsers));
        }

        dispatch({ type: 'SET_LOADING', payload: false });
        toast.success('Successfully updated user details!');

        return { customer: updatedUser }; // Return in same format as Medusa
      } catch (error) {
        toast.error('Failed to update customer details', error);
        dispatch({ type: 'SET_LOADING', payload: false });
        throw error;
      }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        preferences: {
          newsletter: true,
          marketing: false,
          darkMode: state.darkMode // ✅ Keep current dark mode setting
        },
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`
      };

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = newUser;

      // Add to mock database
      mockUsers.push(newUser);

      dispatch({ type: 'SET_USER', payload: userWithoutPassword });
      localStorage.setItem('medusa-user', JSON.stringify(userWithoutPassword));

      toast.success('Account created successfully!');
      return userWithoutPassword;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const registerMedusa = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });


      const registerUserResult = await register_(userData?.firstName, userData?.lastName, userData?.email, userData?.password, userData?.phone);
      if (registerUserResult === true) {

        return await loginMedusa(userData?.email, userData?.password);
      } else {
        throw new Error('User with this email already exists');
      }
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('medusa-user');
    toast.success('Successfully logged out!');
    // ✅ Don't change dark mode on logout - keep user's preference
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const logoutMedusa = async () => {
    dispatch({ type: 'LOGOUT' });
    const logoutResult = await logout_();
    localStorage.removeItem('medusa-user');
    resetDarkModeOnLogout();
    toast.success('Successfully logged out!');
    window.location.reload();
    // ✅ Don't change dark mode on logout - keep user's preference
  };

  const updateProfile = async (updatedData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUser = { ...state.user, ...updatedData };

      // Update in mock database
      const userIndex = mockUsers.findIndex(u => u.id === state.user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updatedData };
      }

      dispatch({ type: 'SET_USER', payload: updatedUser });
      localStorage.setItem('medusa-user', JSON.stringify(updatedUser));

      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      toast.error('Failed to update profile');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setRegion = (region) => {
    dispatch({ type: 'SET_REGION', payload: region });
    localStorage.setItem('medusa-region', JSON.stringify(region));
  };

  const toggleDarkMode = () => {
    const newDarkMode = !state.darkMode;
    dispatch({ type: 'SET_DARK_MODE', payload: newDarkMode });

    // ✅ Update user preferences if logged in
    if (state.user) {
      const updatedUser = {
        ...state.user,
        preferences: {
          ...state.user.preferences,
          darkMode: newDarkMode
        }
      };

      // ✅ Update localStorage users preferences
      const existingUsers = JSON.parse(localStorage.getItem('users') || '{}');
      if (existingUsers[updatedUser.id]) {
        existingUsers[updatedUser.id].preferences = { ...updatedUser.preferences };
        localStorage.setItem('users', JSON.stringify(existingUsers));
      }

      dispatch({ type: 'SET_USER', payload: updatedUser });
      localStorage.setItem('medusa-user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    setRegion,
    toggleDarkMode,
    loginMedusa,
    logoutMedusa,
    registerMedusa,
    mockUsers,
    createAddress,
    deleteAddress,
    updateAddress,
    updateCustomerDetails
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};