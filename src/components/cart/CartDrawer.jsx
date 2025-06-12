// components/cart/CartDrawer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, updateCartItemMedusa, removeFromCartMedusa, getCartTotal, clearCartMedusa } = useCart();
  const { region, darkMode } = useAuth();

  const formatPrice = (amount, currencyCode = region?.currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount / 100);
  };

  const cartItems = cart?.items || [];
  const cartTotal = getCartTotal();

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
            <DialogPanel className="pointer-events-auto w-screen max-w-xs sm:max-w-sm md:max-w-md transform transition-transform duration-300 ease-in-out">
              <div className={`flex h-full flex-col shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                
                {/* Header */}
                <div className={`flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-base sm:text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Shopping Cart
                  </h2>
                  <button
                    onClick={onClose}
                    className={`p-1.5 sm:p-2 -m-1.5 sm:-m-2 transition-all duration-200 rounded-lg hover:scale-110 active:scale-95 ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    aria-label="Close cart"
                  >
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="mb-4">
                        <div className={`mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <svg className={`h-8 w-8 sm:h-10 sm:w-10 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                      </div>
                      <p className={`text-sm sm:text-base mb-4 sm:mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Your cart is empty
                      </p>
                      <Link
                        to="/"
                        onClick={onClose}
                        className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${darkMode ? 'text-black bg-white hover:bg-gray-100' : 'text-white bg-black hover:bg-gray-800'}`}
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      {cartItems.map((item) => (
                        <div key={item.id} className={`flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg transition-colors ${darkMode ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.thumbnail || 'https://via.placeholder.com/80x80'}
                              alt={item.title}
                              className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-md"
                              loading="lazy"
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-sm sm:text-base font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.title}
                            </h3>
                            <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatPrice(item.unit_price)}
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center mt-2 sm:mt-3 space-x-2">
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <button
                                  onClick={() => updateCartItemMedusa(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className={`p-1 sm:p-1.5 rounded transition-all duration-200 hover:scale-110 active:scale-95 ${
                                    item.quantity <= 1 
                                      ? darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                                      : darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                                  }`}
                                  aria-label="Decrease quantity"
                                >
                                  <MinusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                                
                                <span className={`text-xs sm:text-sm font-medium text-center min-w-[1.5rem] sm:min-w-[2rem] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {item.quantity}
                                </span>
                                
                                <button
                                  onClick={() => updateCartItemMedusa(item.id, item.quantity + 1)}
                                  className={`p-1 sm:p-1.5 rounded transition-all duration-200 hover:scale-110 active:scale-95 ${darkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                                  aria-label="Increase quantity"
                                >
                                  <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                              </div>
                              
                              <button
                                onClick={() => removeFromCartMedusa(item.id)}
                                className={`p-1 sm:p-1.5 ml-3 sm:ml-4 rounded transition-all duration-200 hover:scale-110 active:scale-95 ${darkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                                aria-label="Remove item"
                              >
                                <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Item Total */}
                          <div className="text-right flex-shrink-0">
                            <div className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatPrice(item.unit_price * item.quantity)}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Clear Cart Button */}
                      {cartItems.length > 0 && (
                        <button
                          onClick={clearCartMedusa}
                          className={`w-full text-xs sm:text-sm py-2 sm:py-3 border-t mt-4 sm:mt-6 pt-4 sm:pt-6 transition-all duration-200 hover:scale-105 active:scale-95 ${darkMode ? 'text-red-400 hover:text-red-300 border-gray-700' : 'text-red-600 hover:text-red-800 border-gray-200'}`}
                        >
                          Clear Cart
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                  <div className={`border-t px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                    
                    {/* Subtotal */}
                    <div className={`flex justify-between text-sm sm:text-base font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <p>Subtotal</p>
                      <p>{formatPrice(cartTotal)}</p>
                    </div>
                    
                    {/* Shipping Notice */}
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Shipping and taxes calculated at checkout.
                    </p>
                    
                    {/* View Cart Button */}
                    <Link
                      to="/cart"
                      onClick={onClose}
                      className={`w-full flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${darkMode ? 'text-black bg-white hover:bg-gray-100' : 'text-white bg-black hover:bg-gray-800'}`}
                    >
                      View Cart
                    </Link>
                    
                    {/* Continue Shopping Link */}
                    <div className="text-center">
                      <Link
                        to="/"
                        onClick={onClose}
                        className={`text-xs sm:text-sm font-medium transition-colors duration-200 hover:scale-105 inline-block ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CartDrawer;