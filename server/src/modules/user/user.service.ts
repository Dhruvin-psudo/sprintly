import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt'
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { getRoleHierarchyLevel } from '../../common/constants/permissions';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedResult } from '../../common/dto';
import { AuthEmailAlreadyExistsException, AuthInvalidCredentialsException, ResourceNotFoundException } from '../../common/errors';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name)

    constructor (
        private readonly userRepository: UserRepository,
        private readonly configService: ConfigService
    ) {}

    async create(createUserDto : CreateUserDto): Promise<Omit <User, 'passwordHash'>> {
        const isEmailTaken = await this.userRepository.isEmailTaken(createUserDto.email)

        if(isEmailTaken) {
            throw new AuthEmailAlreadyExistsException()
        }

        const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS', 10))
        const passwordHash = await bcrypt.hash(createUserDto.passwordHash, saltRounds)

        const user = await this.userRepository.create({
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName ?? '',
            email: createUserDto.email,
            passwordHash: passwordHash
        })

        this.logger.log({ userId : user.id, email : createUserDto.email}, 'User created')

        return user
    }

    async updatePassword(userId: string, newPassword: string) : Promise<void> {        
        // generate passwordHash
        const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS', 10));
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        await this.userRepository.update(userId, {passwordHash})
    }

    /**
     * Get Organization Users with pagination, filters, sorting, and populate
     * @param organizationId
     * @param query
     * @returns
     */
    async getOrganizationUsers(
        organizationId: string,
        callerRoleId: string,
        query: UserQueryDto
    ): Promise<PaginatedResult<Omit<User, 'passwordHash'>>> {
        const { data, total} = await this.userRepository.findByOrganization(organizationId, {
            ...query,
            callerRoleId
        })

        return PaginatedResult.create(data, total, query.page, query.limit)
    }

    /**
     * Get User By Email
     * @param email
     * @returns
     */
    async getByEmail(email: string): Promise<User | null> {
        return this.userRepository.getByEmail(email);
    }

    /**
     * Find User By Id
     * @param id
     */
    async findById(id: string): Promise<Omit<User, 'passwordHash'>> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new ResourceNotFoundException('User', id)
        }

        return user;
    }

    async getMe(userId: string, organizationId: string) {
        const user = await this.userRepository.getWithMembership(userId, organizationId);

        if(!user) {
            throw new ResourceNotFoundException('User', userId)
        }

        const { currentRole, ...rest} = user;

        return { 
            ...rest,
            currentRole: currentRole
                ? { ...currentRole, hierarchyLevel: getRoleHierarchyLevel(currentRole.name)}
                : null
        };
    }

    async changePassword(
        userId: string,
        changePasswordDto: ChangePasswordDto
    ) : Promise<void> {
        const user = await this.userRepository.getByEmail((await this.findById(userId)).email)

        if (!user) {
            throw new ResourceNotFoundException('User', userId)
        }

        const isPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.passwordHash)
        
        if (!isPasswordValid) {
            throw new AuthInvalidCredentialsException()
        }

        await this.updatePassword(userId, changePasswordDto.newPassword);

        this.logger.log({ userId }, 'Password changed');
    }

    /**
     * Update User Last Active Org
     * @param userId
     * @param orgId
     */
    async updateLastActiveOrg(userId: string, organizationId: string): Promise<void> {
        return this.userRepository.updateLastActiveOrg(userId, organizationId);
    }

    async updateLastLoginAt(userId: string): Promise<void> {
        return this.userRepository.updateLastLoginAt(userId)
    }

    async remove(userId: string) : Promise<void> {
        await this.findById(userId);
        await this.userRepository.softDelete(userId)

        this.logger.warn({userId}, 'User soft-deleted')
    }
}
