export const SEARCH_MODE = 'insensitive' as const;

export enum SortOrder { 
    ASC = 'asc',
    DESC = 'desc'
}

export const DEFAULT_SORT_FIELD = 'createdAt';
export const DEFAULT_SORT_ORDER = SortOrder.DESC;