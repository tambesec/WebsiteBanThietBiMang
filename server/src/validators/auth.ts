import { body } from 'express-validator';

export const registerValidator = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Username phải từ 3 đến 100 ký tự'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Mật khẩu phải ít nhất 8 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu phải chứa chữ hoa, chữ thường và số'),
    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại không hợp lệ'),
];

export const loginValidator = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu là bắt buộc'),
];

export const resetPasswordValidator = [
    body('password')
        .isLength({ min: 8 })
        .withMessage('Mật khẩu phải ít nhất 8 ký tự')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu phải chứa chữ hoa, chữ thường và số'),
    body('confirmPassword')
        .custom((value, { req }) => value === (req.body as Record<string, unknown>).password)
        .withMessage('Mật khẩu không khớp'),
];
