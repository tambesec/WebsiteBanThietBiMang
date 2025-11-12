import type { RequestUser } from './api';

declare global {
    namespace Express {
        interface Request {
            user?: RequestUser;
            pagination?: {
                skip: number;
                take: number;
                page: number;
                limit: number;
            };
        }
    }
}

declare module 'cors';
