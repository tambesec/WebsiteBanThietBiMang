"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const order_1 = require("../validators/order");
const router = (0, express_1.Router)();
// All order endpoints require authentication
router.use(auth_1.authMiddleware);
// Public order endpoints
router.post('/', order_1.createOrderValidator, orderController_1.orderController.createOrder);
router.get('/', orderController_1.orderController.getOrders);
router.get('/:id', orderController_1.orderController.getOrderById);
router.get('/:id/items', orderController_1.orderController.getOrderItems);
router.get('/:id/status-history', orderController_1.orderController.getOrderStatusHistory);
router.put('/:id/cancel', orderController_1.orderController.cancelOrder);
// Admin only endpoints
router.put('/:id/status', (0, auth_1.authorizeRoles)('admin'), order_1.updateOrderStatusValidator, orderController_1.orderController.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=orders.js.map