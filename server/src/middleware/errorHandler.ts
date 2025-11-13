import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { HTTP_STATUS } from '../config/constants';

export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}

export const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Lỗi nội bộ server';

    sendError(res, message, statusCode, err.stack);
};

export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        void Promise.resolve(fn(req, res, next)).catch(next);
    };
};
