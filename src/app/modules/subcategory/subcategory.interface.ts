export interface SubcategoryPayload {
	shopId: string;
	categoryId: string;
	name: string;
	description?: string;
	icon?: string;
}

export interface ISubcategoryFilter {
	searchTerm?: string;
	shopId?: string;
	categoryId?: string;
	name?: string;
}
