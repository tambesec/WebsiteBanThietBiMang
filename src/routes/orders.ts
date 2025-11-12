import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authMiddleware, authorizeRoles } from '../middleware/auth';
import { createOrderValidator, updateOrderStatusValidator } from '../validators/order';

const router = Router();

// All order endpoints require authentication
router.use(authMiddleware);

// Public order endpoints
router.post('/', createOrderValidator, orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.get('/:id/items', orderController.getOrderItems);
router.get('/:id/status-history', orderController.getOrderStatusHistory);
router.put('/:id/cancel', orderController.cancelOrder);

// Admin only endpoints
router.put('/:id/status', authorizeRoles('admin'), updateOrderStatusValidator, orderController.updateOrderStatus);

export default router;
