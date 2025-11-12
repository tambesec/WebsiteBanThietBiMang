// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface JwtPayload {
    id: number;
    email: string;
    username: string;
    roles: string[];
}

export interface AuthUser {
    id: number;
    email: string;
    username: string;
    roles: string[];
}

export interface RequestUser {
    id: number;
    email: string;
    username: string;
    roles: string[];
}
