import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { cartService } from '../services/cartService';
import { sendSuccess, sendError } from '../utils/response';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../config/constants';
import { asyncHandler } from '../middleware/errorHandler';

export const cartController = {
    getCart: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const cart = await cartService.getCart(req.user.id);
        sendSuccess(res, 'Lấy giỏ hàng thành công', cart);
    }),

    addItem: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const item = await cartService.addToCart(req.user.id, {
            productItemId: req.body.productItemId,
            quantity: req.body.quantity,
        });

        sendSuccess(res, 'Thêm vào giỏ hàng thành công', item, HTTP_STATUS.CREATED);
    }),

    updateItem: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const item = await cartService.updateCartItem(
            req.user.id,
            parseInt(req.params.id),
            req.body.quantity
        );

        sendSuccess(res, SUCCESS_MESSAGES.UPDATED, item);
    }),

    removeItem: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        await cartService.removeFromCart(req.user.id, parseInt(req.params.id));
        sendSuccess(res, SUCCESS_MESSAGES.DELETED);
    }),

    clearCart: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        await cartService.clearCart(req.user.id);
        sendSuccess(res, 'Xóa toàn bộ giỏ hàng thành công');
    }),
};
