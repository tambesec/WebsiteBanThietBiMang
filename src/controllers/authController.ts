import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../config/constants';
import { asyncHandler } from '../middleware/errorHandler';

export const authController = {
    register: asyncHandler(async (req: Request, res: Response) => {
        // Check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const result = await authService.register({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
        });

        sendSuccess(res, SUCCESS_MESSAGES.REGISTER_SUCCESS, result, HTTP_STATUS.CREATED);
    }),

    login: asyncHandler(async (req: Request, res: Response) => {
        // Check validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const result = await authService.login({
            email: req.body.email,
            password: req.body.password,
        });

        sendSuccess(res, SUCCESS_MESSAGES.LOGIN_SUCCESS, result);
    }),

    logout: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        await authService.logout(req.user.id);
        sendSuccess(res, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
    }),

    refreshToken: asyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.body.refreshToken;

        if (!refreshToken) {
            sendError(res, 'Refresh token là bắt buộc', HTTP_STATUS.BAD_REQUEST);
            return;
        }

        const result = await authService.refreshAccessToken(refreshToken);
        sendSuccess(res, 'Token đã được làm mới', result);
    }),

    changePassword: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        await authService.changePassword(req.user.id, req.body.oldPassword, req.body.password);
        sendSuccess(res, SUCCESS_MESSAGES.PASSWORD_CHANGED_SUCCESS);
    }),
};
