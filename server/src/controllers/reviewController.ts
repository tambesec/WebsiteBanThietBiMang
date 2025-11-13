import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { reviewService } from '../services/reviewService';
import { sendSuccess, sendPaginatedSuccess, sendError, getPaginationMeta } from '../utils/response';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../config/constants';
import { asyncHandler } from '../middleware/errorHandler';

export const reviewController = {
    createReview: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const review = await reviewService.createReview(req.user.id, req.body);
        sendSuccess(res, 'Tạo đánh giá thành công', review, HTTP_STATUS.CREATED);
    }),

    getProductReviews: asyncHandler(async (req: Request, res: Response) => {
        const { reviews, total } = await reviewService.getProductReviews(
            parseInt(req.params.productId),
            req.pagination!
        );

        const meta = getPaginationMeta(total, req.pagination!.page, req.pagination!.limit);
        sendPaginatedSuccess(res, reviews, meta, 'Lấy danh sách đánh giá thành công');
    }),

    getUserReviews: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const { reviews, total } = await reviewService.getUserReviews(req.user.id, req.pagination!);
        const meta = getPaginationMeta(total, req.pagination!.page, req.pagination!.limit);
        sendPaginatedSuccess(res, reviews, meta, 'Lấy danh sách đánh giá của bạn thành công');
    }),

    updateReview: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const review = await reviewService.updateReview(parseInt(req.params.id), req.user.id, req.body);
        sendSuccess(res, SUCCESS_MESSAGES.UPDATED, review);
    }),

    deleteReview: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            sendError(res, 'Người dùng không được xác thực', HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        await reviewService.deleteReview(parseInt(req.params.id), req.user.id);
        sendSuccess(res, SUCCESS_MESSAGES.DELETED);
    }),

    approveReview: asyncHandler(async (req: Request, res: Response) => {
        const review = await reviewService.approveReview(parseInt(req.params.id));
        sendSuccess(res, 'Phê duyệt đánh giá thành công', review);
    }),

    rejectReview: asyncHandler(async (req: Request, res: Response) => {
        await reviewService.rejectReview(parseInt(req.params.id));
        sendSuccess(res, 'Từ chối đánh giá thành công');
    }),

    getAllUnapprovedReviews: asyncHandler(async (req: Request, res: Response) => {
        const { reviews, total } = await reviewService.getAllUnapprovedReviews(req.pagination!);
        const meta = getPaginationMeta(total, req.pagination!.page, req.pagination!.limit);
        sendPaginatedSuccess(res, reviews, meta, 'Lấy danh sách đánh giá chờ phê duyệt thành công');
    }),
};
