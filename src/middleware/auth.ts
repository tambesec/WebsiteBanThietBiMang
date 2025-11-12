import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import { verifyAccessToken } from '../utils/jwt';

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const token = extractToken(req);

        if (!token) {
            sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.id,
            email: payload.email,
            username: payload.username,
            roles: payload.roles,
        };

        next();
    } catch (error: unknown) {
        const err = error as Record<string, unknown>;
        if ((err.name as string) === 'TokenExpiredError') {
            sendError(res, ERROR_MESSAGES.TOKEN_EXPIRED, HTTP_STATUS.UNAUTHORIZED);
        } else if ((err.name as string) === 'JsonWebTokenError') {
            sendError(res, ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
        } else {
            sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
        }
    }
};

export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const hasRole = req.user.roles.some((role: string) => roles.includes(role));

        if (!hasRole) {
            sendError(res, ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
            return;
        }

        next();
    };
};

export const extractToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
};
