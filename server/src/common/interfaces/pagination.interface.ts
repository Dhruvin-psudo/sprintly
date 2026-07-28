export interface IPaginationQuery {
    page: number,
    limit: number
}

export interface IPaginatedData<T> {
    data: T[],
    total: number
}