export interface InventoryPayload {
  name: string;
  description?: string;
  brand?: string;
  globalSku?: string | null;
  barcode?: string | null;
  qrCode?: string | null;
  suggestedBuyPrice?: number | string | null;
  suggestedSellPrice?: number | string | null;
  mrp?: number | string | null;
  manufacturer?: string;
  weight?: number | string | null;
  dimensions?: Record<string, unknown> | null;
  thumbnail?: string | null;
  images?: string[];
  tags?: string[];
  specifications?: Record<string, unknown> | null;
}

export interface IInventoryFilter {
  searchTerm?: string;
  name?: string;
  brand?: string;
  globalSku?: string;
  barcode?: string;
  qrCode?: string;
  manufacturer?: string;
}
