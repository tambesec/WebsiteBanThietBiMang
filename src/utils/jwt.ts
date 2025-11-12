import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { JwtPayload } from '../types/api';

export const generateAccessToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRE,
    } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRE,
    } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_SECRET) as unknown as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as unknown as JwtPayload;
};

export const decodeToken = (token: string): JwtPayload | null => {
    try {
        return jwt.decode(token) as unknown as JwtPayload;
    } catch {
        return null;
    }
};
