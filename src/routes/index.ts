import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import orderRoutes from './orders';
import cartRoutes from './cart';
import userRoutes from './users';
import reviewRoutes from './reviews';

const router = Router();

// Routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

export default router;
