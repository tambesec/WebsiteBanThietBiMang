"use client";
import { useState, useEffect } from "react";
import { categoriesApi } from "@/lib/api-client";

interface Category {
  id: number;
  name: string;
  display_order: number;
  parent_id?: number;
  is_active: boolean;
}

const CategoryReorder = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.categoriesControllerFindAll(
        undefined,
        undefined,
        undefined,
        false,
        'display_order',
        'asc',
        1,
        100 // Lấy tất cả
      );
      setCategories(response.data.data?.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Allow drop
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) return;

    const newCategories = [...categories];
    const draggedCategory = newCategories[draggedItem];
    
    // Remove from old position
    newCategories.splice(draggedItem, 1);
    // Insert at new position
    newCategories.splice(dropIndex, 0, draggedCategory);
    
    setCategories(newCategories);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      
      // Prepare data with new display_order
      const reorderedCategories = categories.map((cat, index) => ({
        id: cat.id,
        display_order: index + 1,
      }));

      // API expects { categories: [...] } structure
      await categoriesApi.categoriesControllerReorder({ categories: reorderedCategories });
      alert('Đã lưu thứ tự mới!');
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to save order:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchCategories();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-4 py-4 dark:border-strokedark">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-black dark:text-white">
            Sắp Xếp Thứ Tự Danh Mục
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="rounded border border-stroke px-4 py-2 text-sm font-medium hover:shadow-1 dark:border-strokedark"
            >
              Đặt Lại
            </button>
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu Thứ Tự'}
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-bodydark">
          Kéo và thả để sắp xếp lại thứ tự hiển thị của danh mục
        </p>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          {categories.map((category, index) => (
            <div
              key={category.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between rounded-lg border border-stroke bg-white px-4 py-3 cursor-move transition-all hover:shadow-md dark:border-strokedark dark:bg-boxdark ${
                draggedItem === index ? 'opacity-50' : ''
              } ${!category.is_active ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="text-bodydark">
                  <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M8 5C8 5.55228 7.55228 6 7 6C6.44772 6 6 5.55228 6 5C6 4.44772 6.44772 4 7 4C7.55228 4 8 4.44772 8 5Z" fill=""/>
                    <path d="M14 5C14 5.55228 13.5523 6 13 6C12.4477 6 12 5.55228 12 5C12 4.44772 12.4477 4 13 4C13.5523 4 14 4.44772 14 5Z" fill=""/>
                    <path d="M7 12C7.55228 12 8 11.5523 8 11C8 10.4477 7.55228 10 7 10C6.44772 10 6 10.4477 6 11C6 11.5523 6.44772 12 7 12Z" fill=""/>
                    <path d="M14 11C14 11.5523 13.5523 12 13 12C12.4477 12 12 11.5523 12 11C12 10.4477 12.4477 10 13 10C13.5523 10 14 10.4477 14 11Z" fill=""/>
                    <path d="M7 18C7.55228 18 8 17.5523 8 17C8 16.4477 7.55228 16 7 16C6.44772 16 6 16.4477 6 17C6 17.5523 6.44772 18 7 18Z" fill=""/>
                    <path d="M14 17C14 17.5523 13.5523 18 13 18C12.4477 18 12 17.5523 12 17C12 16.4477 12.4477 16 13 16C13.5523 16 14 16.4477 14 17Z" fill=""/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-black dark:text-white">
                    {category.name}
                  </p>
                  {category.parent_id && (
                    <p className="text-xs text-bodydark">
                      Danh mục con
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-bodydark">
                  Thứ tự: {index + 1}
                </span>
                {!category.is_active && (
                  <span className="rounded-full bg-danger bg-opacity-10 px-2.5 py-0.5 text-xs font-medium text-danger">
                    Đã ẩn
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryReorder;
