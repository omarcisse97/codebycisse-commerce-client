// pages/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeftIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useCart } from '../contexts/CartContext';
import { useSearch } from '../contexts/SearchContext';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { medusaClient } from '../utils/client';


const ProductPage = () => {
  const { handle } = useParams();
  const { mockProducts } = useSearch();
  const { addToCart, loading, addToCartMedusa } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pageLoading, setPageLoading] = useState(true);
  const [productMedusa, setProductMedusa] = useState(null);
  const { region } = useAuth();

  useEffect(() => {
    // Find product by handle
    const foundProduct = mockProducts.find(p => p.handle === handle);
    if (foundProduct) {
      // Add additional product details for demo
      const enhancedProduct = {
        ...foundProduct,
        description: `Experience the perfect blend of comfort and style with the ${foundProduct.title}. Crafted with premium materials and attention to detail, this product is designed to elevate your everyday wardrobe.`,
        images: [
          foundProduct.thumbnail,
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop'
        ],
        features: [
          'Premium quality materials',
          'Comfortable fit',
          'Durable construction',
          'Easy care instructions'
        ],
        rating: 4.5,
        reviewCount: 127
      };
      setProduct(enhancedProduct);

    }
    setPageLoading(false);
    const loadProduct = async () => {

      const result = await medusaClient.store.product.list({ handle: handle, region_id: region?.code, fields: '*categories' });
     
      if (result && result?.count === 1) {
        const id_ = result?.products[0]?.id || ''
        const title_ = result?.products[0]?.title || '';
        const handle_ = result?.products[0]?.handle || '';
        const thumbnail_ = result?.products[0]?.thumbnail || '';
        const variants_ = [];
        if (result?.products[0].variants && result?.products[0].variants.length > 0) {
          for (let i = 0; i < result?.products[0].variants?.length; i++) {
            const variant_title_ = result?.products[0].variants[i]?.title || '';
            const variant_id_ = result?.products[0].variants[i]?.id || '';
            const variant_price_ = [
              {
                amount: result?.products[0].variants[i]?.calculated_price?.calculated_amount,
                currency_code: result?.products[0].variants[i]?.calculated_price?.currency_code
              }
            ];
            variants_.push({
              id: variant_id_,
              title: variant_title_,
              prices: [...variant_price_]
            });

          }
        }
        const categories_ = [];
        if (result?.products[0]?.categories && result?.products[0]?.categories?.length > 0) {
          for (let i = 0; i < result?.products[0]?.categories?.length; i++) {
            categories_.push({
              value: result?.products[0]?.categories[i]?.handle,
              label: result?.products[0]?.categories[i]?.name,
              href: `/${result?.products[0]?.categories[i]?.handle}`,
              id: result?.products[0]?.categories[i]?.id
            })
          }
        }
        const returnVal = {
          id: id_,
          title: title_,
          handle: handle_,
          thumbnail: thumbnail_,
          variants: [...variants_],
          categories: [...categories_],
          images: [...result?.products[0]?.images] || [],
          description: result?.products[0]?.description || ''
        }

        setProductMedusa(returnVal);
        setSelectedVariant(returnVal?.variants[0]);
      }

    };

    if (handle && region && region?.code) {
      if (!pageLoading) {
        setPageLoading(true);
      }
      loadProduct();
    }
  }, [handle, mockProducts, region]);

  useEffect(() => {
    if (productMedusa) {
      setPageLoading(false);
    }
  }, [productMedusa])

  const formatPrice = (amount, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount / 100);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    const cartItem = {
      id: `${productMedusa.id}-${selectedVariant.id}`,
      variant_id: selectedVariant.id,
      product_id: productMedusa.id,
      title: productMedusa.title,
      thumbnail: productMedusa.thumbnail,
      unit_price: selectedVariant.prices?.[0]?.amount || 0,
      quantity: quantity
    };

    await addToCartMedusa(cartItem);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <div key={i} className="relative">
        {i < Math.floor(rating) ? (
          <StarIconSolid className="h-5 w-5 text-yellow-400" />
        ) : i < rating ? (
          <div className="relative">
            <StarIcon className="h-5 w-5 text-gray-300" />
            <StarIconSolid
              className="h-5 w-5 text-yellow-400 absolute top-0 left-0"
              style={{ clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)` }}
            />
          </div>
        ) : (
          <StarIcon className="h-5 w-5 text-gray-300" />
        )}
      </div>
    ));
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-6 w-24 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!productMedusa) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <ChevronLeftIcon className="h-4 w-4 rotate-180" />
          <span className="text-gray-900">{productMedusa.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 max-w-md mx-auto lg:mx-0">
              <img
                src={productMedusa?.images?.[selectedImage]?.url || productMedusa?.thumbnail}
                alt={productMedusa?.title}
                className="h-full w-full object-cover object-center"
              />
            </div>

            {/* Image thumbnails - Horizontal scroll */}
            {productMedusa?.images && productMedusa?.images?.length > 1 && (
              <div className="max-w-md mx-auto lg:mx-0">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {productMedusa.images.map((image, index) => (
                    <button
                      key={image?.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded-md bg-gray-100 ${
                        selectedImage === index ? 'ring-2 ring-black' : ''
                      }`}
                    >
                      <img
                        src={image?.url}
                        alt={`${image?.id}`}
                        className="h-full w-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{productMedusa?.title}</h1>

              {/* Rating */}
              {/* <div className="mt-3 flex items-center space-x-2">
                <div className="flex items-center">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div> */}
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-gray-900">
              {selectedVariant && selectedVariant.prices?.[0].amount? formatPrice(selectedVariant.prices?.[0]?.amount, selectedVariant.prices?.[0]?.currency_code) : 'Unavailable' }
              { /**price ? formatPrice(price, currencyCode) : 'Price unavailable' */}
            </div>

            {/* Description */}
            <div className="prose prose-sm text-gray-600">
              <p>{productMedusa.description}</p>
            </div>

            {/* Variants */}
            {productMedusa.variants && productMedusa.variants.length > 1 && selectedVariant.prices?.[0].amount && (
              <div>
                <label htmlFor="variant-select" className="text-sm font-medium text-gray-900 mb-3 block">
                  Options
                </label>
                <select
                  id="variant-select"
                  value={selectedVariant?.id || ''}
                  onChange={(e) => {
                    const variant = productMedusa.variants.find(v => v.id === e.target.value);
                    setSelectedVariant(variant);
                  }}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                >
                  {productMedusa.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.title} - {formatPrice(variant.prices?.[0]?.amount, variant.prices?.[0]?.currency_code)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity */}
            { selectedVariant.prices?.[0].amount && <div>
              <label className="text-sm font-medium text-gray-900 mb-3 block">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>}

            {/* Add to Cart */}
            {selectedVariant.prices?.[0].amount && <button
              onClick={handleAddToCart}
              disabled={loading}
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding to Cart...
                </div>
              ) : (
                'Add to Cart'
              )}
            </button>}

            {/* Features */}
            {/* {product.features && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )} */}

            {/* Categories */}
            {productMedusa.categories && productMedusa.categories.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {productMedusa.categories.map((category, index) => (
                    <Link
                      key={index}
                      to={`/categories/${category.handle}`}
                      className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {category.name || category.handle}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;