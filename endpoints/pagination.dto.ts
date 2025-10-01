export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiPluralResponse<T> {
    success: boolean;
    data?: PaginationResult<T>;
    message?: string;
    statusCode?: number;
    timestamp: string;
    path?: string;
    method?: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    statusCode?: number;
    timestamp: string;
    path?: string;
    method?: string;
}