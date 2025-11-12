import { body } from 'express-validator';

export const createReviewValidator = [
    body('productId')
        .isInt()
        .withMessage('ID sản phẩm không hợp lệ'),
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Đánh giá phải từ 1 đến 5 sao'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Bình luận tối đa 2000 ký tự'),
];
