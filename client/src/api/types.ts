export interface IApiResponse<T> {
    readonly success: boolean;
    readonly data: T;
    readonly message?: string;
}

export interface IApiErrorResponse {
    readonly statusCode: number;
    readonly message: string | string[];
    readonly error: string;
}

export interface IAccessTokenResponse {
    readonly accessToken: string
}

export interface IMessageResponse {
    readonly message: string;
}

export interface IPaginatedResponse<T> {
    readonly data: readonly T[];
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
}

export const SortOrder = {
    ASC: 'asc',
    DESC: 'desc',
} as const;