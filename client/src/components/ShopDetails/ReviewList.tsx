'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { reviewsApi } from '@/lib/api-client';

interface Review {
  id: number;
  product_id: number;
  user_id: number;
  order_id?: number;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
  user?: {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

interface ReviewListProps {
  productId: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0 });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      // Pass status='all' to get all reviews including pending ones
      const response = await reviewsApi.reviewsControllerFindAll(
        productId, 
        undefined, // user_id
        undefined, // rating
        'all', // status - get all reviews (approved + pending)
        undefined, // verified
        undefined, // search
        undefined, // sort_by
        undefined, // sort_order
        1, // page
        100 // limit
      );
      // Backend wraps: { data: { reviews: [...], pagination: {...} } }
      const result = response.data?.data || response.data;
      const reviewsData = result?.reviews || result || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      
      // Calculate stats
      if (reviewsData.length > 0) {
        const total = reviewsData.reduce((sum: number, r: Review) => sum + r.rating, 0);
        setStats({
          avgRating: total / reviewsData.length,
          totalReviews: reviewsData.length
        });
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: number) => {
    try {
      await reviewsApi.reviewsControllerMarkHelpful(reviewId);
      await loadReviews(); // Reload to get updated count
    } catch (error: any) {
      alert(error.message || 'Có lỗi khi đánh dấu hữu ích');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`cursor-pointer ${i < rating ? 'text-[#FBB040]' : 'text-gray-5'}`}>
        <svg
          className="fill-current"
          width="15"
          height="16"
          viewBox="0 0 15 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.6604 5.90785L9.97461 5.18335L7.85178 0.732874C7.69645 0.422375 7.28224 0.422375 7.12691 0.732874L5.00407 5.20923L0.344191 5.90785C0.0076444 5.9596 -0.121797 6.39947 0.137085 6.63235L3.52844 10.1255L2.72591 15.0158C2.67413 15.3522 3.01068 15.6368 3.32134 15.4298L7.54112 13.1269L11.735 15.4298C12.0198 15.5851 12.3822 15.3263 12.3046 15.0158L11.502 10.1255L14.8934 6.63235C15.1005 6.39947 14.9969 5.9596 14.6604 5.90785Z"
            fill=""
          />
        </svg>
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[570px] w-full">
      <div className="flex items-center justify-between mb-9">
        <h2 className="font-medium text-2xl text-dark">
          {stats.totalReviews} Đánh giá cho sản phẩm này
        </h2>
        {stats.totalReviews > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-dark">{stats.avgRating.toFixed(1)}</span>
            <div className="flex items-center gap-1">
              {renderStars(Math.round(stats.avgRating))}
            </div>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl bg-white shadow-1 p-8 text-center">
          <svg className="w-16 h-16 text-gray-4 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <p className="text-dark-5 text-lg">Chưa có đánh giá nào cho sản phẩm này</p>
          <p className="text-dark-6 text-sm mt-2">Hãy là người đầu tiên đánh giá!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12.5 h-12.5 rounded-full overflow-hidden bg-gray-2">
                    <Image
                      src="/images/users/user-01.jpg"
                      alt="user"
                      width={50}
                      height={50}
                    />
                  </div>

                  <div>
                    <h3 className="font-medium text-dark">
                      {review.user?.username || review.user?.firstName || 'Người dùng'}
                    </h3>
                    <p className="text-custom-sm text-dark-5">{formatDate(review.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>

              {review.title && (
                <h4 className="font-medium text-dark mt-4">{review.title}</h4>
              )}

              <p className="text-dark mt-3">{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden">
                      <Image src={img} alt={`Review image ${idx + 1}`} width={80} height={80} className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-3">
                {!review.is_approved && (
                  <span className="inline-flex items-center gap-1 text-sm bg-yellow-50 text-yellow-600 px-2 py-1 rounded">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Đang chờ duyệt
                  </span>
                )}
                {review.is_verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-sm text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Đã mua hàng
                  </span>
                )}
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className="inline-flex items-center gap-2 text-sm text-dark-5 hover:text-blue transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Hữu ích ({review.helpful_count})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
