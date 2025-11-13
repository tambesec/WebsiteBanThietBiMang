import { body } from 'express-validator';

export const updateProfileValidator = [
    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại không hợp lệ'),
];

export const createAddressValidator = [
    body('streetAddress')
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('Địa chỉ phải từ 5 đến 500 ký tự'),
    body('city')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Thành phố không hợp lệ'),
    body('region')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Tỉnh/Thành không hợp lệ'),
    body('postalCode')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Mã bưu điện không hợp lệ'),
    body('country')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Quốc gia không hợp lệ'),
    body('addressType')
        .trim()
        .isIn(['shipping', 'billing'])
        .withMessage('Loại địa chỉ không hợp lệ'),
];
