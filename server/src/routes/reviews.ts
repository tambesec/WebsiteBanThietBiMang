import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { authMiddleware, authorizeRoles } from '../middleware/auth';
import { createReviewValidator } from '../validators/review';

const router = Router();

// Public endpoints
router.get('/products/:productId', reviewController.getProductReviews);

// Protected endpoints
router.use(authMiddleware);

router.get('/', reviewController.getUserReviews);
router.post('/', createReviewValidator, reviewController.createReview);
router.put('/:id', createReviewValidator, reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

// Admin only endpoints
router.get('/admin/unapproved', authorizeRoles('admin'), reviewController.getAllUnapprovedReviews);
router.put('/:id/approve', authorizeRoles('admin'), reviewController.approveReview);
router.put('/:id/reject', authorizeRoles('admin'), reviewController.rejectReview);

export default router;
