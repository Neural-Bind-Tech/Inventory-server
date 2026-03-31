import { prisma } from '../lib/prisma';

interface IProps {
  id: string;
  tokenId: string;
  ip: string;
  device: any;
}
export const createPrismaToken = async ({
  id,
  tokenId,
  ip,
  device,
}: IProps) => {
  await prisma.activeToken.create({
    data: {
      userId: id,
      tokenType: 'ACCESS',
      ipAddress: ip,
      tokenId: `access_${tokenId}`,
      deviceInfo: device,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });
  await prisma.activeToken.create({
    data: {
      userId: id,
      tokenType: 'REFRESH',
      ipAddress: ip,
      deviceInfo: device,
      tokenId: `refresh_${tokenId}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
};
