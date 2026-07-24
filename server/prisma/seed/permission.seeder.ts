import { PrismaClient } from '@prisma/client';
import { PERMISSION_CATALOG } from '../../src/common/constants';

export async function seedPermissions(prisma: PrismaClient) {
    console.log('Seeding permissions...');
    for (const perm of PERMISSION_CATALOG) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: {
                resource: perm.resource,
                action: perm.action,
                description: perm.description,
            },
            create: {
                name: perm.name,
                resource: perm.resource,
                action: perm.action,
                description: perm.description,
            },
        });
    }
    console.log('Permissions seeded successfully.');
}
