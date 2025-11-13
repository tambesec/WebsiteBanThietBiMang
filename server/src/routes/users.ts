import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import { updateProfileValidator, createAddressValidator } from '../validators/user';

const router = Router();

// All user endpoints require authentication
router.use(authMiddleware);

// Profile endpoints
router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileValidator, userController.updateProfile);

// Address endpoints
router.get('/addresses', userController.getAddresses);
router.post('/addresses', createAddressValidator, userController.createAddress);
router.put('/addresses/:id', createAddressValidator, userController.updateAddress);
router.delete('/addresses/:id', userController.deleteAddress);
router.put('/addresses/:id/set-default', userController.setDefaultAddress);

// Payment method endpoints
router.get('/payment-methods', userController.getPaymentMethods);

export default router;
