// components/account/AddressSettings.jsx
import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';


const getCountry_code_name = (request, value) => {
  const allCountryCodes = [
    "AF", "AX", "AL", "DZ", "AS", "AD", "AO", "AI", "AQ", "AG", "AR", "AM", "AW", "AU", "AT", "AZ",
    "BS", "BH", "BD", "BB", "BY", "BE", "BZ", "BJ", "BM", "BT", "BO", "BQ", "BA", "BW", "BV", "BR",
    "IO", "BN", "BG", "BF", "BI", "KH", "CM", "CA", "CV", "KY", "CF", "TD", "CL", "CN", "CX", "CC",
    "CO", "KM", "CG", "CD", "CK", "CR", "CI", "HR", "CU", "CW", "CY", "CZ", "DK", "DJ", "DM", "DO",
    "EC", "EG", "SV", "GQ", "ER", "EE", "SZ", "ET", "FK", "FO", "FJ", "FI", "FR", "GF", "PF", "TF",
    "GA", "GM", "GE", "DE", "GH", "GI", "GR", "GL", "GD", "GP", "GU", "GT", "GG", "GN", "GW", "GY",
    "HT", "HM", "VA", "HN", "HK", "HU", "IS", "IN", "ID", "IR", "IQ", "IE", "IM", "IL", "IT", "JM",
    "JP", "JE", "JO", "KZ", "KE", "KI", "KP", "KR", "KW", "KG", "LA", "LV", "LB", "LS", "LR", "LY",
    "LI", "LT", "LU", "MO", "MG", "MW", "MY", "MV", "ML", "MT", "MH", "MQ", "MR", "MU", "YT", "MX",
    "FM", "MD", "MC", "MN", "ME", "MS", "MA", "MZ", "MM", "NA", "NR", "NP", "NL", "NC", "NZ", "NI",
    "NE", "NG", "NU", "NF", "MK", "MP", "NO", "OM", "PK", "PW", "PS", "PA", "PG", "PY", "PE", "PH",
    "PN", "PL", "PT", "PR", "QA", "RE", "RO", "RU", "RW", "BL", "SH", "KN", "LC", "MF", "PM", "VC",
    "WS", "SM", "ST", "SA", "SN", "RS", "SC", "SL", "SG", "SX", "SK", "SI", "SB", "SO", "ZA", "GS",
    "SS", "ES", "LK", "SD", "SR", "SJ", "SE", "CH", "SY", "TW", "TJ", "TZ", "TH", "TL", "TG", "TK",
    "TO", "TT", "TN", "TR", "TM", "TC", "TV", "UG", "UA", "AE", "GB", "US", "UM", "UY", "UZ", "VU",
    "VE", "VN", "VG", "VI", "WF", "EH", "YE", "ZM", "ZW"
  ];
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });


  switch (request.toLowerCase()) {
    case 'name':
      if (value.length > 2) {
        return '';
      }


      return regionNames.of(value.toUpperCase()) || null;
    case 'code':
      const countryNameToCodeMap = Object.fromEntries(
        allCountryCodes.map(code => [regionNames.of(code).toLowerCase(), code])
      );

      if (countryNameToCodeMap[value.toLowerCase()]) {

        return countryNameToCodeMap[value.toLowerCase()];
      }
      return null;
    default:
      return null;

  }

};

