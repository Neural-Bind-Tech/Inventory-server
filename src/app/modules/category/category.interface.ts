export interface CategoryPayload {
	shopId: string;
	name: string;
	description?: string;
	icon?: string;
}

export interface ICategoryFilter {
	searchTerm?: string;
	shopId?: string;
	name?: string;
}

export type CategoryRelationKey = 'products' | 'subcategories';
