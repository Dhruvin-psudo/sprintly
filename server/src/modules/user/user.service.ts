import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './user.repository';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name)

    constructor (
        private readonly userRepository: UserRepository,
        private readonly configService: ConfigService
    ) {}

    async create(createUserDto : CreateUserDto): Promise<Omit <User, 'passwordHash'>> {
        const isEmailTaken = await this.userRepository.isEmailTaken(createUserDto.email)

        // if(isEmailTaken) {
        //     throw new 
        // }

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

    /**
     * Get User By Email
     * @param email
     * @returns
     */
    async getByEmail(email: string): Promise<User | null> {
        return this.userRepository.getByEmail(email);
    }
}
