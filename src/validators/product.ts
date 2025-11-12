import { body } from 'express-validator';

export const createProductValidator = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 300 })
        .withMessage('Tên sản phẩm phải từ 3 đến 300 ký tự'),
    body('slug')
        .trim()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage('Slug không hợp lệ'),
    body('categoryId')
        .isInt()
        .withMessage('ID danh mục không hợp lệ'),
    body('brand')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Thương hiệu tối đa 100 ký tự'),
    body('model')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Model tối đa 100 ký tự'),
    body('description')
        .optional()
        .trim(),
];

export const updateProductValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 300 })
        .withMessage('Tên sản phẩm phải từ 3 đến 300 ký tự'),
    body('slug')
        .optional()
        .trim()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .withMessage('Slug không hợp lệ'),
    body('brand')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Thương hiệu tối đa 100 ký tự'),
];

export const createProductItemValidator = [
    body('productId')
        .isInt()
        .withMessage('ID sản phẩm không hợp lệ'),
    body('sku')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('SKU không hợp lệ'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Giá phải là số dương'),
    body('qtyInStock')
        .isInt({ min: 0 })
        .withMessage('Số lượng phải là số nguyên dương'),
    body('weightKg')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Trọng lượng phải là số dương'),
    body('warrantyMonths')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Bảo hành phải là số nguyên'),
];
