import type { Prisma, ShopStatus } from '../../../generated/prisma/client';

export interface ShopPayload {
	ownerId?: string;
	name: string;
	code: string;
	description?: string;
	logo?: string;
	phone: string;
	email?: string;
	website?: string;
	address: string;
	city: string;
	division?: string;
	zipCode?: string;
	country: string;
	latitude?: number | string;
	longitude?: number | string;
	openingTime?: string;
	closingTime?: string;
	businessHours?: Prisma.InputJsonValue;
	status?: ShopStatus;
}

export interface WarehousePayload {
	shopId: string;
	name: string;
	code: string;
	description?: string;
	address: string;
	city: string;
	capacity?: number;
	managerId?: string;
	isActive?: boolean;
}

export type ShopRelationKey =
	| 'employees'
	| 'supplier'
	| 'expense'
	| 'damageproduct'
	| 'returnproduct'
	| 'warehouse'
	| 'shopstock';