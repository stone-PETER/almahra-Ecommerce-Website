import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import { storage } from "../utils/helpers.js";
import cartService from "../services/cartService.js";
import { useAuth } from "./AuthContext.jsx";
import Notification from "../components/common/Notification/Notification.jsx";

// Initial state
const getInitialState = () => {
  const savedCart = storage.get("cart");
  return (
    savedCart || {
      items: [],
      total: 0,
      itemCount: 0,
      isOpen: false,
    }
  );
};

// Action types
const CART_ACTIONS = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  TOGGLE_CART: "TOGGLE_CART",
  LOAD_CART: "LOAD_CART",
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, variant, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.product.id === product.id && item.variant?.id === variant?.id
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem = {
          id: `${product.id}-${variant?.id || "default"}`,
          product,
          variant,
          quantity,
          price: product.price,
        };
        updatedItems = [...state.items, newItem];
      }

      const total = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const itemCount = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        total,
        itemCount,
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      console.log('REMOVE_ITEM action called with ID:', action.payload.id);
      console.log('Current cart items:', state.items.map(item => ({ id: item.id, name: item.product.name })));
      
      const updatedItems = state.items.filter(
        (item) => item.id !== action.payload.id
      );
      
      console.log('Items after removal:', updatedItems.map(item => ({ id: item.id, name: item.product.name })));
      const total = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const itemCount = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        total,
        itemCount,
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        return cartReducer(state, {
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: { id },
        });
      }

      const updatedItems = state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );

      const total = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const itemCount = updatedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        total,
        itemCount,
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        items: [],
        total: 0,
        itemCount: 0,
        isOpen: false,
      };

    case CART_ACTIONS.TOGGLE_CART:
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case CART_ACTIONS.LOAD_CART:
      const loadedItems = action.payload.items || [];
      const loadedTotal = loadedItems.reduce(
        (sum, item) => {
          // Safety check for product and price
          const price = item.variant?.price || item.product?.price || 0;
          return sum + price * (item.quantity || 0);
        },
        0
      );
      const loadedItemCount = loadedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      return {
        ...state,
        items: loadedItems,
        total: loadedTotal,
        itemCount: loadedItemCount,
      };

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, getInitialState());
  const { isAuthenticated } = useAuth();
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
  };

  // Load cart from backend when user logs in
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        try {
          const cartData = await cartService.getCart();
          console.log('Cart data from backend:', cartData);
          
          // Backend returns cart_items, not items
          if (cartData && cartData.cart_items && cartData.cart_items.length > 0) {
            // Map backend cart items to local format, preserving backend IDs
            const mappedItems = cartData.cart_items
              .filter(item => item.product) // Filter out items with null products
              .map(item => ({
                id: `${item.product.id}-${item.product_variant?.id || 'default'}`,
                cartItemId: item.id, // Preserve backend cart_item_id
                product: item.product,
                variant: item.product_variant,
                quantity: item.quantity
              }));
            
            console.log('Mapped items:', mappedItems);
            
            // Replace entire cart with backend data
            dispatch({
              type: 'LOAD_CART',
              payload: { items: mappedItems }
            });
          } else {
            // Empty cart from backend
            dispatch({
              type: 'LOAD_CART',
              payload: { items: [] }
            });
          }
        } catch (err) {
          console.error('Error loading cart from backend:', err);
        }
      }
    };

    loadCart();
  }, [isAuthenticated]);

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    storage.set("cart", state);
  }, [state]);

  const addToCart = async (product, variant = null, quantity = 1) => {
    // Sync with backend first if authenticated to validate stock
    if (isAuthenticated) {
      try {
        await cartService.addToCart(product.id, quantity, variant?.id);
        
        // Reload cart from backend to get updated state with correct IDs
        const cartData = await cartService.getCart();
        if (cartData && cartData.cart_items) {
          const mappedItems = cartData.cart_items
            .filter(item => item.product)
            .map(item => ({
              id: `${item.product.id}-${item.product_variant?.id || 'default'}`,
              cartItemId: item.id,
              product: item.product,
              variant: item.product_variant,
              quantity: item.quantity
            }));
          
          dispatch({
            type: 'LOAD_CART',
            payload: { items: mappedItems }
          });
        }
      } catch (err) {
        console.error('Error adding to cart:', err);
        // Show detailed error to user
        const errorData = err.response?.data;
        let errorMessage = errorData?.error || 'Failed to add item to cart';
        
        // Add more context for stock errors
        if (errorData?.available_stock !== undefined && errorData?.current_in_cart !== undefined) {
          // User trying to add more when cart already has items
          errorMessage = `Stock Limit Reached!\n\nYou have ${errorData.current_in_cart} item(s) in your cart.\nOnly ${errorData.available_stock} available in stock.\n\nPlease reduce the quantity in your cart or choose a different product.`;
        } else if (errorData?.available_stock !== undefined) {
          errorMessage = `Stock Limit Reached!\n\nOnly ${errorData.available_stock} item(s) available in stock.`;
        }
        
        showNotification(errorMessage, 'warning');
        throw err; // Re-throw so calling code can handle it
      }
    } else {
      // For guest users, check stock locally before adding
      if (product.track_inventory && product.stock_quantity < quantity) {
        alert(`Only ${product.stock_quantity} items available in stock`);
        return;
      }
      
      // Update local state immediately for guest users
      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: { product, variant, quantity },
      });
    }
  };

  const removeFromCart = async (id) => {
    const item = state.items.find(item => item.id === id);
    
    // Sync with backend if authenticated
    if (isAuthenticated && item?.cartItemId) {
      try {
        await cartService.removeFromCart(item.cartItemId);
        
        // Reload cart from backend
        const cartData = await cartService.getCart();
        if (cartData && cartData.cart_items) {
          const mappedItems = cartData.cart_items
            .filter(item => item.product)
            .map(item => ({
              id: `${item.product.id}-${item.product_variant?.id || 'default'}`,
              cartItemId: item.id,
              product: item.product,
              variant: item.product_variant,
              quantity: item.quantity
            }));
          
          dispatch({
            type: 'LOAD_CART',
            payload: { items: mappedItems }
          });
        } else {
          // Cart is empty
          dispatch({
            type: 'LOAD_CART',
            payload: { items: [] }
          });
        }
      } catch (err) {
        console.error('Error removing from cart:', err);
        showNotification('Failed to remove item from cart', 'error');
      }
    } else {
      // For guest users, update local state
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM,
        payload: { id },
      });
    }
  };

  const updateQuantity = async (id, quantity) => {
    // Find the item to get its backend cart_item_id
    const item = state.items.find(item => item.id === id);
    
    // Sync with backend first if authenticated to validate stock
    if (isAuthenticated && item?.cartItemId) {
      try {
        await cartService.updateCartItem(item.cartItemId, quantity);
        
        // Reload cart from backend to get updated state
        const cartData = await cartService.getCart();
        if (cartData && cartData.cart_items) {
          const mappedItems = cartData.cart_items
            .filter(item => item.product)
            .map(item => ({
              id: `${item.product.id}-${item.product_variant?.id || 'default'}`,
              cartItemId: item.id,
              product: item.product,
              variant: item.product_variant,
              quantity: item.quantity
            }));
          
          dispatch({
            type: 'LOAD_CART',
            payload: { items: mappedItems }
          });
        }
      } catch (err) {
        console.error('Error updating cart quantity:', err);
        // Show detailed error to user
        const errorData = err.response?.data;
        let errorMessage = errorData?.error || 'Failed to update quantity';
        
        if (errorData?.available_stock !== undefined) {
          errorMessage += `\n\nOnly ${errorData.available_stock} available in stock.`;
        }
        
        showNotification(errorMessage, 'warning');
        // Don't update local state if backend fails
        throw err;
      }
    } else {
      // For guest users, find the item and check stock
      if (item && item.product.track_inventory && item.product.stock_quantity < quantity) {
        alert(`Only ${item.product.stock_quantity} items available in stock`);
        return;
      }
      
      // Update local state immediately for guest users
      dispatch({
        type: CART_ACTIONS.UPDATE_QUANTITY,
        payload: { id, quantity },
      });
    }
  };

  const clearCart = async () => {
    // Update local state immediately
    dispatch({ type: CART_ACTIONS.CLEAR_CART });

    // Sync with backend if authenticated
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.error('Error clearing cart on backend:', err);
      }
    }
  };

  const toggleCart = () => {
    dispatch({ type: CART_ACTIONS.TOGGLE_CART });
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
