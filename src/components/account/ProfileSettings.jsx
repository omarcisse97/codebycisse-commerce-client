import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfileSettings = () => {
  const { user, updateProfile, loading, darkMode, updateCustomerDetails } = useAuth();
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone: user.phone || '',
    company_name: user.company_name || ''
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

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

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (!/^[a-zA-Z\s'-]{2,}$/.test(formData.first_name.trim())) {
      newErrors.first_name = 'Please enter a valid first name';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (!/^[a-zA-Z\s'-]{2,}$/.test(formData.last_name.trim())) {
      newErrors.last_name = 'Please enter a valid last name';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (formData.company_name.trim()) {
      if (!/^[a-zA-Z\s'-]{2,}$/.test(formData.company_name.trim())) {
        newErrors.company_name = 'Please enter a valid company name or leave blank';
      }
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
      // Remove email from updates since it can't be changed
      const { email, ...updateData } = formData;

      console.log('Final data being sent to API:', updateData);

      // Update customer details in Medusa and get updated user
      const result = await updateCustomerDetails(updateData);

      // The updateProfile function is no longer needed since updateCustomerDetails 
      // already updates the local state and localStorage
      // await updateProfile(result); // Remove this line

      setIsEditing(false);
      setErrors({});
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setErrors({ submit: 'Failed to save changes. Please try again.' });
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  // Generate initials for avatar (consistent with Header)
  const getInitials = () => {
    const first_name = formData.first_name || user.first_name || '';
    const last_name = formData.last_name || user.last_name || '';

    return ((first_name?.[0] || '') + (last_name?.[0] || '')).toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${formData.first_name || user.first_name} ${formData.last_name || user.last_name}`}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className={`h-24 w-24 rounded-full flex items-center justify-center text-white text-2xl font-semibold ${darkMode ? 'bg-gray-600' : 'bg-gray-400'
              }`}>
              {getInitials()}
            </div>
          )}
        </div>

        <div>
          <h3 className={`text-lg font-medium transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'
            }`}>
            Profile Picture
          </h3>
          <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
            {user.avatar ? 'Click to change your profile picture' : 'Your initials are displayed as your avatar'}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.first_name
                ? darkMode ? 'border-red-400' : 'border-red-500'
                : darkMode ? 'border-gray-600' : 'border-gray-300'
                } ${darkMode ? 'text-white bg-gray-700' : 'text-gray-900 bg-white'
                } ${!isEditing
                  ? darkMode ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-50 cursor-not-allowed'
                  : darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                }`}
            />
            {errors.first_name && (
              <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
                }`}>
                {errors.first_name}
              </p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.last_name
                ? darkMode ? 'border-red-400' : 'border-red-500'
                : darkMode ? 'border-gray-600' : 'border-gray-300'
                } ${darkMode ? 'text-white bg-gray-700' : 'text-gray-900 bg-white'
                } ${!isEditing
                  ? darkMode ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-50 cursor-not-allowed'
                  : darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                }`}
            />
            {errors.last_name && (
              <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
                }`}>
                {errors.last_name}
              </p>
            )}
          </div>
        </div>

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
            disabled="disabled"
            className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.email
              ? darkMode ? 'border-red-400' : 'border-red-500'
              : darkMode ? 'border-gray-600' : 'border-gray-300'
              } ${darkMode ? 'text-white bg-gray-700' : 'text-gray-900 bg-white'
              } ${!isEditing
                ? darkMode ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-50 cursor-not-allowed'
                : darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
              }`}
          />
          <p className={`mt-2 text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
            Email cannot be changed. Contact support if you need to update your email address.
          </p>
          {errors.email && (
            <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
              }`}>
              {errors.email}
            </p>
          )}
        </div>
        {/* Company */}
        <div>
          <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Company
          </label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.company_name
              ? darkMode ? 'border-red-400' : 'border-red-500'
              : darkMode ? 'border-gray-600' : 'border-gray-300'
              } ${darkMode ? 'text-white bg-gray-700' : 'text-gray-900 bg-white'
              } ${!isEditing
                ? darkMode ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-50 cursor-not-allowed'
                : darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
              }`}
          />
          {errors.company_name && (
            <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
              }`}>
              {errors.company_name}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${darkMode ? 'border-gray-600 text-white bg-gray-700' : 'border-gray-300 text-gray-900 bg-white'
              } ${!isEditing
                ? darkMode ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-50 cursor-not-allowed'
                : darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
              }`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={`px-4 py-2 rounded-md transition-colors duration-300 ${darkMode
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-black text-white hover:bg-gray-800'
                }`}
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className={`px-4 py-2 border rounded-md transition-colors duration-300 ${darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${darkMode
                  ? 'bg-white text-black hover:bg-gray-100'
                  : 'bg-black text-white hover:bg-gray-800'
                  }`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;