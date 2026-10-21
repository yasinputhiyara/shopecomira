import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("shopecomira_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState("WELCOME10");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("shopecomira_cart", JSON.stringify(cartItems));
    } catch (err) {
      console.error("Cart save error:", err);
    }
  }, [cartItems]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3200);
  };

  const addToCart = (product, variant, qty = 1) => {
    const v = variant || product.variants?.[0] || {};
    const existingIndex = cartItems.findIndex(
      (item) => item.productId === product._id && item.variantSku === v.sku
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += qty;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: product._id,
          variantSku: v.sku,
          productName: product.name,
          options: v.options || [],
          sellingPricePaise: v.sellingPricePaise,
          mrpPaise: v.mrpPaise,
          imageUrl: product.images?.[0]?.url || "",
          quantity: qty,
        },
      ]);
    }

    showToast(`Added ${qty} &times; "${product.name}" to your cart`);
  };

  const updateQuantity = (productId, variantSku, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, variantSku);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.productId === productId && item.variantSku === variantSku
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const removeFromCart = (productId, variantSku) => {
    setCartItems(
      cartItems.filter(
        (item) => !(item.productId === productId && item.variantSku === variantSku)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + ((item.sellingPricePaise || 0) * item.quantity) / 100,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartSubtotal,
        couponCode,
        setCouponCode,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
