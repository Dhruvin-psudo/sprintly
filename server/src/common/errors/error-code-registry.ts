import { ErrorCode } from "./error-codes";

export interface IErrorCodeMetaData {
    readonly errorCode: ErrorCode;
    readonly code: string;
    readonly httpStatus: number;
    readonly message: string;
}

const ERROR_CODE_REGISTRY: ReadonlyMap<ErrorCode, IErrorCodeMetaData> = new Map<
    ErrorCode,
    IErrorCodeMetaData
>([
    // 10xxx — General / Common
    [
        ErrorCode.UNKNOWN_ERROR,
        {
            errorCode: ErrorCode.UNKNOWN_ERROR,
            code: 'UNKNOWN_ERROR',
            httpStatus: 500,
            message: 'An unexpected error occurred',
        },
    ],
    [
        ErrorCode.VALIDATION_FAILED,
        {
            errorCode: ErrorCode.VALIDATION_FAILED,
            code: 'VALIDATION_FAILED',
            httpStatus: 400,
            message: 'Validation failed',
        },
    ],
    [
        ErrorCode.RESOURCE_NOT_FOUND,
        {
            errorCode: ErrorCode.RESOURCE_NOT_FOUND,
            code: 'RESOURCE_NOT_FOUND',
            httpStatus: 404,
            message: 'Resource not found',
        },
    ],
    [
        ErrorCode.DUPLICATE_RESOURCE,
        {
            errorCode: ErrorCode.DUPLICATE_RESOURCE,
            code: 'DUPLICATE_RESOURCE',
            httpStatus: 409,
            message: 'Resource already exists',
        },
    ],
    [
        ErrorCode.FORBIDDEN,
        {
            errorCode: ErrorCode.FORBIDDEN,
            code: 'FORBIDDEN',
            httpStatus: 403,
            message: 'You do not have permission to perform this action',
        },
    ],
    [
        ErrorCode.RATE_LIMITED,
        {
            errorCode: ErrorCode.RATE_LIMITED,
            code: 'RATE_LIMITED',
            httpStatus: 429,
            message: 'Too many requests, please try again later',
        },
    ],
    [
        ErrorCode.INTERNAL_ERROR,
        {
            errorCode: ErrorCode.INTERNAL_ERROR,
            code: 'INTERNAL_ERROR',
            httpStatus: 500,
            message: 'Internal server error',
        },
    ],
    [
        ErrorCode.SERVICE_UNAVAILABLE,
        {
            errorCode: ErrorCode.SERVICE_UNAVAILABLE,
            code: 'SERVICE_UNAVAILABLE',
            httpStatus: 503,
            message: 'Service temporarily unavailable',
        },
    ],
    [
        ErrorCode.METHOD_NOT_ALLOWED,
        {
            errorCode: ErrorCode.METHOD_NOT_ALLOWED,
            code: 'METHOD_NOT_ALLOWED',
            httpStatus: 405,
            message: 'HTTP method not allowed',
        },
    ],
    [
        ErrorCode.PAYLOAD_TOO_LARGE,
        {
            errorCode: ErrorCode.PAYLOAD_TOO_LARGE,
            code: 'PAYLOAD_TOO_LARGE',
            httpStatus: 413,
            message: 'Request payload is too large',
        },
    ],

    // 11xxx — Auth
    [
        ErrorCode.AUTH_INVALID_CREDENTIALS,
        {
            errorCode: ErrorCode.AUTH_INVALID_CREDENTIALS,
            code: 'AUTH_INVALID_CREDENTIALS',
            httpStatus: 401,
            message: 'Invalid email or password',
        },
    ],
    [
        ErrorCode.AUTH_TOKEN_EXPIRED,
        {
            errorCode: ErrorCode.AUTH_TOKEN_EXPIRED,
            code: 'AUTH_TOKEN_EXPIRED',
            httpStatus: 401,
            message: 'Authentication token has expired',
        },
    ],
    [
        ErrorCode.AUTH_TOKEN_INVALID,
        {
            errorCode: ErrorCode.AUTH_TOKEN_INVALID,
            code: 'AUTH_TOKEN_INVALID',
            httpStatus: 401,
            message: 'Authentication token is invalid',
        },
    ],
    [
        ErrorCode.AUTH_REFRESH_TOKEN_EXPIRED,
        {
            errorCode: ErrorCode.AUTH_REFRESH_TOKEN_EXPIRED,
            code: 'AUTH_REFRESH_TOKEN_EXPIRED',
            httpStatus: 401,
            message: 'Refresh token has expired',
        },
    ],
    [
        ErrorCode.AUTH_ACCOUNT_SUSPENDED,
        {
            errorCode: ErrorCode.AUTH_ACCOUNT_SUSPENDED,
            code: 'AUTH_ACCOUNT_SUSPENDED',
            httpStatus: 403,
            message: 'Account has been suspended',
        },
    ],
    [
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
        {
            errorCode: ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
            code: 'AUTH_EMAIL_ALREADY_EXISTS',
            httpStatus: 409,
            message: 'An account with this email already exists',
        },
    ],
    [
        ErrorCode.AUTH_RESET_TOKEN_INVALID,
        {
            errorCode: ErrorCode.AUTH_RESET_TOKEN_INVALID,
            code: 'AUTH_RESET_TOKEN_INVALID',
            httpStatus: 400,
            message: 'Password reset token is invalid or expired',
        },
    ],
    [
        ErrorCode.AUTH_PASSWORD_TOO_WEAK,
        {
            errorCode: ErrorCode.AUTH_PASSWORD_TOO_WEAK,
            code: 'AUTH_PASSWORD_TOO_WEAK',
            httpStatus: 400,
            message: 'Password does not meet strength requirements',
        },
    ],
    [
        ErrorCode.AUTH_SESSION_EXPIRED,
        {
            errorCode: ErrorCode.AUTH_SESSION_EXPIRED,
            code: 'AUTH_SESSION_EXPIRED',
            httpStatus: 401,
            message: 'Session has expired, please log in again',
        },
    ],

    [
        ErrorCode.AUTH_NO_MEMBERSHIP,
        {
            errorCode: ErrorCode.AUTH_NO_MEMBERSHIP,
            code: 'AUTH_NO_MEMBERSHIP',
            httpStatus: 403,
            message: 'User has no organization memberships',
        },
    ],
    [
        ErrorCode.AUTH_ACCOUNT_INACTIVE,
        {
            errorCode: ErrorCode.AUTH_ACCOUNT_INACTIVE,
            code: 'AUTH_ACCOUNT_INACTIVE',
            httpStatus: 403,
            message: 'Account is inactive',
        },
    ],

    // 12xxx — Organizations
    [
        ErrorCode.ORG_NOT_FOUND,
        {
            errorCode: ErrorCode.ORG_NOT_FOUND,
            code: 'ORG_NOT_FOUND',
            httpStatus: 404,
            message: 'Organization not found',
        },
    ],
    [
        ErrorCode.ORG_NAME_ALREADY_EXISTS,
        {
            errorCode: ErrorCode.ORG_NAME_ALREADY_EXISTS,
            code: 'ORG_NAME_ALREADY_EXISTS',
            httpStatus: 409,
            message: 'An organization with this name already exists',
        },
    ],
    [
        ErrorCode.ORG_MEMBER_LIMIT_REACHED,
        {
            errorCode: ErrorCode.ORG_MEMBER_LIMIT_REACHED,
            code: 'ORG_MEMBER_LIMIT_REACHED',
            httpStatus: 400,
            message: 'Organization member limit has been reached',
        },
    ],
    [
        ErrorCode.ORG_SUSPENDED,
        {
            errorCode: ErrorCode.ORG_SUSPENDED,
            code: 'ORG_SUSPENDED',
            httpStatus: 403,
            message: 'Organization has been suspended',
        },
    ],
    [
        ErrorCode.ORG_SLUG_TAKEN,
        {
            errorCode: ErrorCode.ORG_SLUG_TAKEN,
            code: 'ORG_SLUG_TAKEN',
            httpStatus: 409,
            message: 'Organization slug is already taken',
        },
    ],

    // 13xxx — Users
    [
        ErrorCode.USER_NOT_FOUND,
        {
            errorCode: ErrorCode.USER_NOT_FOUND,
            code: 'USER_NOT_FOUND',
            httpStatus: 404,
            message: 'User not found',
        },
    ],
    [
        ErrorCode.USER_ALREADY_EXISTS,
        {
            errorCode: ErrorCode.USER_ALREADY_EXISTS,
            code: 'USER_ALREADY_EXISTS',
            httpStatus: 409,
            message: 'User already exists in this organization',
        },
    ],
    [
        ErrorCode.USER_INVITATION_EXPIRED,
        {
            errorCode: ErrorCode.USER_INVITATION_EXPIRED,
            code: 'USER_INVITATION_EXPIRED',
            httpStatus: 400,
            message: 'User invitation has expired',
        },
    ],
    [
        ErrorCode.USER_INVITATION_ALREADY_ACCEPTED,
        {
            errorCode: ErrorCode.USER_INVITATION_ALREADY_ACCEPTED,
            code: 'USER_INVITATION_ALREADY_ACCEPTED',
            httpStatus: 400,
            message: 'Invitation has already been accepted',
        },
    ],
    [
        ErrorCode.USER_CANNOT_REMOVE_SELF,
        {
            errorCode: ErrorCode.USER_CANNOT_REMOVE_SELF,
            code: 'USER_CANNOT_REMOVE_SELF',
            httpStatus: 400,
            message: 'You cannot remove yourself from the organization',
        },
    ],
    [
        ErrorCode.USER_LAST_ADMIN,
        {
            errorCode: ErrorCode.USER_LAST_ADMIN,
            code: 'USER_LAST_ADMIN',
            httpStatus: 400,
            message: 'Cannot remove the last admin from the organization',
        },
    ],

    // 14xxx — Roles & Permissions
    [
        ErrorCode.ROLE_NOT_FOUND,
        {
            errorCode: ErrorCode.ROLE_NOT_FOUND,
            code: 'ROLE_NOT_FOUND',
            httpStatus: 404,
            message: 'Role not found',
        },
    ],
    [
        ErrorCode.ROLE_NAME_ALREADY_EXISTS,
        {
            errorCode: ErrorCode.ROLE_NAME_ALREADY_EXISTS,
            code: 'ROLE_NAME_ALREADY_EXISTS',
            httpStatus: 409,
            message: 'A role with this name already exists',
        },
    ],
    [
        ErrorCode.ROLE_IS_SYSTEM,
        {
            errorCode: ErrorCode.ROLE_IS_SYSTEM,
            code: 'ROLE_IS_SYSTEM',
            httpStatus: 400,
            message: 'System roles cannot be modified',
        },
    ],
    [
        ErrorCode.ROLE_IN_USE,
        {
            errorCode: ErrorCode.ROLE_IN_USE,
            code: 'ROLE_IN_USE',
            httpStatus: 400,
            message: 'Role cannot be deleted while assigned to users',
        },
    ],
    [
        ErrorCode.PERMISSION_DENIED,
        {
            errorCode: ErrorCode.PERMISSION_DENIED,
            code: 'PERMISSION_DENIED',
            httpStatus: 403,
            message: 'You do not have the required permission',
        },
    ],
])

