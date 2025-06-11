// components/cart/CartDrawer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, updateCartItemMedusa, removeFromCartMedusa, getCartTotal, clearCartMedusa } = useCart();
  const { region } = useAuth();

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
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <DialogPanel className="pointer-events-auto w-screen max-w-md transform transition-transform">
              <div className="flex h-full flex-col bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                  <button
                    onClick={onClose}
                    className="p-2 -m-2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">Your cart is empty</p>
                      <Link
                        to="/"
                        onClick={onClose}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-colors"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-start space-x-4">
                          <img
                            src={item.thumbnail || 'https://via.placeholder.com/80x80'}
                            alt={item.title}
                            className="h-20 w-20 object-cover rounded-md"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatPrice(item.unit_price)}
                            </p>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center mt-3 space-x-2">
                              <button
                                onClick={() => updateCartItemMedusa(item.id, item.quantity - 1)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                disabled={item.quantity <= 1}
                              >
                                <MinusIcon className="h-4 w-4" />
                              </button>
                              
                              <span className="text-sm font-medium text-center min-w-[2rem]">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => updateCartItemMedusa(item.id, item.quantity + 1)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={() => removeFromCartMedusa(item.id)}
                                className="p-1 text-red-400 hover:text-red-600 ml-4"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(item.unit_price * item.quantity)}
                          </div>
                        </div>
                      ))}
                      
                      {/* Clear Cart Button */}
                      {cartItems.length > 0 && (
                        <button
                          onClick={clearCartMedusa}
                          className="w-full text-sm text-red-600 hover:text-red-800 py-2 border-t border-gray-200 mt-6 pt-6"
                        >
                          Clear Cart
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                  <div className="border-t border-gray-200 px-4 py-6">
                    <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                      <p>Subtotal</p>
                      <p>{formatPrice(cartTotal)}</p>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Shipping and taxes calculated at checkout.
                    </p>
                    <Link
                      to="/cart"
                      onClick={onClose}
                      className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-gray-800 transition-colors"
                    >
                      View Cart
                    </Link>
                    <div className="mt-3 text-center">
                      <Link
                        to="/"
                        onClick={onClose}
                        className="text-sm font-medium text-gray-700 hover:text-gray-900"
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