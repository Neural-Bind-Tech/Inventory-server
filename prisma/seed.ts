import 'dotenv/config'
import { prisma } from '../src/lib/prisma'
import { UserRole, UserStatus } from '../src/generated/prisma/enums'
import { bcryptUtils } from '../src/helpers/bcrypt';



async function main() {

    const requiredEnvVars = ['SUPERADMINEMAIL', 'SUPERADMINPHONE', 'SUPERADMINPASSWORD', 'SUPERADMINIP'] as const;
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    const superAdminEmail = process.env['SUPERADMINEMAIL'] as string;
    const superAdminPhone = process.env['SUPERADMINPHONE'] as string;
    const superAdminPassword = process.env['SUPERADMINPASSWORD'] as string;
    const superAdminIp = process.env['SUPERADMINIP'] as string;

    const existingAdmin = await prisma.user.findUnique({
        where: { email: superAdminEmail },
        select: { id: true }
    });

    if (existingAdmin) {
        console.log('Super admin already exists, skipping creation');
        return;
    }

    const hashPassword = await bcryptUtils.hashedPassword(superAdminPassword);

    const superAdmin = await prisma.user.create({
        data: {
            email: superAdminEmail,
            phone: superAdminPhone,
            password: hashPassword,
            role: UserRole.SUPER_ADMIN,
            status: UserStatus.ACTIVE,
            lastLoginIp: superAdminIp
        },
        select: {
            id: true,
            email: true,
            role: true
        }
    });

    console.log('Super admin created successfully:', {
        id: superAdmin.id,
        email: superAdmin.email,
        role: superAdmin.role
    });
}

async function seed() {
    try {
        console.log('Starting database seeding...');
        await main();
        console.log('Database seeding completed successfully');
    } catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
        console.log('Database connection closed');
    }
}

// Execute seeding
seed()
    .catch((error) => {
        console.error('Fatal error during seeding:', error);
        process.exit(1);
    });