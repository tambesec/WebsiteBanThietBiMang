'use client';

import React, { useState } from 'react';
import { reviewsApi } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import type { CreateReviewDto } from '@/lib/api-client';

interface ReviewFormProps {
  productId: number;
  orderId?: number;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, orderId, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Bạn cần đăng nhập để đánh giá sản phẩm');
      return;
    }

    if (!formData.comment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá');
      return;
    }

    if (formData.comment.length > 250) {
      alert('Nội dung đánh giá không được vượt quá 250 ký tự');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const reviewDto: CreateReviewDto = {
        product_id: productId,
        rating,
        comment: formData.comment,
      };

      if (formData.title.trim()) {
        reviewDto.title = formData.title;
      }

      if (orderId) {
        reviewDto.order_id = orderId;
      }

      await reviewsApi.reviewsControllerCreate(reviewDto);
      
      alert('Đánh giá của bạn đã được gửi thành công!');
      
      // Reset form
      setFormData({ title: '', comment: '' });
      setRating(5);
      
      // Notify parent to reload reviews
      onReviewSubmitted();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isActive = starValue <= (hoveredRating || rating);
      
      return (
        <span
          key={i}
          className={`cursor-pointer ${isActive ? 'text-[#FBB040]' : 'text-gray-5'}`}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
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
      );
    });
  };

  if (!user) {
    return (
      <div className="max-w-[550px] w-full">
        <div className="rounded-xl bg-white shadow-1 p-6 sm:p-8 text-center">
          <h3 className="font-medium text-xl text-dark mb-3">Đăng nhập để đánh giá</h3>
          <p className="text-dark-5 mb-4">Bạn cần đăng nhập để có thể đánh giá sản phẩm này</p>
          <a
            href="/signin"
            className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md hover:bg-blue-dark transition-colors"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[550px] w-full">
      <form onSubmit={handleSubmit}>
        <h2 className="font-medium text-2xl text-dark mb-3.5">
          Thêm đánh giá
        </h2>

        <p className="mb-6 text-dark-5">
          Địa chỉ email của bạn sẽ không được công khai. Các trường bắt buộc được đánh dấu *
        </p>

        <div className="flex items-center gap-3 mb-7.5">
          <span className="text-dark">Đánh giá của bạn*</span>

          <div className="flex items-center gap-1">
            {renderStars()}
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-1 p-4 sm:p-6">
          <div className="mb-5">
            <label htmlFor="title" className="block mb-2.5">
              Tiêu đề (không bắt buộc)
            </label>

            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Tóm tắt đánh giá của bạn"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="comment" className="block mb-2.5">
              Nội dung đánh giá*
            </label>

            <textarea
              name="comment"
              id="comment"
              rows={5}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Nhập đánh giá của bạn về sản phẩm..."
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
              required
            ></textarea>

            <span className="flex items-center justify-between mt-2.5">
              <span className="text-custom-sm text-dark-4">
                Tối đa 250 ký tự
              </span>
              <span className={`text-custom-sm ${formData.comment.length > 250 ? 'text-red' : 'text-dark-4'}`}>
                {formData.comment.length}/250
              </span>
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || formData.comment.length > 250}
            className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:bg-gray-4 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
