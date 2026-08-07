import { PaginationData } from "./api-response.dto";

export class PaginatedResult<T> {
    readonly data: readonly T[];
    readonly meta: PaginationData

    private constructor(data: readonly T[], meta: PaginationData) {
        this.data = data;
        this.meta = meta;
    }

    static create<T>(
        data: readonly T[],
        total: number,
        page: number,
        limit: number
    ) : PaginatedResult<T> {
        return new PaginatedResult(data,{
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        })
    }
}