import { SetMetadata } from '@nestjs/common';

export const ALLOW_WITHOUT_ORG_KEY = 'allowWithoutOrg';
export const AllowWithoutOrg = () => SetMetadata(ALLOW_WITHOUT_ORG_KEY, true);
