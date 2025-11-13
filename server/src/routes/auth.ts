import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { registerValidator, loginValidator, resetPasswordValidator } from '../validators/auth';

const router = Router();

// Public endpoints
router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected endpoints
router.post('/logout', authMiddleware, authController.logout);
router.post('/change-password', authMiddleware, resetPasswordValidator, authController.changePassword);

export default router;
