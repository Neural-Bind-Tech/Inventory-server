export interface IOwnerFilter {
	searchTerm?: string;
	name?: string;
	email?: string;
	phone?: string;
	address?: string;
	businessName?: string;
	businessType?: string;
	taxId?: string;
	isDeleted?: 'true' | 'false';
}

export interface OwnerPayload {
	name?: string;
	email?: string;
	phone?: string;
	profilePicture?: string;
	address?: string;
	businessName?: string;
	businessType?: string;
	taxId?: string;
}
