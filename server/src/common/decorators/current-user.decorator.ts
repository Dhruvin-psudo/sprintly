import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IAuthenticatedUser } from "../interfaces/authenticated-user.interface";

export const CurrentUser = createParamDecorator(
    (data: keyof IAuthenticatedUser | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<{ user: IAuthenticatedUser }>()
        const user: IAuthenticatedUser = request.user
        return data ? user[data] : user
    }
)