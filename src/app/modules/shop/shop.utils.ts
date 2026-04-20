import { Prisma } from "../../../generated/prisma/client";
import { ShopPayload } from "./shop.interface";

export const buildShopCreateData = (
	payload: ShopPayload,
	ownerId: string,
	logo: string | null
): Prisma.ShopCreateInput => {
	return {
		owner: {
			connect: {
				userId: ownerId,
			},
		},
		name: payload.name,
		code: payload.code,
		phone: payload.phone,
		address: payload.address,
		city: payload.city,
		country: payload.country,
		...(payload.description !== undefined && { description: payload.description }),
		...(logo !== null && { logo }),
		...(payload.email !== undefined && { email: payload.email }),
		...(payload.website !== undefined && { website: payload.website }),
		...(payload.division !== undefined && { division: payload.division }),
		...(payload.zipCode !== undefined && { zipCode: payload.zipCode }),
		...(payload.latitude !== undefined && { latitude: payload.latitude }),
		...(payload.longitude !== undefined && { longitude: payload.longitude }),
		...(payload.openingTime !== undefined && { openingTime: payload.openingTime }),
		...(payload.closingTime !== undefined && { closingTime: payload.closingTime }),
		...(payload.businessHours !== undefined && {
			businessHours: payload.businessHours,
		}),
		...(payload.status !== undefined && { status: payload.status }),
	};
};