import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { orderService } from '../services/orderService';
import { sendSuccess, sendPaginatedSuccess, sendError, getPaginationMeta } from '../utils/response';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../config/constants';
import { asyncHandler } from '../middleware/errorHandler';

export const orderController = {
    createOrder: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const order = await orderService.createOrder(req.user.id, req.body);
        sendSuccess(res, 'Tạo đơn hàng thành công', order, HTTP_STATUS.CREATED);
    }),

    getOrders: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const { orders, total } = await orderService.getOrders(req.user.id, req.pagination!);
        const meta = getPaginationMeta(total, req.pagination!.page, req.pagination!.limit);
        sendPaginatedSuccess(res, orders, meta, 'Lấy danh sách đơn hàng thành công');
    }),

    getOrderById: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const order = await orderService.getOrderById(parseInt(req.params.id), req.user.id);
        sendSuccess(res, 'Lấy chi tiết đơn hàng thành công', order);
    }),

    getOrderItems: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const items = await orderService.getOrderItems(parseInt(req.params.id), req.user.id);
        sendSuccess(res, 'Lấy mặt hàng đơn hàng thành công', items);
    }),

    updateOrderStatus: asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const history = await orderService.updateOrderStatus(
            parseInt(req.params.id),
            req.body.statusId,
            req.body.note
        );

        sendSuccess(res, 'Cập nhật trạng thái đơn hàng thành công', history);
    }),

    cancelOrder: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        await orderService.cancelOrder(parseInt(req.params.id), req.user.id, req.body.reason);
        sendSuccess(res, 'Hủy đơn hàng thành công');
    }),

    getOrderStatusHistory: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const history = await orderService.getOrderStatusHistory(
            parseInt(req.params.id),
            req.user.id
        );

        sendSuccess(res, 'Lấy lịch sử trạng thái đơn hàng thành công', history);
    }),
};
