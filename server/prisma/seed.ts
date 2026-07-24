import { PrismaClient } from '@prisma/client';
import { seedPermissions } from './seed/permission.seeder';
import { seedRoles } from './seed/role.seeder';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed process...');
    await seedPermissions(prisma);
    await seedRoles(prisma);
    console.log('Seed process finished successfully.');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
