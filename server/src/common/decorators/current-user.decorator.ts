import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IJwtUser } from "../interfaces";

export const CurrentUser = createParamDecorator(
    (data: keyof IJwtUser | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<{ user: IJwtUser }>()
        const user: IJwtUser = request.user
        return data ? user[data] : user
    }
)