// components/auth/LoginModal.jsx
import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { medusaClient } from '../../utils/client';
import { useCart } from '../../contexts/CartContext';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { login, loading, loginMedusa, darkMode, region } = useAuth();
  const { setCartForCustomer } = useCart();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

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

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await loginMedusa(formData.email, formData.password);
      const user_id = await medusaClient.store.customer.retrieve({ fields: 'id' });
      await setCartForCustomer(user_id?.customer?.id, region);
      onClose();
      setFormData({ email: '', password: '' });
      setErrors({});
    } catch (error) {
      // Error handling is done in the login function
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({ email: '', password: '' });
    setErrors({});
    setShowPassword(false);
  };

  // Demo credentials info
  const demoCredentials = [
    { email: 'john@example.com', password: 'password123' },
    { email: 'jane@example.com', password: 'password456' }
  ];

  const fillDemoCredentials = (credentials) => {
    setFormData(credentials);
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className={`w-full max-w-md rounded-lg shadow-2xl transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
          <div className={`flex items-center justify-between p-6 border-b transition-colors duration-300 ${darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <h2 className={`text-xl font-semibold transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'
              }`}>
              Sign In
            </h2>
            <button
              onClick={handleClose}
              className={`p-2 transition-colors duration-300 ${darkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.email
                      ? darkMode ? 'border-red-400' : 'border-red-500'
                      : darkMode ? 'border-gray-600' : 'border-gray-300'
                    } ${darkMode ? 'text-white bg-gray-700' : 'text-gray-900 bg-white'
                    } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                    }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
                    }`}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 pr-10 border rounded-md transition-colors duration-300 ${errors.password
                        ? darkMode ? 'border-red-400' : 'border-red-500'
                        : darkMode ? 'border-gray-600' : 'border-gray-300'
                      } ${darkMode ? 'text-white bg-gray-700' : 'text-gray-900 bg-white'
                      } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                      }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${darkMode
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
                    }`}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 font-medium rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${darkMode
                    ? 'bg-white text-black hover:bg-gray-100'
                    : 'bg-black text-white hover:bg-gray-800'
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className={`animate-spin rounded-full h-4 w-4 border-b-2 mr-2 ${darkMode ? 'border-black' : 'border-white'
                      }`}></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Switch to Register */}
            <div className="mt-6 text-center">
              <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToRegister}
                  className={`font-medium hover:underline transition-colors duration-300 ${darkMode ? 'text-white' : 'text-black'
                    }`}
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default LoginModal;