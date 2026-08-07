export interface IUser {
    readonly id: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName?: string;
    readonly status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    readonly lastLoginAt: string | null;
    readonly lastActiveOrgId: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly currentRole: { id: string; name: string; hierarchyLevel: number } | null;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  firstName: string;
  lastName?: string;
  email: string;
  passwordHash: string;
}

export interface ILoginResponse {
  accessToken: string;
  user: IUser;
  hasOrganization: boolean;
}

export interface IRegisterResponse {
  user: IUser;
}
