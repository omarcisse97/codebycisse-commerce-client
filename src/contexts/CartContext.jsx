// contexts/CartContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';
import { medusaClient } from '../utils/client';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false };
    case 'ADD_ITEM':
      const existingItem = state.cart?.items?.find(
        item => item.variant_id === action.payload.variant_id
      );

      if (existingItem) {
        return {
          ...state,
          cart: {
            ...state.cart,
            items: state.cart.items.map(item =>
              item.variant_id === action.payload.variant_id
                ? { ...item, quantity: item.quantity + action.payload.quantity }
                : item
            )
          }
        };
      }

      return {
        ...state,
        cart: {
          ...state.cart,
          items: [...(state.cart?.items || []), action.payload]
        }
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
        }
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        cart: {
          ...state.cart,
          items: state.cart.items.filter(item => item.id !== action.payload)
        }
      };
    case 'CLEAR_CART':
      return { ...state, cart: { items: [] } };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: { items: [] },
    loading: false
  });

  // Initialize cart on component mount
  useEffect(() => {
    initializeCart();
  }, []);

  // Save cart to localStorage whenever it changes (but only if it has an ID)
  useEffect(() => {
    if (state.cart?.id) {
      localStorage.setItem('medusa_cart_id', state.cart.id);
      localStorage.setItem('medusa_cart_data', JSON.stringify(state.cart));
    }
  }, [state.cart]);

  const initializeCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const savedCartId = localStorage.getItem('medusa_cart_id');
      const savedCartData = localStorage.getItem('medusa_cart_data');

      if (savedCartId) {
        try {
          // Try to fetch the latest cart from the server
          const { cart } = await medusaClient.store.cart.retrieve(savedCartId);
          dispatch({ type: 'SET_CART', payload: cart });
          console.log('Cart loaded from server:', cart);
        } catch (error) {
          console.warn('Failed to load cart from server, using cached data:', error);
          
          // If server fetch fails, try to use cached data
          if (savedCartData) {
            try {
              const parsedCart = JSON.parse(savedCartData);
              dispatch({ type: 'SET_CART', payload: parsedCart });
              console.log('Cart loaded from cache:', parsedCart);
            } catch (parseError) {
              console.error('Failed to parse cached cart data:', parseError);
              // Clear invalid data and start fresh
              localStorage.removeItem('medusa_cart_id');
              localStorage.removeItem('medusa_cart_data');
              dispatch({ type: 'SET_CART', payload: { items: [] } });
            }
          } else {
            // No cached data, start with empty cart
            localStorage.removeItem('medusa_cart_id');
            dispatch({ type: 'SET_CART', payload: { items: [] } });
          }
        }
      } else {
        // No saved cart ID, start with empty cart
        dispatch({ type: 'SET_CART', payload: { items: [] } });
      }
    } catch (error) {
      console.error('Error initializing cart:', error);
      dispatch({ type: 'SET_CART', payload: { items: [] } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const initMedusaCart = async (obj) => {
    try {
      const existingCartId = localStorage.getItem('medusa_cart_id');
      
      if (existingCartId) {
        // Update existing cart
        return await updateMedusaCart(obj);
      } else {
        // Create new cart
        dispatch({ type: 'SET_LOADING', payload: true });
        const { cart } = await medusaClient.store.cart.create({
          ...obj
        });
        
        if (cart?.id) {
          dispatch({ type: 'SET_CART', payload: cart });
          localStorage.setItem('medusa_cart_id', cart.id);
          localStorage.setItem('medusa_cart_data', JSON.stringify(cart));
          toast.success('Cart created successfully!');
          console.log('New cart created:', cart);
        }
      }
    } catch (error) {
      console.error('Failed to initialize cart:', error);
      toast.error('Failed to initialize cart');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setCartForCustomer = async (userId, regionObj) => {
    if (!userId || !regionObj) {
      console.error('Missing userId or regionObj');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Get user cart storage (should be an array of user carts)
      const userCartStorage = JSON.parse(localStorage.getItem('user_cart') || '[]');
      
      // Find this user's cart
      const userCartEntry = userCartStorage.find(entry => entry?.user_id === userId);
      
      if (userCartEntry?.cart?.id) {
        // User has existing cart - try to retrieve it
        try {
          const { cart } = await medusaClient.store.cart.retrieve(userCartEntry.cart.id);
          
          // Set the retrieved cart
          dispatch({ type: 'SET_CART', payload: cart });
          localStorage.setItem('medusa_cart_id', cart.id);
          localStorage.setItem('medusa_cart_data', JSON.stringify(cart));
          toast.success('Loaded existing cart!');
          console.log('User cart loaded:', cart);

        } catch (error) {
          console.warn('User cart not found on server, creating new one:', error);
          // Cart doesn't exist on server anymore, create new one
          await createNewCartForUser(userId, regionObj, userCartStorage);
        }
      } else {
        console.log('No existing cart for user, creating new one');
        await createNewCartForUser(userId, regionObj, userCartStorage);
      }

    } catch (error) {
      console.error('Error in setCartForCustomer:', error);
      toast.error('Failed to load cart');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Helper function to create new cart
  const createNewCartForUser = async (userId, regionObj, currentStorage) => {
    try {
      const { cart } = await medusaClient.store.cart.create({
        region_id: regionObj.code
      });

      // Set cart in state
      dispatch({ type: 'SET_CART', payload: cart });
      localStorage.setItem('medusa_cart_id', cart.id);
      localStorage.setItem('medusa_cart_data', JSON.stringify(cart));

      // Update user cart storage
      const updatedStorage = currentStorage.filter(entry => entry.user_id !== userId);
      updatedStorage.push({
        user_id: userId,
        cart: cart,
        created_at: new Date().toISOString()
      });

      localStorage.setItem('user_cart', JSON.stringify(updatedStorage));
      toast.success('Generated new cart for user!');
      console.log('New user cart created:', cart);

    } catch (error) {
      console.error('Error creating cart:', error);
      toast.error('Failed to create cart');
    }
  };

  const updateMedusaCart = async (obj) => {
    const cart_id = localStorage.getItem('medusa_cart_id');
    
    if (!cart_id) {
      console.warn('No cart ID found, cannot update cart');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { cart } = await medusaClient.store.cart.update(cart_id, {
        ...obj
      });
      
      if (cart?.id) {
        dispatch({ type: 'SET_CART', payload: cart });
        localStorage.setItem('medusa_cart_id', cart.id);
        localStorage.setItem('medusa_cart_data', JSON.stringify(cart));
        toast.success('Cart updated successfully!');
        console.log('Cart updated:', cart);
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
      toast.error('Failed to update cart');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCartMedusa = async (item) => {
    const cart_id = localStorage.getItem('medusa_cart_id');
    
    if (!cart_id) {
      toast.error('No cart found. Please refresh the page.');
      return;
    }

    if (!item?.variant_id) {
      toast.error('Invalid item');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { cart } = await medusaClient.store.cart.createLineItem(cart_id, {
        variant_id: item.variant_id,
        quantity: item.quantity || 1
      });
      
      if (cart?.id) {
        dispatch({ type: 'SET_CART', payload: cart });
        localStorage.setItem('medusa_cart_data', JSON.stringify(cart));
        toast.success('Added to cart');
        console.log('Item added to cart:', cart);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
 
  const updateCartItemMedusa = async (itemId, quantity) => {
    const cart_id = localStorage.getItem('medusa_cart_id');
    
    if (!cart_id || !itemId) {
      toast.error('Invalid cart or item');
      return;
    }

    if (quantity <= 0) {
      return removeFromCartMedusa(itemId);
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { cart } = await medusaClient.store.cart.updateLineItem(
        cart_id,
        itemId,
        { quantity: quantity }
      );
      
      if (cart?.id) {
        dispatch({ type: 'SET_CART', payload: cart });
        localStorage.setItem('medusa_cart_data', JSON.stringify(cart));
        toast.success('Cart updated');
        console.log('Cart item updated:', cart);
      }
    } catch (error) {
      console.error('Update cart error:', error);
      toast.error('Failed to update cart');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromCartMedusa = async (itemId) => {
    const cart_id = localStorage.getItem('medusa_cart_id');
    
    if (!cart_id || !itemId) {
      toast.error('Invalid cart or item');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { deleted, parent: cart } = await medusaClient.store.cart.deleteLineItem(
        cart_id,
        itemId
      );
      
      if (cart?.id) {
        dispatch({ type: 'SET_CART', payload: cart });
        localStorage.setItem('medusa_cart_data', JSON.stringify(cart));
        toast.success('Removed from cart');
        console.log('Item removed from cart:', cart);
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      toast.error('Failed to remove from cart');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearCartMedusa = async () => {
    const cart_id = localStorage.getItem('medusa_cart_id');
    
    if (!cart_id) {
      toast.error('No cart found');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Get current cart
      const { cart } = await medusaClient.store.cart.retrieve(cart_id);
      
      // Early return if cart is empty
      if (!cart?.items?.length) {
        toast.info('Cart is already empty');
        return;
      }

      // Delete all items in parallel
      const deletePromises = cart.items.map(item => 
        medusaClient.store.cart.deleteLineItem(cart_id, item.id)
      );
      
      await Promise.all(deletePromises);
      
      // Get final cart state and update
      const { cart: updatedCart } = await medusaClient.store.cart.retrieve(cart_id);
      dispatch({ type: 'SET_CART', payload: updatedCart });
      localStorage.setItem('medusa_cart_data', JSON.stringify(updatedCart));
      
      toast.success('Cart cleared!');
      console.log('Cart cleared:', updatedCart);
      
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Legacy functions for backward compatibility
  const addToCart = async (item) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'ADD_ITEM', payload: item });
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
      console.error('Add to cart error:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        return removeFromCart(itemId);
      }
      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
      console.error('Update cart error:', error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove from cart');
      console.error('Remove from cart error:', error);
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('medusa_cart_id');
    localStorage.removeItem('medusa_cart_data');
    localStorage.removeItem('medusa-cart'); // Remove old key too
    toast.success('Cart cleared');
  };

  const getCartTotal = () => {
    return state.cart?.items?.reduce((total, item) => {
      return total + (item.unit_price * item.quantity);
    }, 0) || 0;
  };

  const getCartItemsCount = () => {
    return state.cart?.items?.reduce((count, item) => count + item.quantity, 0) || 0;
  };

  const value = {
    cart: state.cart,
    loading: state.loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    initMedusaCart,
    updateMedusaCart,
    setCartForCustomer,
    addToCartMedusa,
    updateCartItemMedusa,
    removeFromCartMedusa,
    clearCartMedusa,
    initializeCart // Export for manual re-initialization if needed
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};