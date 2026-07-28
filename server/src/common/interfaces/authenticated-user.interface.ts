interface IBaseUser {
    userId: string;
    refreshTokenId: string;
}

export interface IAuthenticatedUser extends IBaseUser {
    organizationId: string;
    roleId: string;
    isCompletedOnboarding: true;
}

export interface IOnboardingUser extends IBaseUser {
    organizationId: null;
    roleId: null;
    isCompletedOnboarding: false;
}

export type IJwtUser = IAuthenticatedUser | IOnboardingUser;