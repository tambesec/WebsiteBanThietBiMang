import { body } from 'express-validator';

export const addCartItemValidator = [
    body('productItemId')
        .isInt()
        .withMessage('ID sản phẩm không hợp lệ'),
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('Số lượng phải ít nhất 1'),
];

export const updateCartItemValidator = [
    body('quantity')
        .isInt({ min: 1 })
        .withMessage('Số lượng phải ít nhất 1'),
];
