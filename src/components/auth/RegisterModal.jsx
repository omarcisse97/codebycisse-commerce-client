// components/auth/RegisterModal.jsx
import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { medusaClient } from '../../utils/client';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { registerMedusa, loading, darkMode, region } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { setCartForCustomer, initMedusaCart } = useCart();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const { confirmPassword, ...userData } = formData;
      await registerMedusa(userData);
      if (localStorage.getItem('medusa_cart_id')) {
        localStorage.removeItem('medusa_cart_id');
      }
      const customer_new = await medusaClient.store.customer.retrieve({ fields: 'id' });
      if (customer_new) {
        await setCartForCustomer(customer_new?.customer?.id, region);
      } else {
        await initMedusaCart({ region_id: region?.code });
      }
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 lg:p-6">
        <DialogPanel className={`w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-lg sm:rounded-xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          
          {/* Header */}
          <div className={`flex items-center justify-between p-4 sm:p-5 lg:p-6 border-b transition-colors duration-300 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg sm:text-xl lg:text-2xl font-semibold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Create Account
            </h2>
            <button
              onClick={handleClose}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${darkMode
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-5 lg:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                      errors.firstName
                        ? darkMode ? 'border-red-400 focus:ring-red-400' : 'border-red-500 focus:ring-red-500'
                        : darkMode ? 'border-gray-600 focus:ring-white' : 'border-gray-300 focus:ring-black'
                    } ${darkMode ? 'text-white bg-gray-700 placeholder-gray-400' : 'text-gray-900 bg-white placeholder-gray-500'}`}
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className={`mt-1 text-xs sm:text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                      errors.lastName
                        ? darkMode ? 'border-red-400 focus:ring-red-400' : 'border-red-500 focus:ring-red-500'
                        : darkMode ? 'border-gray-600 focus:ring-white' : 'border-gray-300 focus:ring-black'
                    } ${darkMode ? 'text-white bg-gray-700 placeholder-gray-400' : 'text-gray-900 bg-white placeholder-gray-500'}`}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className={`mt-1 text-xs sm:text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? darkMode ? 'border-red-400 focus:ring-red-400' : 'border-red-500 focus:ring-red-500'
                      : darkMode ? 'border-gray-600 focus:ring-white' : 'border-gray-300 focus:ring-black'
                  } ${darkMode ? 'text-white bg-gray-700 placeholder-gray-400' : 'text-gray-900 bg-white placeholder-gray-500'}`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className={`mt-1 text-xs sm:text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>(Optional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${darkMode ? 'border-gray-600 text-white bg-gray-700 placeholder-gray-400 focus:ring-white' : 'border-gray-300 text-gray-900 bg-white placeholder-gray-500 focus:ring-black'}`}
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Password */}
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-12 text-sm sm:text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                      errors.password
                        ? darkMode ? 'border-red-400 focus:ring-red-400' : 'border-red-500 focus:ring-red-500'
                        : darkMode ? 'border-gray-600 focus:ring-white' : 'border-gray-300 focus:ring-black'
                    } ${darkMode ? 'text-white bg-gray-700 placeholder-gray-400' : 'text-gray-900 bg-white placeholder-gray-500'}`}
                    placeholder="Create a secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-all duration-200 hover:scale-110 active:scale-95 ${darkMode
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className={`mt-1 text-xs sm:text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 sm:pr-12 text-sm sm:text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                      errors.confirmPassword
                        ? darkMode ? 'border-red-400 focus:ring-red-400' : 'border-red-500 focus:ring-red-500'
                        : darkMode ? 'border-gray-600 focus:ring-white' : 'border-gray-300 focus:ring-black'
                    } ${darkMode ? 'text-white bg-gray-700 placeholder-gray-400' : 'text-gray-900 bg-white placeholder-gray-500'}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-all duration-200 hover:scale-110 active:scale-95 ${darkMode
                        ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className={`mt-1 text-xs sm:text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 sm:py-3 lg:py-4 px-4 sm:px-6 text-sm sm:text-base lg:text-lg font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${darkMode
                    ? 'bg-white text-black hover:bg-gray-100 disabled:bg-gray-300'
                    : 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-600'
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className={`animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 mr-2 sm:mr-3 ${darkMode ? 'border-black' : 'border-white'}`}></div>
                    <span className="text-sm sm:text-base">Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <div className="mt-4 sm:mt-6 text-center">
              <p className={`text-xs sm:text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Already have an account?{' '}
                <button
                  onClick={onSwitchToLogin}
                  className={`font-medium hover:underline transition-all duration-200 hover:scale-105 inline-block ${darkMode ? 'text-white hover:text-gray-100' : 'text-black hover:text-gray-800'}`}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default RegisterModal;