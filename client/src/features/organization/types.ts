export interface IOrganization {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly plan: string;
  readonly email?: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly owner?: {
    readonly id: string;
    readonly email: string;
    readonly firstName: string;
    readonly lastName?: string;
  };
}

export interface ICreateOrganizationRequest {
  name: string;
  email?: string;
}

export interface ICreateOrganizationResponse {
  accessToken?: string;
  organization: IOrganization;
}
