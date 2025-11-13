import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import orderRoutes from './orders';
import cartRoutes from './cart';
import userRoutes from './users';
import reviewRoutes from './reviews';
import brandRoutes from './brands';
import categoryRoutes from './categories';

const router = Router();

// Routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/brands', brandRoutes);
router.use('/categories', categoryRoutes);

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server đang hoạt động' });
});

export default router;
