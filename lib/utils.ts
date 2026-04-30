import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export const generateOrderNumber = (): string => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `INV-${date}-${rand}`;
};

export interface CartCalcResult {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export const calculateCart = (
  items: { unitPrice: number; quantity: number }[],
  discount: number,
  discountType: "PERCENT" | "FIXED",
  taxEnabled: boolean
): CartCalcResult => {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discountAmount =
    discountType === "PERCENT" ? (subtotal * discount) / 100 : discount;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxEnabled ? Math.round(afterDiscount * 0.11) : 0;
  const total = afterDiscount + taxAmount;
  return { subtotal, discountAmount, taxAmount, total };
};

export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));
};

export const formatDateShort = (date: Date | string): string => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export const formatTime = (date: Date | string): string => {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
};
