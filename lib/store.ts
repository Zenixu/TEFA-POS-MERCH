import { create } from "zustand";

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  size: string;
  color: string;
  colorHex?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  discount: number;
  discountType: "PERCENT" | "FIXED";
  taxEnabled: boolean;
  note: string;
  cashierName: string;
  customerId: string | null;

  // Actions
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  clearCart: () => void;
  setDiscount: (value: number, type: "PERCENT" | "FIXED") => void;
  toggleTax: () => void;
  setNote: (note: string) => void;
  setCashierName: (name: string) => void;
  setCustomerId: (id: string | null) => void;

  // Computed helpers
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  discount: 0,
  discountType: "PERCENT",
  taxEnabled: true,
  note: "",
  cashierName: "Kasir",
  customerId: null,

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.variantId === item.variantId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variantId === item.variantId
              ? {
                  ...i,
                  quantity: Math.min(
                    i.quantity + (item.quantity || 1),
                    i.maxStock
                  ),
                }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { ...item, quantity: item.quantity || 1 } as CartItem,
        ],
      };
    });
  },

  removeItem: (variantId) => {
    set((state) => ({
      items: state.items.filter((i) => i.variantId !== variantId),
    }));
  },

  updateQty: (variantId, qty) => {
    set((state) => ({
      items: state.items
        .map((i) =>
          i.variantId === variantId
            ? { ...i, quantity: Math.min(Math.max(0, qty), i.maxStock) }
            : i
        )
        .filter((i) => i.quantity > 0),
    }));
  },

  clearCart: () => {
    set({ items: [], discount: 0, discountType: "PERCENT", note: "", customerId: null });
  },

  setDiscount: (value, type) => {
    set({ discount: value, discountType: type });
  },

  toggleTax: () => {
    set((state) => ({ taxEnabled: !state.taxEnabled }));
  },

  setNote: (note) => {
    set({ note });
  },

  setCashierName: (name) => {
    set({ cashierName: name });
  },

  setCustomerId: (id) => {
    set({ customerId: id });
  },

  getSubtotal: () => {
    return get().items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  },

  getDiscountAmount: () => {
    const { items, discount, discountType } = get();
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    return discountType === "PERCENT"
      ? Math.round((subtotal * discount) / 100)
      : discount;
  },

  getTaxAmount: () => {
    const { items, discount, discountType, taxEnabled } = get();
    if (!taxEnabled) return 0;
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const discountAmount =
      discountType === "PERCENT"
        ? Math.round((subtotal * discount) / 100)
        : discount;
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    return Math.round(afterDiscount * 0.11);
  },

  getTotal: () => {
    const store = get();
    const subtotal = store.getSubtotal();
    const discountAmount = store.getDiscountAmount();
    const afterDiscount = Math.max(0, subtotal - discountAmount);
    const taxAmount = store.taxEnabled
      ? Math.round(afterDiscount * 0.11)
      : 0;
    return afterDiscount + taxAmount;
  },

  getItemCount: () => {
    return get().items.reduce((s, i) => s + i.quantity, 0);
  },
}));
