import { Injectable } from '@nestjs/common';
import { PermissionRepository } from './permission.repository';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionService {
    constructor(private readonly permissionRepository: PermissionRepository) {} 

    async getAll() : Promise<Omit<Permission, 'createdAt' | 'updatedAt' >[]> {
        return this.permissionRepository.findAll()
    }
}
