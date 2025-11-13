import { Router } from 'express';
import { productController } from '../controllers/productController';
import { authMiddleware, authorizeRoles } from '../middleware/auth';
import { createProductValidator, updateProductValidator } from '../validators/product';

const router = Router();

// Public endpoints
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/images', productController.getProductImages);
router.get('/:id/items', productController.getProductItems);
router.get('/slug/:slug', productController.getProductBySlug);

// Protected endpoints (Admin only)
router.post('/', authMiddleware, authorizeRoles('admin'), createProductValidator, productController.createProduct);
router.put('/:id', authMiddleware, authorizeRoles('admin'), updateProductValidator, productController.updateProduct);
router.delete('/:id', authMiddleware, authorizeRoles('admin'), productController.deleteProduct);

export default router;
