import { PrismaClient } from '@prisma/client';
import { SystemRole, SYSTEM_ROLE_PERMISSIONS } from '../../src/common/constants/permissions';

export async function seedRoles(prisma: PrismaClient) {
    console.log('Seeding system roles & role permissions...');

    // Fetch all permission records from DB
    const allPermissions = await prisma.permission.findMany();
    const permMap = new Map(allPermissions.map((p) => [p.name, p.id]));

    for (const roleName of Object.values(SystemRole)) {
        // Upsert System Role
        let role = await prisma.role.findFirst({
            where: {
                name: roleName,
                isSystem: true,
                organizationId: null,
            },
        });

        if (!role) {
            role = await prisma.role.create({
                data: {
                    name: roleName,
                    isSystem: true,
                    description: `System default ${roleName} role`,
                    organizationId: null,
                },
            });
        }

        // Get expected permission names for this role
        const expectedPermNames = SYSTEM_ROLE_PERMISSIONS[roleName] || [];

        for (const permName of expectedPermNames) {
            const permId = permMap.get(permName);
            if (permId) {
                await prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: {
                            roleId: role.id,
                            permissionId: permId,
                        },
                    },
                    update: {},
                    create: {
                        roleId: role.id,
                        permissionId: permId,
                    },
                });
            }
        }
    }
    console.log('System roles and permissions seeded successfully.');
}
