// components/product/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { addToCart, loading } = useCart();

  const formatPrice = (amount, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount / 100);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultVariant = product.variants?.[0];
    if (!defaultVariant) return;

    const cartItem = {
      id: `${product.id}-${defaultVariant.id}`,
      variant_id: defaultVariant.id,
      product_id: product.id,
      title: product.title,
      thumbnail: product.thumbnail,
      unit_price: defaultVariant.prices?.[0]?.amount || 0,
      quantity: 1
    };

    await addToCart(cartItem);
  };
  
  const price = product.getVariantFormattedPriceByIndex(0);
  const currencyCode = product.variants?.[0]?.prices?.[0]?.currency_code;
  
  return (
    <Link
      to={`/products/${product._handle}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {/* Product Image */}
        <img
          src={product._thumbnail || 'https://via.placeholder.com/400x400'}
          alt={product._title}
          className={`h-full w-full object-cover object-center transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'
            } group-hover:scale-105 transition-transform duration-300`}
          onLoad={() => setImageLoading(false)}
        />

        {/* Loading skeleton */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Quick Add Button */}
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className={`absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-lg transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            } hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          ) : (
            <PlusIcon className="h-5 w-5 text-gray-900" />
          )}
        </button>

        {/* Sale Badge (if applicable) */}
        {product.discount_total && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
          {product._title}
        </h3>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900">
            {price}
          </p>

          {/* Compare at price (if on sale) */}
          
        </div>

        {/* Variants indicator */}
        {product._variants && product._variants.length > 1 && (
          <p className="text-xs text-gray-500">
            {product._variants.length} variants available
          </p>
        )}

        {/* Categories */}
        {product._categories && product._categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product._categories.map((category, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
              >
                {category._name || category._handle}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;