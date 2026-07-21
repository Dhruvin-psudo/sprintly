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

    async create(createUserDto : CreateUserDto): Promise<Omit <User, 'password'>> {
        console.log(createUserDto)
        const isEmailTaken = await this.userRepository.isEmailTaken(createUserDto.email)

        // if(isEmailTaken) {
        //     throw new 
        // }

        const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS', 10))
        const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds)

        const user = await this.userRepository.create({
            name: createUserDto.name,
            email: createUserDto.email,
            password: passwordHash
        })

        this.logger.log({ userId : user.id, email : createUserDto.email}, 'User created')

        return user
    }
}