export function getErrorMetaData(errorCode: ErrorCode) : IErrorCodeMetaData {
    const metadata = ERROR_CODE_REGISTRY.get(errorCode);
    if(!metadata) {
        throw new Error(`Missing error code metadata for ErrorCode: ${String(errorCode)}`);
    }
    return metadata;
};

const HTTP_STATUS_TO_ERROR_CODE: ReadonlyMap<number, ErrorCode> = new Map<number, ErrorCode>([
    [400, ErrorCode.VALIDATION_FAILED],
    [401, ErrorCode.AUTH_TOKEN_INVALID],
    [403, ErrorCode.FORBIDDEN],
    [404, ErrorCode.RESOURCE_NOT_FOUND],
    [405, ErrorCode.METHOD_NOT_ALLOWED],
    [409, ErrorCode.DUPLICATE_RESOURCE],
    [413, ErrorCode.PAYLOAD_TOO_LARGE],
    [429, ErrorCode.RATE_LIMITED],
    [500, ErrorCode.INTERNAL_ERROR],
    [503, ErrorCode.SERVICE_UNAVAILABLE],
])

export function getErrorMetaDataByHttpStatus(status: number): IErrorCodeMetaData {
    const errorCode = HTTP_STATUS_TO_ERROR_CODE.get(status) ?? ErrorCode.UNKNOWN_ERROR;
    return getErrorMetaData(errorCode);
}