"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { CartItem, Medicine } from "@/types";

interface CartContextType {
  items: CartItem[];
  addItem: (medicine: Medicine, qty?: number) => void;
  updateQuantity: (medicineId: string, quantity: number) => void;
  removeItem: (medicineId: string) => void;
  clearCart: () => void;
  discountType: "percentage" | "fixed";
  discountValue: number;
  setDiscount: (type: "percentage" | "fixed", value: number) => void;
  subtotal: number;
  discountAmount: number;
  total: number;
  totalQuantity: number;
  uniqueItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "pharmacare_pos_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Use lazy state initialization to read from localStorage without cascading renders
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items)) return parsed.items;
      }
    } catch (e) {
      console.error("Failed to load initial cart items", e);
    }
    return [];
  });

  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(() => {
    if (typeof window === "undefined") return "percentage";
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.discountType === "fixed" || parsed.discountType === "percentage") {
          return parsed.discountType;
        }
      }
    } catch {}
    return "percentage";
  });

  const [discountValue, setDiscountValue] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.discountValue === "number") {
          return parsed.discountValue;
        }
      }
    } catch {}
    return 0;
  });

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items,
          discountType,
          discountValue,
        })
      );
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items, discountType, discountValue]);

  const addItem = (medicine: Medicine, qty: number = 1) => {
    if (!medicine.isActive) return;
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.medicineId === medicine.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + qty;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          subtotal: Number((newQty * existing.unitPrice).toFixed(2)),
        };
        return updated;
      } else {
        const newItem: CartItem = {
          medicineId: medicine.id,
          name: medicine.name,
          genericName: medicine.genericName,
          strength: medicine.strength,
          dosageForm: medicine.dosageForm,
          unitPrice: medicine.sellingPrice,
          unit: medicine.unit,
          quantity: qty,
          subtotal: Number((qty * medicine.sellingPrice).toFixed(2)),
        };
        return [newItem, ...prev];
      }
    });
  };

  const updateQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) return;
    setItems((prev) =>
      prev.map((item) => {
        if (item.medicineId === medicineId) {
          return {
            ...item,
            quantity,
            subtotal: Number((quantity * item.unitPrice).toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const removeItem = (medicineId: string) => {
    setItems((prev) => prev.filter((i) => i.medicineId !== medicineId));
  };

  const clearCart = () => {
    setItems([]);
    setDiscountValue(0);
    setDiscountType("percentage");
    if (typeof window !== "undefined") {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  };

  const setDiscount = (type: "percentage" | "fixed", value: number) => {
    const safeVal = Math.max(0, value);
    setDiscountType(type);
    setDiscountValue(safeVal);
  };

  const subtotal = useMemo(() => {
    const raw = items.reduce((acc, item) => acc + item.subtotal, 0);
    return Number(raw.toFixed(2));
  }, [items]);

  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      const pct = Math.min(100, Math.max(0, discountValue));
      return Number(((subtotal * pct) / 100).toFixed(2));
    } else {
      const fixed = Math.max(0, discountValue);
      return Number(Math.min(subtotal, fixed).toFixed(2));
    }
  }, [subtotal, discountType, discountValue]);

  const total = useMemo(() => {
    return Math.max(0, Number((subtotal - discountAmount).toFixed(2)));
  }, [subtotal, discountAmount]);

  const totalQuantity = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const uniqueItemCount = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        discountType,
        discountValue,
        setDiscount,
        subtotal,
        discountAmount,
        total,
        totalQuantity,
        uniqueItemCount,
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
