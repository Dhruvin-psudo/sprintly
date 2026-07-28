export enum SystemRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
    VIEWER = 'VIEWER'
}

export const SYSTEM_ROLE_NAMES = Object.values(SystemRole);
export type SystemRoleName = SystemRole;

export const SYSTEM_ROLE_HIERARCHY: Record<SystemRole, number> = {
    [SystemRole.OWNER]: 100,
    [SystemRole.ADMIN]: 80,
    [SystemRole.MEMBER]: 60,
    [SystemRole.VIEWER]: 40,
};

/** Derives hierarchy level from role name. Custom roles default to 10. */
export function getRoleHierarchyLevel(roleName: string): number {
    return SYSTEM_ROLE_HIERARCHY[roleName as SystemRole] ?? 10;
}

export enum Permission {
    // Organization permissions
    ORGANIZATION_READ = 'organization:read',
    ORGANIZATION_UPDATE = 'organization:update',
    ORGANIZATION_DELETE = 'organization:delete',
    
    // User / Member permissions
    MEMBER_READ = 'member:read',
    MEMBER_INVITE = 'member:invite',
    MEMBER_UPDATE = 'member:update',
    MEMBER_REMOVE = 'member:remove',

    // Role & Permission management
    ROLE_READ = 'role:read',
    ROLE_CREATE = 'role:create',
    ROLE_UPDATE = 'role:update',
    ROLE_DELETE = 'role:delete',

    // Tag management
    TAG_READ = 'tag:read',
    TAG_CREATE = 'tag:create',
    TAG_UPDATE = 'tag:update',
    TAG_DELETE = 'tag:delete',

    // Project management
    PROJECT_READ = 'project:read',
    PROJECT_CREATE = 'project:create',
    PROJECT_UPDATE = 'project:update',
    PROJECT_DELETE = 'project:delete',

    // Task management
    TASK_READ = 'task:read',
    TASK_CREATE = 'task:create',
    TASK_UPDATE = 'task:update',
    TASK_DELETE = 'task:delete',

    // Billing & Integrations
    BILLING_MANAGE = 'billing:manage',
    API_KEY_MANAGE = 'apikey:manage'
}

export interface PermissionDefinition {
    name: Permission;
    resource: string;
    action: string;
    description: string;
}

export const PERMISSION_CATALOG: PermissionDefinition[] = [
    // Organization
    { name: Permission.ORGANIZATION_READ, resource: 'organization', action: 'read', description: 'View organization details' },
    { name: Permission.ORGANIZATION_UPDATE, resource: 'organization', action: 'update', description: 'Update organization details' },
    { name: Permission.ORGANIZATION_DELETE, resource: 'organization', action: 'delete', description: 'Delete organization' },

    // Members
    { name: Permission.MEMBER_READ, resource: 'member', action: 'read', description: 'View organization members' },
    { name: Permission.MEMBER_INVITE, resource: 'member', action: 'invite', description: 'Invite new members' },
    { name: Permission.MEMBER_UPDATE, resource: 'member', action: 'update', description: 'Update member roles' },
    { name: Permission.MEMBER_REMOVE, resource: 'member', action: 'remove', description: 'Remove members' },

    // Roles
    { name: Permission.ROLE_READ, resource: 'role', action: 'read', description: 'View roles and permissions' },
    { name: Permission.ROLE_CREATE, resource: 'role', action: 'create', description: 'Create custom roles' },
    { name: Permission.ROLE_UPDATE, resource: 'role', action: 'update', description: 'Update custom roles' },
    { name: Permission.ROLE_DELETE, resource: 'role', action: 'delete', description: 'Delete custom roles' },

    // Tags
    { name: Permission.TAG_READ, resource: 'tag', action: 'read', description: 'View tags' },
    { name: Permission.TAG_CREATE, resource: 'tag', action: 'create', description: 'Create tags' },
    { name: Permission.TAG_UPDATE, resource: 'tag', action: 'update', description: 'Update tags' },
    { name: Permission.TAG_DELETE, resource: 'tag', action: 'delete', description: 'Delete tags' },

    // Projects
    { name: Permission.PROJECT_READ, resource: 'project', action: 'read', description: 'View projects' },
    { name: Permission.PROJECT_CREATE, resource: 'project', action: 'create', description: 'Create projects' },
    { name: Permission.PROJECT_UPDATE, resource: 'project', action: 'update', description: 'Update projects' },
    { name: Permission.PROJECT_DELETE, resource: 'project', action: 'delete', description: 'Delete projects' },

    // Tasks
    { name: Permission.TASK_READ, resource: 'task', action: 'read', description: 'View tasks' },
    { name: Permission.TASK_CREATE, resource: 'task', action: 'create', description: 'Create tasks' },
    { name: Permission.TASK_UPDATE, resource: 'task', action: 'update', description: 'Update tasks' },
    { name: Permission.TASK_DELETE, resource: 'task', action: 'delete', description: 'Delete tasks' },

    // Billing & API Keys
    { name: Permission.BILLING_MANAGE, resource: 'billing', action: 'manage', description: 'Manage billing and subscriptions' },
    { name: Permission.API_KEY_MANAGE, resource: 'apikey', action: 'manage', description: 'Manage API keys' }
];

export function formatPermission(resource: string, action: string) : string {
    return `${resource}:${action}`
}

const ALL_PERMISSIONS: readonly Permission[] = Object.values(Permission);

export const SYSTEM_ROLE_PERMISSIONS: Record<SystemRole, readonly Permission[]> = {
    [SystemRole.OWNER]: ALL_PERMISSIONS,

    [SystemRole.ADMIN]: ALL_PERMISSIONS.filter(p => 
        p !== Permission.ORGANIZATION_DELETE && 
        p !== Permission.BILLING_MANAGE && 
        p !== Permission.ROLE_DELETE
    ),

    [SystemRole.MEMBER]: [
        Permission.ORGANIZATION_READ,
        Permission.MEMBER_READ,
        Permission.ROLE_READ,
        Permission.TAG_READ,
        Permission.TAG_CREATE,
        Permission.TAG_UPDATE,
        Permission.PROJECT_READ,
        Permission.PROJECT_CREATE,
        Permission.PROJECT_UPDATE,
        Permission.TASK_READ,
        Permission.TASK_CREATE,
        Permission.TASK_UPDATE
    ],

    [SystemRole.VIEWER]: [
        Permission.ORGANIZATION_READ,
        Permission.MEMBER_READ,
        Permission.ROLE_READ,
        Permission.TAG_READ,
        Permission.PROJECT_READ,
        Permission.TASK_READ
    ]
};
