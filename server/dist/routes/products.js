"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const product_1 = require("../validators/product");
const router = (0, express_1.Router)();
// Public endpoints
router.get('/', productController_1.productController.getProducts);
router.get('/categories', productController_1.productController.getCategories);
router.get('/search', productController_1.productController.searchProducts);
router.get('/:id', productController_1.productController.getProductById);
router.get('/:id/images', productController_1.productController.getProductImages);
router.get('/:id/items', productController_1.productController.getProductItems);
router.get('/slug/:slug', productController_1.productController.getProductBySlug);
// Protected endpoints (Admin only)
router.post('/', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('admin'), product_1.createProductValidator, productController_1.productController.createProduct);
router.put('/:id', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('admin'), product_1.updateProductValidator, productController_1.productController.updateProduct);
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.authorizeRoles)('admin'), productController_1.productController.deleteProduct);
exports.default = router;
//# sourceMappingURL=products.js.map