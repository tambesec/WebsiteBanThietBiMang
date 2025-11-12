import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { productService } from '../services/productService';
import { sendSuccess, sendPaginatedSuccess, sendError, getPaginationMeta } from '../utils/response';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../config/constants';
import { asyncHandler } from '../middleware/errorHandler';

export const productController = {
    getProducts: asyncHandler(async (req: Request, res: Response) => {
        const filters = {
            categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
            brand: req.query.brand as string | undefined,
            search: req.query.search as string | undefined,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        };

        const { products, total } = await productService.getProducts(filters, req.pagination!);

        const meta = getPaginationMeta(total, req.pagination!.page, req.pagination!.limit);
        sendPaginatedSuccess(res, products, meta, SUCCESS_MESSAGES.CREATED);
    }),

    getProductById: asyncHandler(async (req: Request, res: Response) => {
        const product = await productService.getProductById(parseInt(req.params.id));
        sendSuccess(res, 'Lấy chi tiết sản phẩm thành công', product);
    }),

    getProductBySlug: asyncHandler(async (req: Request, res: Response) => {
        const product = await productService.getProductBySlug(req.params.slug);
        sendSuccess(res, 'Lấy chi tiết sản phẩm thành công', product);
    }),

    createProduct: asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const product = await productService.createProduct({
            categoryId: req.body.categoryId,
            name: req.body.name,
            slug: req.body.slug,
            brand: req.body.brand,
            model: req.body.model,
            description: req.body.description,
        });

        sendSuccess(res, SUCCESS_MESSAGES.CREATED, product, HTTP_STATUS.CREATED);
    }),

    updateProduct: asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            sendError(res, 'Dữ liệu không hợp lệ', HTTP_STATUS.BAD_REQUEST, errors.array()[0].msg);
            return;
        }

        const product = await productService.updateProduct(parseInt(req.params.id), req.body);
        sendSuccess(res, SUCCESS_MESSAGES.UPDATED, product);
    }),

    deleteProduct: asyncHandler(async (req: Request, res: Response) => {
        await productService.deleteProduct(parseInt(req.params.id));
        sendSuccess(res, SUCCESS_MESSAGES.DELETED);
    }),

    getCategories: asyncHandler(async (req: Request, res: Response) => {
        const categories = await productService.getCategories();
        sendSuccess(res, 'Lấy danh mục thành công', categories);
    }),

    getProductImages: asyncHandler(async (req: Request, res: Response) => {
        const images = await productService.getProductImages(parseInt(req.params.id));
        sendSuccess(res, 'Lấy hình ảnh sản phẩm thành công', images);
    }),

    getProductItems: asyncHandler(async (req: Request, res: Response) => {
        const items = await productService.getProductItems(parseInt(req.params.id));
        sendSuccess(res, 'Lấy biến thể sản phẩm thành công', items);
    }),

    searchProducts: asyncHandler(async (req: Request, res: Response) => {
        const query = req.query.q as string;
        if (!query) {
            sendError(res, 'Tham số tìm kiếm là bắt buộc', HTTP_STATUS.BAD_REQUEST);
            return;
        }

        const filters = {
            categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        };

        const { products, total } = await productService.searchProducts(query, filters, req.pagination!);

        const meta = getPaginationMeta(total, req.pagination!.page, req.pagination!.limit);
        sendPaginatedSuccess(res, products, meta, 'Tìm kiếm sản phẩm thành công');
    }),
};