const AddressSettings = () => {
  const { user, updateProfile, loading, darkMode, createAddress, deleteAddress, updateAddress } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    address_name: '',
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    province: '',
    postal_code: '',
    country_code: '',
    phone: '',
    is_default_shipping: false,
    is_default_billing: false
  });
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, addressId: null, addressName: '' });

  // Get addresses from user profile, default to empty array
  const addresses = user.addresses || [];

  // Country options


  const resetForm = () => {
    setFormData({
      id: null,
      address_name: '',
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      province: '',
      postal_code: '',
      country_code: '',
      phone: '',
      is_default_shipping: false,
      is_default_billing: false
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let sanitizedValue = value;

    // Input sanitization
    switch (name) {
      case 'first_name':
      case 'last_name':
        sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
        break;
      case 'city':
        sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
        break;
      case 'postal_code':
        sanitizedValue = value.replace(/[^a-zA-Z0-9\s-]/g, '');
        break;
      case 'phone':
        sanitizedValue = value.replace(/[^0-9\s()+-]/g, '');
        break;
      case 'country':
        sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
        break;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : sanitizedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.address_name.trim()) {
      newErrors.address_name = 'Address name is required';
    } else if (formData.address_name.trim().length < 2) {
      newErrors.address_name = 'Address name must be at least 2 characters';
    }

    // Check for duplicate address name
    const duplicateName = addresses.find(addr =>
      addr.address_name?.toLowerCase() === formData.address_name.toLowerCase() &&
      addr.id !== editingId
    );
    if (duplicateName) {
      newErrors.address_name = 'This address name already exists';
    }

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

    if (!formData.address_1.trim()) {
      newErrors.address_1 = 'Street address is required';
    } else if (formData.address_1.trim().length < 5) {
      newErrors.address_1 = 'Street address must be at least 5 characters';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (!/^[a-zA-Z\s'-]{2,}$/.test(formData.city.trim())) {
      newErrors.city = 'Please enter a valid city name';
    }

    //test country
    if (!formData.country_code.trim()) {
      newErrors.country_code = 'Country is required';
    } else if (!/^[a-zA-Z\s'-]{2,}$/.test(formData.country_code.trim())) {
      newErrors.country_code = 'Please enter a valid country';
    } else if (!getCountry_code_name("code", formData.country_code)) {
      newErrors.country_code = `Country "${formData.country_code}" does not exist`;
    }

    if (formData.phone && formData.phone.trim()) {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        newErrors.phone = 'Please enter a valid phone number';
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
      let updatedAddresses = [...addresses];

      if (editingId) {
        // Update existing address
        const index = updatedAddresses.findIndex(addr => addr.id === editingId);

        if (index !== -1) {
          const tmp = { ...updatedAddresses[index] };

          // Convert the country name from the form back to a 2-letter country code
          const countryCode = getCountry_code_name('code', formData.country_code);

          const updatedtmp = {
            ...tmp,
            ...formData,
            country_code: countryCode, // Use the converted country code from formData
            id: editingId,
            updated_at: new Date().toISOString(),
          };

          
          const result = await updateAddress(updatedtmp);
          if (result) {
            await updateProfile({ addresses: result?.addresses });
          }
        }
      } else {
        // Add new address
        const newAddressRaw = { ...formData };
        newAddressRaw.country_code = getCountry_code_name('code', formData.country_code);
        const newAddress = {
          ...newAddressRaw,
          customer_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          metadata: null
        };
        
        const result = await createAddress({ ...newAddress });

        if (result && result?.addresses) {
         
          await updateProfile({ addresses: result?.addresses });
        }
      }

      resetForm();
      setIsAdding(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving address:', error);
      setErrors({ submit: 'Failed to save address. Please try again.' });
    }
  };

  const handleEdit = (address) => {
    

    // Get the country name for display in the form
    const countryName = getCountry_code_name('name', address.country_code);
    

    setFormData({
      ...address,
      // Ensure we have all required fields with defaults
      address_name: address.address_name || '',
      first_name: address.first_name || '',
      last_name: address.last_name || '',
      company: address.company || '',
      address_1: address.address_1 || '',
      address_2: address.address_2 || '',
      city: address.city || '',
      province: address.province || '',
      postal_code: address.postal_code || '',
      country_code: countryName || 'United States', // This should be the country NAME for the form
      phone: address.phone || '',
      is_default_shipping: address.is_default_shipping || false,
      is_default_billing: address.is_default_billing || false
    });
    setEditingId(address.id);
    setIsAdding(true);
  };

  const handleDelete = (address) => {
    setDeleteConfirm({
      isOpen: true,
      addressId: address.id,
      addressName: address.address_name || 'this address'
    });
  };

  const confirmDelete = async () => {
    try {
      const result = await deleteAddress(deleteConfirm.addressId);
      if (result) {
        await updateProfile({ addresses: result?.addresses });
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setDeleteConfirm({ isOpen: false, addressId: null, addressName: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, addressId: null, addressName: '' });
  };



  const handleCancel = () => {
    resetForm();
    setIsAdding(false);
    setEditingId(null);
  };


  const renderAddressCard = (address) => (
    <div key={address.id} className={`rounded-lg p-4 border transition-colors duration-300 ${(address.is_default_shipping || address.is_default_billing)
      ? darkMode ? 'border-white bg-gray-700' : 'border-black bg-gray-50'
      : darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
      }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className={`font-medium transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'
              }`}>
              {address.address_name || 'Unnamed Address'}
            </h4>

          </div>

          <div className="space-y-1">
            <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              {address.first_name} {address.last_name}
            </p>
            {address.company && (
              <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                {address.company}
              </p>
            )}
            <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              {address.address_1}
            </p>
            {address.address_2 && (
              <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                {address.address_2}
              </p>
            )}
            <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              {address.city}{address.province && `, ${address.province}`} {address.postal_code}
            </p>
            <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
              {getCountry_code_name('name', address.country_code)}
            </p>
            {address.phone && (
              <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                {address.phone}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-4">
          {/* Set Default Shipping */}




          <button
            onClick={() => handleEdit(address)}
            className={`p-2 rounded-md text-sm transition-colors duration-300 ${darkMode
              ? 'text-gray-400 hover:text-white hover:bg-gray-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            title="Edit address"
          >
            <PencilIcon className="h-4 w-4" />
          </button>

          <button
            onClick={() => handleDelete(address)}
            className={`p-2 rounded-md text-sm transition-colors duration-300 ${darkMode
              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
              : 'text-red-500 hover:text-red-700 hover:bg-red-50'
              }`}
            title="Delete address"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-medium transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'
          }`}>
          Your Addresses
        </h3>
        {!isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-300 ${darkMode
              ? 'bg-white text-black hover:bg-gray-100'
              : 'bg-black text-white hover:bg-gray-800'
              }`}
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Address</span>
          </button>
        )}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className={`rounded-md p-3 ${darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
          }`}>
          <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            {errors.submit}
          </p>
        </div>
      )}

      {/* Address List */}
      {addresses.length > 0 && !isAdding && (
        <div className="space-y-3">
          {addresses.map(renderAddressCard)}
        </div>
      )}

      {/* Empty State */}
      {addresses.length === 0 && !isAdding && (
        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${darkMode ? 'border-gray-600' : 'border-gray-300'
          }`}>
          <div className="flex flex-col items-center">
            <PlusIcon className={`h-12 w-12 mb-4 transition-colors duration-300 ${darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
            <h4 className={`text-lg font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'
              }`}>
              No addresses added
            </h4>
            <p className={`text-sm mb-4 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
              Add your first address for faster checkout
            </p>
            <button
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className={`px-4 py-2 rounded-md transition-colors duration-300 ${darkMode
                ? 'bg-white text-black hover:bg-gray-100'
                : 'bg-black text-white hover:bg-gray-800'
                }`}
            >
              Add Address
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className={`rounded-lg border p-6 transition-colors duration-300 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
          }`}>
          <h4 className={`text-lg font-medium mb-4 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'
            }`}>
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address Name */}
            <div>
              <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Address Name
              </label>
              <input
                type="text"
                name="address_name"
                value={formData.address_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.address_name
                  ? darkMode ? 'border-red-400' : 'border-red-500'
                  : darkMode ? 'border-gray-600' : 'border-gray-300'
                  } ${darkMode ? 'text-white bg-gray-800' : 'text-gray-900 bg-white'
                  } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                  }`}
                placeholder="Home, Work, etc."
              />
              {errors.address_name && (
                <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
                  }`}>
                  {errors.address_name}
                </p>
              )}
            </div>

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
                  className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.first_name
                    ? darkMode ? 'border-red-400' : 'border-red-500'
                    : darkMode ? 'border-gray-600' : 'border-gray-300'
                    } ${darkMode ? 'text-white bg-gray-800' : 'text-gray-900 bg-white'
                    } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                    }`}
                  placeholder="John"
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
                  className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.last_name
                    ? darkMode ? 'border-red-400' : 'border-red-500'
                    : darkMode ? 'border-gray-600' : 'border-gray-300'
                    } ${darkMode ? 'text-white bg-gray-800' : 'text-gray-900 bg-white'
                    } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                    }`}
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
                    }`}>
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            {/* Company (Optional) */}
            <div>
              <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Company <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${darkMode ? 'border-gray-600 text-white bg-gray-800' : 'border-gray-300 text-gray-900 bg-white'
                  } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                  }`}
                placeholder="Company Name"
              />
            </div>

            {/* Address Lines */}
            <div>
              <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Address Line 1
              </label>
              <input
                type="text"
                name="address_1"
                value={formData.address_1}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.address_1
                  ? darkMode ? 'border-red-400' : 'border-red-500'
                  : darkMode ? 'border-gray-600' : 'border-gray-300'
                  } ${darkMode ? 'text-white bg-gray-800' : 'text-gray-900 bg-white'
                  } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                  }`}
                placeholder="1780 Welham St"
              />
              {errors.address_1 && (
                <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
                  }`}>
                  {errors.address_1}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Address Line 2 <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                name="address_2"
                value={formData.address_2}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${darkMode ? 'border-gray-600 text-white bg-gray-800' : 'border-gray-300 text-gray-900 bg-white'
                  } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                  }`}
                placeholder="Apt 335, Suite 100, etc."
              />
            </div>

            {/* City and Province */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.city
                    ? darkMode ? 'border-red-400' : 'border-red-500'
                    : darkMode ? 'border-gray-600' : 'border-gray-300'
                    } ${darkMode ? 'text-white bg-gray-800' : 'text-gray-900 bg-white'
                    } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                    }`}
                  placeholder="Orlando"
                />
                {errors.city && (
                  <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
                    }`}>
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  State/Province
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${darkMode ? 'border-gray-600 text-white bg-gray-800' : 'border-gray-300 text-gray-900 bg-white'
                    } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                    }`}
                  placeholder="Florida"
                />
              </div>
            </div>

            {/* Postal Code and Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.postal_code
                    ? darkMode ? 'border-red-400' : 'border-red-500'
                    : darkMode ? 'border-gray-600' : 'border-gray-300'
                    } ${darkMode ? 'text-white bg-gray-800' : 'text-gray-900 bg-white'
                    } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                    }`}
                  placeholder="32814"
                />
                {errors.postal_code && (
                  <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
                    }`}>
                    {errors.postal_code}
                  </p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Country
                </label>
                <input
                  type="text"
                  name="country_code"
                  value={formData.country_code}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.country_code
                    ? darkMode ? 'border-red-400' : 'border-red-500'
                    : darkMode ? 'border-gray-600' : 'border-gray-300'
                    } ${darkMode ? 'text-white bg-gray-800' : 'text-gray-900 bg-white'
                    } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                    }`}
                  placeholder="Enter country"
                />
                {errors.country_code && (
                  <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
                    }`}>
                    {errors.country_code}
                  </p>
                )}
              </div>

            </div>

            {/* Phone */}
            <div>
              <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                Phone <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md transition-colors duration-300 ${errors.phone
                  ? darkMode ? 'border-red-400' : 'border-red-500'
                  : darkMode ? 'border-gray-600' : 'border-gray-300'
                  } ${darkMode ? 'text-white bg-gray-800' : 'text-gray-900 bg-white'
                  } ${darkMode ? 'focus:outline-none focus:ring-2 focus:ring-white' : 'focus:outline-none focus:ring-2 focus:ring-black'
                  }`}
                placeholder="(321) 387-9002"
              />
              {errors.phone && (
                <p className={`mt-1 text-sm transition-colors duration-300 ${darkMode ? 'text-red-400' : 'text-red-500'
                  }`}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className={`px-4 py-2 border rounded-md transition-colors duration-300 ${darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-600'
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
                {loading ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
            onClick={cancelDelete}
          />

          {/* Modal */}
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl transition-all duration-300 transform ${darkMode
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
            }`}>
            {/* Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'
                  }`}>
                  <TrashIcon className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-500'
                    }`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    Delete Address
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                Are you sure you want to delete{' '}
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                  "{deleteConfirm.addressName}"
                </span>
                ? This will permanently remove this address from your account.
              </p>
            </div>

            {/* Actions */}
            <div className={`px-6 py-4 border-t flex space-x-3 ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'
              }`}>
              <button
                onClick={cancelDelete}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${darkMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
              >
                {loading ? 'Deleting...' : 'Delete Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSettings;