import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { userService } from '../services/userService';
import { sendSuccess, sendError } from '../utils/response';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../config/constants';
import { asyncHandler } from '../middleware/errorHandler';

export const userController = {
    getProfile: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const profile = await userService.getUserProfile(req.user.id);
        sendSuccess(res, 'Lấy thông tin hồ sơ thành công', profile);
    }),

    updateProfile: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const updated = await userService.updateUserProfile(req.user.id, req.body);
        sendSuccess(res, SUCCESS_MESSAGES.UPDATED, updated);
    }),

    getAddresses: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const addresses = await userService.getUserAddresses(req.user.id);
        sendSuccess(res, 'Lấy danh sách địa chỉ thành công', addresses);
    }),

    createAddress: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const address = await userService.createUserAddress(req.user.id, req.body);
        sendSuccess(res, SUCCESS_MESSAGES.CREATED, address, HTTP_STATUS.CREATED);
    }),

    updateAddress: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const address = await userService.updateUserAddress(
            req.user.id,
            parseInt(req.params.id),
            req.body
        );
        sendSuccess(res, SUCCESS_MESSAGES.UPDATED, address);
    }),

    deleteAddress: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        await userService.deleteUserAddress(req.user.id, parseInt(req.params.id));
        sendSuccess(res, SUCCESS_MESSAGES.DELETED);
    }),

    setDefaultAddress: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const address = await userService.setDefaultAddress(req.user.id, parseInt(req.params.id));
        sendSuccess(res, 'Đặt địa chỉ mặc định thành công', address);
    }),

    getPaymentMethods: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const payments = await userService.getUserPaymentMethods(req.user.id);
        sendSuccess(res, 'Lấy phương thức thanh toán thành công', payments);
    }),
};
