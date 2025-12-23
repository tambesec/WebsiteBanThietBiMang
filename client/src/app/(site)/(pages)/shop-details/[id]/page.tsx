'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ShopDetails from '@/components/ShopDetails';
import { productsApi } from '@/lib/api-client';

const ShopDetailsPage = () => {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productId = Array.isArray(params.id) ? params.id[0] : params.id;
        
        if (!productId) {
          setError('Product ID is missing');
          return;
        }

        const response: any = await productsApi.productsControllerFindOne(Number(productId));
        const productData = response.data?.data || response.data;
        
        console.log('Product API Response:', productData);
        
        if (productData) {
          // Transform backend data to component format
          const transformedProduct = {
            id: productData.id,
            title: productData.name || '',
            price: productData.price || 0,
            oldPrice: productData.compare_at_price || productData.price * 1.2,
            discountedPrice: productData.compare_at_price || productData.price * 1.2,
            stock: productData.stock_quantity || 0,
            category: productData.category?.name || 'Sản phẩm',
            description: productData.description || '',
            brand: productData.brand || '',
            model: productData.model || '',
            specifications: productData.specifications 
              ? (typeof productData.specifications === 'string' 
                  ? JSON.parse(productData.specifications) 
                  : productData.specifications)
              : {},
            imgs: {
              previews: productData.images?.length > 0 
                ? productData.images.map((img: any) => img.image_url) 
                : productData.primary_image 
                  ? [productData.primary_image]
                  : ['/images/products/product-01.png'],
              thumbnails: productData.images?.length > 0 
                ? productData.images.map((img: any) => img.image_url) 
                : productData.primary_image 
                  ? [productData.primary_image]
                  : ['/images/products/product-01.png'],
            },
            rating: 0,
            reviews: [],
          };
          
          setProduct(transformedProduct);
          
          // Store in Redux for ShopDetails component
          localStorage.setItem('productDetails', JSON.stringify(transformedProduct));
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-dark mb-2">Lỗi</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <ShopDetails />
    </main>
  );
};

export default ShopDetailsPage;
