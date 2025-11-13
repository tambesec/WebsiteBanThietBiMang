"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cartController_1 = require("../controllers/cartController");
const auth_1 = require("../middleware/auth");
const cart_1 = require("../validators/cart");
const router = (0, express_1.Router)();
// All cart endpoints require authentication
router.use(auth_1.authMiddleware);
router.get('/', cartController_1.cartController.getCart);
router.post('/items', cart_1.addCartItemValidator, cartController_1.cartController.addItem);
router.put('/items/:id', cart_1.updateCartItemValidator, cartController_1.cartController.updateItem);
router.delete('/items/:id', cartController_1.cartController.removeItem);
router.delete('/', cartController_1.cartController.clearCart);
exports.default = router;
//# sourceMappingURL=cart.js.map