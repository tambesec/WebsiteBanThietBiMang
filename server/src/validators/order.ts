import { body } from 'express-validator';

export const createOrderValidator = [
    body('shippingAddressId')
        .isInt()
        .withMessage('ID địa chỉ giao hàng không hợp lệ'),
    body('billingAddressId')
        .optional()
        .isInt()
        .withMessage('ID địa chỉ thanh toán không hợp lệ'),
    body('paymentMethodId')
        .isInt()
        .withMessage('ID phương thức thanh toán không hợp lệ'),
    body('shippingMethodId')
        .isInt()
        .withMessage('ID phương thức vận chuyển không hợp lệ'),
    body('discountCode')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Mã giảm giá không hợp lệ'),
    body('customerNote')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Ghi chú tối đa 1000 ký tự'),
];

export const updateOrderStatusValidator = [
    body('statusId')
        .isInt()
        .withMessage('ID trạng thái không hợp lệ'),
    body('note')
        .optional()
        .trim(),
];
