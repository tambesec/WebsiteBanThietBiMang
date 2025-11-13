import { Response } from 'express';
import type { ApiResponse, PaginatedResponse, PaginationMeta } from '../types/api';
import { HTTP_STATUS } from '../config/constants';

export const sendSuccess = <T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = HTTP_STATUS.OK
): void => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error?: string
): void => {
    const response: ApiResponse = {
        success: false,
        message,
        error: error || message,
        timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(response);
};

export const sendPaginatedSuccess = <T>(
    res: Response,
    data: T[],
    meta: PaginationMeta,
    message: string = 'Lấy dữ liệu thành công',
    statusCode: number = HTTP_STATUS.OK
): void => {
    const response: ApiResponse<PaginatedResponse<T>> = {
        success: true,
        message,
        data: { data, meta },
        timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(response);
};

export const getPaginationMeta = (
    total: number,
    page: number,
    limit: number
): PaginationMeta => {
    const pages = Math.ceil(total / limit);
    return {
        total,
        page,
        limit,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
    };
};
