import Dexie, { type Table } from "dexie";
import { type ProductWithVariants } from "@/components/pos/ProductCard";
import { type OrderPayload } from "@/components/pos/CheckoutModal";

export interface CategoryData {
  id: string;
  name: string;
}

export interface OfflineOrder {
  id: string; // locally generated UUID
  syncStatus: "PENDING" | "SYNCED" | "FAILED";
  createdAt: Date;
  payload: OrderPayload;
  error?: string;
}

export class PosDatabase extends Dexie {
  products!: Table<ProductWithVariants, string>;
  categories!: Table<CategoryData, string>;
  pendingOrders!: Table<OfflineOrder, string>;

  constructor() {
    super("pos-merch-db");
    this.version(1).stores({
      products: "id, categoryId, name",
      categories: "id, name",
      pendingOrders: "id, syncStatus, createdAt",
    });
  }
}

export const db = new PosDatabase();
