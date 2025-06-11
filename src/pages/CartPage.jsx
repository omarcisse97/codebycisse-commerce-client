// pages/CartPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MinusIcon, PlusIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
  const { cart, updateCartItemMedusa, removeFromCartMedusa, getCartTotal, clearCartMedusa } = useCart();
  const { region, darkMode } = useAuth();

  const formatPrice = (amount, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount / 100);
  };

  const cartItems = cart?.items || [];
  const cartTotal = getCartTotal();
  const shippingCost = cartTotal > 5000 ? 0 : 500; // Free shipping over $50
  const tax = Math.round(cartTotal * 0.08); // 8% tax
  const finalTotal = cartTotal + shippingCost + tax;

  if (cartItems.length === 0) {
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <ShoppingBagIcon className={`mx-auto h-12 w-12 transition-colors duration-300 ${
            darkMode ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <h1 className={`mt-4 text-3xl font-bold transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Your cart is empty
          </h1>
          <p className={`mt-4 text-lg transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Start shopping to add items to your cart.
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md transition-colors duration-300 ${
                darkMode 
                  ? 'text-black bg-white hover:bg-gray-100' 
                  : 'text-white bg-black hover:bg-gray-800'
              }`}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

return (
  <div className={`min-h-screen transition-colors duration-300 ${
    darkMode ? 'bg-gray-900' : 'bg-white'
  }`}>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className={`text-3xl font-bold mb-8 transition-colors duration-300 ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className={`flex items-start space-x-4 border rounded-lg p-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <img
                  src={item.thumbnail || 'https://via.placeholder.com/120x120'}
                  alt={item.title}
                  className="h-24 w-24 object-cover rounded-md"
                />
                
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-medium transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm mt-1 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {formatPrice(item.unit_price, region?.currency)} each
                  </p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center mt-4 space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartItemMedusa(item.id, item.quantity - 1)}
                        className={`p-1 disabled:opacity-50 transition-colors duration-300 ${
                          darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                        }`}
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      
                      <span className={`text-sm font-medium text-center min-w-[2rem] transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateCartItemMedusa(item.id, item.quantity + 1)}
                        className={`p-1 transition-colors duration-300 ${
                          darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCartMedusa(item.id)}
                      className={`flex items-center text-sm transition-colors duration-300 ${
                        darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                      }`}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className={`text-lg font-medium transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatPrice(item.unit_price * item.quantity, region?.currency )}
                </div>
              </div>
            ))}
            
            {/* Clear Cart */}
            <div className={`flex justify-between items-center pt-6 border-t transition-colors duration-300 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={clearCartMedusa}
                className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                }`}
              >
                Clear entire cart
              </button>
              <Link
                to="/"
                className={`text-sm font-medium transition-colors duration-300 ${
                  darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className={`rounded-lg p-6 sticky top-8 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <h2 className={`text-lg font-medium mb-4 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Order Summary
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className={`transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Subtotal
                </span>
                <span className={`font-medium transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatPrice(cartTotal, region?.currency)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className={`transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Shipping
                </span>
                <span className={`font-medium transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {shippingCost === 0 ? 'Free' : formatPrice(shippingCost, region?.currency)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className={`transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Tax
                </span>
                <span className={`font-medium transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {formatPrice(tax, region?.currency)}
                </span>
              </div>
              
              <div className={`border-t pt-3 transition-colors duration-300 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex justify-between text-base font-medium">
                  <span className={`transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Total
                  </span>
                  <span className={`transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatPrice(finalTotal, region?.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Free shipping notice */}
            {shippingCost > 0 && (
              <div className={`mt-4 p-3 rounded-md transition-colors duration-300 ${
                darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
              }`}>
                <p className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  Add {formatPrice(5000 - cartTotal)} more for free shipping!
                </p>
              </div>
            )}

            {/* Checkout Button */}
            <button className={`w-full mt-6 flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium transition-colors duration-300 ${
              darkMode 
                ? 'text-black bg-white hover:bg-gray-100' 
                : 'text-white bg-black hover:bg-gray-800'
            }`}>
              Proceed to Checkout
            </button>

            {/* Payment Methods */}
            <div className="mt-6">
              <p className={`text-xs text-center mb-3 transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                We accept
              </p>
              <div className="flex justify-center space-x-3">
                <div className={`w-8 h-5 rounded flex items-center justify-center transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <span className={`text-xs font-bold transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    VISA
                  </span>
                </div>
                <div className={`w-8 h-5 rounded flex items-center justify-center transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <span className={`text-xs font-bold transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    MC
                  </span>
                </div>
                <div className={`w-8 h-5 rounded flex items-center justify-center transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <span className={`text-xs font-bold transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    AMEX
                  </span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <p className={`text-xs text-center mt-4 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default CartPage;