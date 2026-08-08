import { DomainException } from "./domain-exception";
import { ErrorCode } from "./error-codes";


// 10xxx — General / Common

export class ValidationFailedException extends DomainException {
    constructor(details: Record<string, readonly string[]>) {
        super(ErrorCode.VALIDATION_FAILED, 'Validation failed', details);
    }
}

export class ResourceNotFoundException extends DomainException {
    constructor(resource: string, id: string) {
        super(ErrorCode.RESOURCE_NOT_FOUND, `${resource} with id ${id} not found`);
    }
}

export class DuplicateResourceException extends DomainException {
    constructor(resource: string, field?: string) {
        const message = field
            ? `${resource} with this ${field} already exists`
            : `${resource} already exists`;
        super(ErrorCode.DUPLICATE_RESOURCE, message);
    }
}

export class DomainForbiddenException extends DomainException {
    constructor(message?: string) {
        super(ErrorCode.FORBIDDEN, message);
    }
}

export class RateLimitedException extends DomainException {
    constructor(message?: string) {
        super(ErrorCode.RATE_LIMITED, message);
    }
}

export class OrgRateLimitExceededException extends DomainException {
    constructor(
        readonly retryAfterSec: number,
        readonly limit: number,
        readonly window: 'minute' | 'day',
    ) {
        super(
            ErrorCode.RATE_LIMITED,
            `Organization request limit exceeded (${String(limit)} / ${window}). Retry after ${String(retryAfterSec)}s.`,
            { retryAfterSec, limit, window },
        );
    }
}

// 11xxx — Auth

export class AuthInvalidCredentialsException extends DomainException {
    constructor() {
        super(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
}

export class AuthTokenExpiredException extends DomainException {
    constructor() {
        super(ErrorCode.AUTH_TOKEN_EXPIRED);
    }
}

export class AuthTokenInvalidException extends DomainException {
    constructor() {
        super(ErrorCode.AUTH_TOKEN_INVALID);
    }
}

export class AuthRefreshTokenExpiredException extends DomainException {
    constructor() {
        super(ErrorCode.AUTH_REFRESH_TOKEN_EXPIRED);
    }
}

export class AuthAccountSuspendedException extends DomainException {
    constructor() {
        super(ErrorCode.AUTH_ACCOUNT_SUSPENDED);
    }
}

export class AuthEmailAlreadyExistsException extends DomainException {
    constructor() {
        super(ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
    }
}

export class AuthResetTokenInvalidException extends DomainException {
    constructor() {
        super(ErrorCode.AUTH_RESET_TOKEN_INVALID);
    }
}

export class AuthPasswordTooWeakException extends DomainException {
    constructor() {
        super(ErrorCode.AUTH_PASSWORD_TOO_WEAK);
    }
}

export class AuthNoMembershipException extends DomainException {
    constructor() {
        super(ErrorCode.AUTH_NO_MEMBERSHIP);
    }
}

export class AuthAccountInactiveException extends DomainException {
    constructor() {
        super(ErrorCode.AUTH_ACCOUNT_INACTIVE);
    }
}

// 14xxx — Roles & Permissions

export class RoleNotFoundException extends DomainException {
    constructor(name: string) {
        super(ErrorCode.ROLE_NOT_FOUND, `Role '${name}' not found`);
    }
}

export class RoleIsSystemException extends DomainException {
    constructor() {
        super(ErrorCode.ROLE_IS_SYSTEM);
    }
}

export class RoleHasMembersException extends DomainException {
    constructor(memberCount: number) {
        super(
            ErrorCode.ROLE_IN_USE,
            `Role cannot be deleted while assigned to ${memberCount} member${
                memberCount === 1 ? '' : 's'
            }`,
            { memberCount },
        );
    }
}

// 15xxx — Tasks

export class TaskNotFoundException extends DomainException {
    constructor(taskId: string) {
        super(ErrorCode.TASK_NOT_FOUND, `Task not found`);
    }
}

export class TaskProjectMismatchException extends DomainException {
    constructor(taskId: string, projectId: string) {
        super(ErrorCode.TASK_PROJECT_MISMATCH, `Task was not in this project`);
    }
}

export class TaskAssigneeNotMemberException extends DomainException {
    constructor(assigneeId: string) {
        super(ErrorCode.TASK_ASSIGNEE_NOT_MEMBER, `Assigned user must be an active member of this organization`);
    }
}

export class TaskAlreadyCompletedException extends DomainException {
    constructor() {
        super(ErrorCode.TASK_ALREADY_COMPLETED, `Task marked as COMPLETED cannot be moved to another status`);
    }
}

export class InvalidTaskDueDateException extends DomainException {
    constructor(message: string) {
        super(ErrorCode.INVALID_TASK_DUE_DATE, message);
    }
}

