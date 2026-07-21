export interface PaginationData {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPage: number;


    readonly [extra: string] : unknown;
}

export class ApiResponse<T> {
    readonly success = true as const;
    readonly data: T;
    readonly message?: string;
    readonly meta?: PaginationData;

    private constructor(data : T, message?: string, meta?: PaginationData) {
        this.data = data;
        if(message){
            this.message = message;
        }
        if(meta) {
            this.meta = meta;
        }
    }

    static ok<T>(data: T, message?: string): ApiResponse<T> {
        return new ApiResponse(data, message)
    }

    static paginated<T>(data: T, meta: PaginationData, message?: string): ApiResponse<T> {
        return new ApiResponse(data, message, meta)
    }
}