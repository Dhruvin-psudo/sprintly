import { ForbiddenException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { RegisterUserDto } from "./dto/register-user.dto";
import { UserService } from "../user/user.service";
import { loginUserDto } from "./dto/login-user.dto";
import { User , UserStatus} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { RoleService } from "../../role/role.service";
import { TokenService } from "../../token/token.service";

export interface AuthTokensResponse {
    user: Omit<User, 'passwordHash'>;
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)

    constructor(
        private readonly userService: UserService,
        private readonly roleService: RoleService,
        private readonly tokenService: TokenService
    ) { }

    async register(registerUserDto: RegisterUserDto) {
        const user = await this.userService.create(registerUserDto)
        this.logger.log({ userId: user.id }, 'User registered')
        return user
    }

    /** Login User */
    async login(loginUserDto : loginUserDto) : Promise<AuthTokensResponse> {
        this.logger.log('User login attempt started')
        const user = await this.userService.getByEmail(loginUserDto.email)

        if(!user) {
            this.logger.log('User not found', loginUserDto.email)
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.passwordHash)

        if (!isPasswordValid) {
            this.logger.log('Invalid password', loginUserDto.email)
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status === UserStatus.SUSPENDED) {
            this.logger.log('Account is suspended', loginUserDto.email)
            throw new ForbiddenException('Account is suspended');
        }
        if (user.status === UserStatus.INACTIVE) {
            this.logger.log('Account is inactive', loginUserDto.email)
            throw new ForbiddenException('Account is inactive');
        }

        const { accessToken, refreshToken } = await this.tokenService.generateAuthTokens(user.id);

        const { passwordHash: _hash, ...userWithoutPassword } = user;

        this.logger.log({ userId: user.id }, 'Login successful');

        return { user: userWithoutPassword, accessToken, refreshToken };
    }
}