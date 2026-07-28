import { SetMetadata } from '@nestjs/common';

export const ALLOW_ONBOARDING_KEY = 'allowOnboarding';
export const AllowOnboarding = () => SetMetadata(ALLOW_ONBOARDING_KEY, true);
