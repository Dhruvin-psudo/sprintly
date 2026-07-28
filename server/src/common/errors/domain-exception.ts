import { HttpException } from "@nestjs/common";
import { ErrorCode } from "./error-codes";
import { getErrorMetaData } from "./error-code-registry";

export class DomainException extends HttpException {
    readonly errorCode: ErrorCode;
    readonly details: Record<string, unknown> | null

    constructor(
        errorCode: ErrorCode,
        messageOverride?: string,
        details?: Record<string, unknown>
    ) {
        const metadata = getErrorMetaData(errorCode);
        const message = messageOverride ?? metadata.message;
        super(message, metadata.httpStatus);
        this.errorCode = errorCode;
        this.details = details ?? null;
    }
}