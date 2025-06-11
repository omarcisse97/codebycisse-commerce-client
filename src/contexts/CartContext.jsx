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

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('medusa-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'SET_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error parsing saved cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.cart && state.cart.items.length >= 0) {
      localStorage.setItem('medusa-cart', JSON.stringify(state.cart));
    }
  }, [state.cart]);

  const initMedusaCart = async (obj) => {
    console.log('Request to init cart. here is the object ->', obj);
    try {
      if (obj) {
        if (localStorage.getItem('medusa_cart_id')) {
          return await updateMedusaCart(obj);
        } else {
          dispatch({ type: 'SET_LOADING', payload: true });
          const result = await medusaClient.store.cart.create({
            ...obj
          })
            .then(({ cart }) => {
              console.log('Successfully created a cart -> ', cart);
              if (cart?.id) {
                dispatch({ type: 'SET_CART', payload: { ...cart } });
                localStorage.setItem('medusa_cart_id', cart?.id);
                toast.success('Cart creation success!');
              }

            })
          dispatch({ type: 'SET_LOADING', payload: false });
        }

      }
    } catch (error) {
      toast.error('failed to initialize a cart');
      console.log('we could not generate a cart. check error -> ', error.message);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }
  const setCartForCustomer = async (userId, regionObj) => {
    if (!userId || !regionObj) {
      console.error('Missing userId or regionObj');
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Get user cart storage (should be an array of user carts)
      const userCartStorage = JSON.parse(localStorage.getItem('user_cart') || '[]');
      console.log('Current storage:', userCartStorage);

      // Find this user's cart
      const userCartEntry = userCartStorage.find(entry => entry?.user_id === userId);
      console.log('User cart found:', userCartEntry);

      if (userCartEntry?.cart?.id) {
        // User has existing cart - try to retrieve it
        try {
          const result = await medusaClient.store.cart.retrieve(userCartEntry.cart.id);
          console.log('Found user cart on server:', result.cart);

          // Set the retrieved cart
          dispatch({ type: 'SET_CART', payload: result.cart });
          localStorage.setItem('medusa_cart_id', result.cart.id);
          toast.success('Loaded existing cart!');

        } catch (error) {
          console.log('Cart not found on server, creating new one');
          // Cart doesn't exist on server anymore, create new one
          await createNewCartForUser(userId, regionObj, userCartStorage);
        }
      } else {
        console.log('No cart found for user, creating new one');
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

      console.log('Created new cart for user:', cart);

      // Set cart in state
      dispatch({ type: 'SET_CART', payload: cart });
      localStorage.setItem('medusa_cart_id', cart.id);

      // Update user cart storage
      const updatedStorage = currentStorage.filter(entry => entry.user_id !== userId);
      updatedStorage.push({
        user_id: userId,
        cart: cart,
        created_at: new Date().toISOString()
      });

      localStorage.setItem('user_cart', JSON.stringify(updatedStorage));
      toast.success('Generated new cart for user!');

    } catch (error) {
      console.error('Error creating cart:', error);
      toast.error('Failed to create cart');
    }
  };
  const updateMedusaCart = async (obj) => {
    if (obj && state.cart) {
      const cart_id = localStorage.getItem('medusa_cart_id');
      if (cart_id) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const result = await medusaClient.store.cart.update(cart_id, {
            ...obj
          })
            .then(({ cart }) => {
              if (cart?.id) {
                console.log('Cart update is a success -> ', cart);
                dispatch({ type: 'SET_CART', payload: { ...cart } });
                localStorage.setItem('medusa_cart_id', cart?.id);
                toast.success('Cart updated successfully!');
              }
            });
          dispatch({ type: 'SET_LOADING', payload: false });
        } catch (error) {
          toast.error('failed to update a cart');
          console.log('we could not update the cart. check error -> ', error.message);
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }

    }

  }

  const addToCartMedusa = async (item) => {
    if (localStorage.getItem('medusa_cart_id') && item?.variant_id) {
      const cart_id = localStorage.getItem('medusa_cart_id');
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await medusaClient.store.cart.createLineItem(cart_id, {
          variant_id: item?.variant_id,
          quantity: item?.quantity || 1
        })
          .then(({ cart }) => {
            console.log('Updated cart -> ', cart);
            if (cart?.id) {
              localStorage.setItem('medusa_cart_id', cart?.id);
              dispatch({ type: 'ADD_ITEM', payload: item });
              dispatch({ type: 'SET_CART', payload: { ...cart } });
              toast.success('Added to cart');
            }
          })
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        toast.error('Failed to add to cart');
        console.error('Add to cart error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };
  /**
   * sdk.store.cart.updateLineItem(
  "cart_123",
  "li_123",
  {
    quantity: 1
  }
)
.then(({ cart }) => {
  console.log(cart)
})
   */
  const updateCartItemMedusa = async (itemId, quantity) => {
    if (localStorage.getItem('medusa_cart_id') && itemId && quantity) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        if (quantity <= 0) {
          return removeFromCartMedusa(itemId);
        }
        await medusaClient.store.cart.updateLineItem(
          localStorage.getItem('medusa_cart_id'),
          itemId,
          {
            quantity: quantity || 1
          }
        )
          .then(({ cart }) => {
            if (cart?.id) {
              localStorage.setItem('medusa_cart_id', cart?.id);
              dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
              dispatch({ type: 'SET_CART', payload: { ...cart } });
              toast.success('Cart updated');

            }
          })

        dispatch({ type: 'SET_LOADING', payload: false });

      } catch (error) {
        toast.error('Failed to update cart');
        console.error('Update cart error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  const addToCart = async (item) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('Item to get added -> ', item);
      // In a real app, you'd call the Medusa API here
      // For now, we'll just add to local state

      // end update
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
  /**
   * sdk.store.cart.deleteLineItem(
    "cart_123",
    "li_123"
  )
  .then(({ deleted, parent: cart }) => {
    console.log(deleted, cart)
  })
   */
  const removeFromCartMedusa = async (itemId) => {
    if (localStorage.getItem('medusa_cart_id') && itemId) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await medusaClient.store.cart.deleteLineItem(
          localStorage.getItem('medusa_cart_id'),
          itemId
        )
          .then(({ deleted, parent: cart }) => {
            if (cart?.id) {
              console.log('removed the following -> ', deleted);
              console.log('updated the cart -> ', cart);
              dispatch({ type: 'REMOVE_ITEM', payload: itemId });
              dispatch({ type: 'SET_CART', payload: { ...cart } });
              toast.success('Removed from cart');
            }
          });

        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        toast.error('Failed to remove from cart');
        console.error('Remove from cart error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
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
    localStorage.removeItem('medusa-cart');
    toast.success('Cart cleared');
  };
  const clearCartMedusa = async () => {
  const cart_id = localStorage.getItem('medusa_cart_id');
  
  if (!cart_id) {
    toast.error('No cart found');
    return;
  }

  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // 1. Get current cart
    const { cart } = await medusaClient.store.cart.retrieve(cart_id);
    
    // 2. Early return if cart is empty
    if (!cart?.items?.length) {
      toast.info('Cart is already empty');
      return;
    }

    // 3. Delete all items in parallel (fastest approach)
    const deletePromises = cart.items.map(item => 
      medusaClient.store.cart.deleteLineItem(cart_id, item.id)
    );
    
    await Promise.all(deletePromises);
    
    // 4. Get final cart state and update
    const { cart: updatedCart } = await medusaClient.store.cart.retrieve(cart_id);
    dispatch({ type: 'SET_CART', payload: updatedCart });
    
    toast.success('Cart cleared!');
    
  } catch (error) {
    console.error('Error clearing cart:', error);
    toast.error('Failed to clear cart');
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
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
    clearCartMedusa
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