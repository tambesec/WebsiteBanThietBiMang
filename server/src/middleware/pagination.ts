import { Request, Response, NextFunction } from 'express';
import { getPagination } from '../utils/pagination';

export const paginationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const pagination = getPagination({
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined,
    });

    req.pagination = {
        skip: pagination.skip,
        take: pagination.take,
        page: pagination.page,
        limit: pagination.limit,
    };

    next();
};
