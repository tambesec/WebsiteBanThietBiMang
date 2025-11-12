import { env } from '../config/env';
import { PAGINATION } from '../config/constants';

export interface PaginationParams {
    page?: number | string;
    limit?: number | string;
}

export interface PaginationResult {
    skip: number;
    take: number;
    page: number;
    limit: number;
}

export const getPagination = (params: PaginationParams): PaginationResult => {
    let page = parseInt(params.page as string) || PAGINATION.DEFAULT_PAGE;
    let limit = parseInt(params.limit as string) || env.DEFAULT_PAGE_SIZE;

    // Validate page
    if (page < 1) page = 1;

    // Validate limit
    if (limit < 1) limit = 1;
    if (limit > env.MAX_PAGE_SIZE) limit = env.MAX_PAGE_SIZE;

    const skip = (page - 1) * limit;

    return {
        skip,
        take: limit,
        page,
        limit,
    };
};

export const calculatePages = (total: number, limit: number): number => {
    return Math.ceil(total / limit);
};

export const validatePagination = (pagination: PaginationResult): PaginationResult => {
    return getPagination({
        page: pagination.page,
        limit: pagination.limit,
    });
};
