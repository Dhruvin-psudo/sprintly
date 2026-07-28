export { ErrorCode } from './error-codes';
export type { IErrorCodeMetaData } from './error-code-registry';
export { getErrorMetaData, getErrorMetaDataByHttpStatus } from './error-code-registry';
export { DomainException } from './domain-exception';
export {
    ValidationFailedException,
    ResourceNotFoundException,
    DuplicateResourceException,
    DomainForbiddenException,
    RateLimitedException,
    OrgRateLimitExceededException,
    AuthInvalidCredentialsException,
    AuthTokenExpiredException,
    AuthTokenInvalidException,
    AuthRefreshTokenExpiredException,
    AuthAccountSuspendedException,
    AuthEmailAlreadyExistsException,
    AuthResetTokenInvalidException,
    AuthPasswordTooWeakException,
    AuthNoMembershipException,
    AuthAccountInactiveException,
    RoleNotFoundException,
    RoleIsSystemException,
    RoleHasMembersException,
} from './domain-exceptions'