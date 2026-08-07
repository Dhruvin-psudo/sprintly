export interface IOrganization {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly plan: string;
  readonly email?: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ICreateOrganizationRequest {
  name: string;
  email?: string;
}

export interface ICreateOrganizationResponse {
  accessToken?: string;
  organization: IOrganization;
}
