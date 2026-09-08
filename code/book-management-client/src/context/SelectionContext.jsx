import { createContext, useContext, useState, useEffect } from "react";

const SelectionContext = createContext();

export function SelectionProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("bookvault_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("bookvault_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("bookvault_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("bookvault_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addToCart = (book) => {
    if (!cart.find((item) => item.id === book.id)) {
      setCart((prev) => [...prev, book]);
    }
  };

  const removeFromCart = (bookId) => {
    setCart((prev) => prev.filter((item) => item.id !== bookId));
  };

  const isInCart = (bookId) => !!cart.find((item) => item.id === bookId);

  const addToFavorites = (book) => {
    if (!favorites.find((item) => item.id === book.id)) {
      setFavorites((prev) => [...prev, book]);
    }
  };

  const removeFromFavorites = (bookId) => {
    setFavorites((prev) => prev.filter((item) => item.id !== bookId));
  };

  const isInFavorites = (bookId) => !!favorites.find((item) => item.id === bookId);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const clearCart = () => setCart([]);

  return (
    <SelectionContext.Provider
      value={{
        cart,
        favorites,
        addToCart,
        removeFromCart,
        isInCart,
        addToFavorites,
        removeFromFavorites,
        isInFavorites,
        cartTotal,
        clearCart,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return context;
}
