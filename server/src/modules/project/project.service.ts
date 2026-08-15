import { Injectable } from "@nestjs/common";
import { ProjectRepository } from "./project.repository";
import { RoleRepository } from "../role/role.repository";
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto, AssignProjectMemberDto } from "./dto";
import { IAuthenticatedUser } from "../../common/interfaces";
import { DuplicateResourceException, ResourceNotFoundException, ValidationFailedException } from "../../common/errors";
import { SystemRole } from "../../common/constants";

@Injectable()
export class ProjectService {
    constructor(
        private readonly projectRepository: ProjectRepository,
        private readonly roleRepository: RoleRepository
    ) {}

    async createProject(dto: CreateProjectDto, user: IAuthenticatedUser) {
        // Check if lead belongs to org and is Owner/Admin
        const isLeadValid = await this.projectRepository.validateProjectLead(user.organizationId, dto.leadId);
        if (!isLeadValid) {
            throw new ValidationFailedException({ leadId: ['Project lead must be an Owner or Admin of this organization.'] });
        }

        // Check if additional members belong to org
        if (dto.memberIds && dto.memberIds.length > 0) {
            const areMembersValid = await this.projectRepository.validateOrgMembers(user.organizationId, dto.memberIds);
            if (!areMembersValid) {
                throw new ValidationFailedException({ memberIds: ['All assigned members must be active members of this organization.'] });
            }
        }

        // Check duplicate name in org
        const nameTaken = await this.projectRepository.isNameTakenInOrg(user.organizationId, dto.name);
        if (nameTaken) {
            throw new DuplicateResourceException('Project', 'name');
        }

        const codeTaken = await this.projectRepository.isCodeTakenInOrg(user.organizationId, dto.code);
        if (codeTaken) {
            throw new DuplicateResourceException('Project', 'code');
        }

        if (dto.startDate && dto.dueDate && new Date(dto.dueDate) < new Date(dto.startDate)) {
            throw new ValidationFailedException({ dueDate: ['Due date cannot be earlier than start date.'] });
        }

        return this.projectRepository.create({
            organizationId: user.organizationId,
            name: dto.name,
            code: dto.code,
            description: dto.description,
            phase: dto.phase,
            priority: dto.priority,
            startDate: dto.startDate,
            dueDate: dto.dueDate,
            leadId: dto.leadId,
            createdBy: user.userId,
            memberIds: dto.memberIds
        });
    }

    async getProjects(user: IAuthenticatedUser, query: ProjectQueryDto) {
        const role = await this.roleRepository.findRoleWithPermissions(user.roleId, user.organizationId);
        const roleName = role?.name?.toUpperCase() ?? SystemRole.VIEWER;

        return this.projectRepository.findMany({
            organizationId: user.organizationId,
            userId: user.userId,
            roleName,
            query
        });
    }

    async getProjectById(id: string, user: IAuthenticatedUser) {
        const project = await this.projectRepository.findById(id, user.organizationId);
        if (!project) {
            throw new ResourceNotFoundException('Project', id);
        }

        const role = await this.roleRepository.findRoleWithPermissions(user.roleId, user.organizationId);
        const roleName = role?.name?.toUpperCase() ?? SystemRole.VIEWER;
        const isElevated = roleName === SystemRole.OWNER || roleName === SystemRole.ADMIN;

        if (!isElevated) {
            const isLeadOrMember = project.leadId === user.userId || project.members.some((m) => m.userId === user.userId || m.user.id === user.userId);
            if (!isLeadOrMember) {
                throw new ResourceNotFoundException('Project', id);
            }
        }

        return project;
    }


    async updateProject(id: string, dto: UpdateProjectDto, user: IAuthenticatedUser) {
        const existing = await this.projectRepository.findById(id, user.organizationId);
        if (!existing) {
            throw new ResourceNotFoundException('Project', id);
        }

        if (dto.name && dto.name !== existing.name) {
            const nameTaken = await this.projectRepository.isNameTakenInOrg(user.organizationId, dto.name, id);
            if (nameTaken) {
                throw new DuplicateResourceException('Project', 'name');
            }
        }

        if (dto.leadId) {
            const isLeadValid = await this.projectRepository.validateProjectLead(user.organizationId, dto.leadId);
            if (!isLeadValid) {
                throw new ValidationFailedException({ leadId: ['Project lead must be an Owner or Admin of this organization.'] });
            }
        }

        if (dto.memberIds && dto.memberIds.length > 0) {
            const areMembersValid = await this.projectRepository.validateOrgMembers(user.organizationId, dto.memberIds);
            if (!areMembersValid) {
                throw new ValidationFailedException({ memberIds: ['All assigned members must be active members of this organization.'] });
            }
        }

        const updated = await this.projectRepository.update(id, user.organizationId, {
            name: dto.name,
            description: dto.description,
            phase: dto.phase,
            priority: dto.priority,
            startDate: dto.startDate,
            dueDate: dto.dueDate,
            leadId: dto.leadId,
            updatedBy: user.userId
        });

        if (dto.memberIds && dto.memberIds.length > 0) {
            await this.projectRepository.addMembers(id, dto.memberIds, user.userId);
        }

        return this.projectRepository.findById(id, user.organizationId);
    }

    async deleteProject(id: string, user: IAuthenticatedUser) {
        const existing = await this.projectRepository.findById(id, user.organizationId);
        if (!existing) {
            throw new ResourceNotFoundException('Project', id);
        }

        await this.projectRepository.softDelete(id, user.organizationId, user.userId);
    }

    async addMembers(id: string, dto: AssignProjectMemberDto, user: IAuthenticatedUser) {
        const existing = await this.projectRepository.findById(id, user.organizationId);
        if (!existing) {
            throw new ResourceNotFoundException('Project', id);
        }

        const areMembersValid = await this.projectRepository.validateOrgMembers(user.organizationId, dto.userIds);
        if (!areMembersValid) {
            throw new ValidationFailedException({ userIds: ['All assigned members must be active members of this organization.'] });
        }

        await this.projectRepository.addMembers(id, dto.userIds, user.userId);
        return this.projectRepository.findById(id, user.organizationId);
    }

    async removeMember(id: string, targetUserId: string, user: IAuthenticatedUser) {
        const existing = await this.projectRepository.findById(id, user.organizationId);
        if (!existing) {
            throw new ResourceNotFoundException('Project', id);
        }

        if (existing.leadId === targetUserId) {
            throw new ValidationFailedException({ userId: ['Cannot remove project lead from project members. Reassign lead first.'] });
        }

        await this.projectRepository.removeMember(id, targetUserId);
        return this.projectRepository.findById(id, user.organizationId);
    }
}
