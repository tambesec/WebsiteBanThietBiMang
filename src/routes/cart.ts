import { Router } from 'express';
import { cartController } from '../controllers/cartController';
import { authMiddleware } from '../middleware/auth';
import { addCartItemValidator, updateCartItemValidator } from '../validators/cart';

const router = Router();

// All cart endpoints require authentication
router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/items', addCartItemValidator, cartController.addItem);
router.put('/items/:id', updateCartItemValidator, cartController.updateItem);
router.delete('/items/:id', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
