import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma";
import { Permission } from "@prisma/client";

@Injectable()
export class PermissionRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() : Promise<Omit<Permission, 'createdAt' | 'updatedAt'>[]> {
        return this.prisma.permission.findMany({
            omit: { createdAt: true, updatedAt: true},
            orderBy: [{ resource: 'asc'}, {action: 'asc'}]
        })
    }
}