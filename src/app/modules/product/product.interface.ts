export interface ProductPayload {
	shopId: string;
	categoryId?: string | null;
	subcategoryId?: string | null;
	productId: string;
	name: string;
	description?: string;
	brand?: string;
	barcode?: string;
	qrCode?: string;
	buyPrice: number | string;
	sellPrice?: number | string;
	expiryDate: string | Date;
	quantity?: number;
	thumbnail?: string;
	images?: string[];
	minStock?: number;
	maxStock?: number;
	reorderPoint?: number;
	avgCost?: number | string;
	lastCost?: number | string;
}

export interface IProductFilter {
	searchTerm?: string;
	shopId?: string;
	categoryId?: string;
	subcategoryId?: string;
	name?: string;
	productId?: string;
	brand?: string;
	barcode?: string;
	qrCode?: string;
}
