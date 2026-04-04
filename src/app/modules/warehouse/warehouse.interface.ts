export type WarehousePayload = {
    shopId: string;
    name: string;
    code: string;
    description?: string;
    address: string;
    city: string;
    capacity?: number;
    managerId?: string;
    isActive?: boolean;
};

export type WarehouseUpdatePayload = Partial<WarehousePayload>;

export type WarehouseParams = {
    id: string;
    shopId: string;
};
