"use client";
import { useState, useEffect } from "react";
import { categoriesApi } from "@/lib/api-client";

interface TreeCategory {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  display_order: number;
  products_count?: number;
  children?: TreeCategory[];
}

interface CategoryTreeProps {
  onEdit?: (categoryId: number) => void;
}

const CategoryTreeItem = ({ 
  category, 
  level = 0,
  onEdit 
}: { 
  category: TreeCategory; 
  level?: number;
  onEdit?: (categoryId: number) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasChildren = category.children && category.children.length > 0;

  const indent = level * 24; // 24px per level

  return (
    <div>
      <div 
        className="flex items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors"
        style={{ paddingLeft: `${indent + 12}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-5 w-5 items-center justify-center text-bodydark hover:text-black dark:hover:text-white"
          >
            <svg 
              className={`fill-current transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              width="16" 
              height="16" 
              viewBox="0 0 16 16"
            >
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Folder Icon */}
        <div className={hasChildren ? 'text-primary' : 'text-bodydark'}>
          {hasChildren ? (
            <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
              <path d="M9 3H3C2.44772 3 2 3.44772 2 4V16C2 16.5523 2.44772 17 3 17H17C17.5523 17 18 16.5523 18 16V6C18 5.44772 17.5523 5 17 5H10L9 3Z" />
            </svg>
          ) : (
            <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20">
              <path d="M9 3H3C2.44772 3 2 3.44772 2 4V16C2 16.5523 2.44772 17 3 17H17C17.5523 17 18 16.5523 18 16V6C18 5.44772 17.5523 5 17 5H10L9 3Z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          )}
        </div>

        {/* Category Info */}
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-black dark:text-white">
              {category.name}
            </span>
            {category.products_count !== undefined && category.products_count > 0 && (
              <span className="text-xs text-bodydark">
                ({category.products_count} SP)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!category.is_active && (
              <span className="rounded-full bg-danger bg-opacity-10 px-2 py-0.5 text-xs font-medium text-danger">
                Đã ẩn
              </span>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(category.id)}
                className="rounded p-1 hover:bg-primary hover:bg-opacity-10 text-bodydark hover:text-primary"
                title="Chỉnh sửa"
              >
                <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M11.333 2c.376 0 .74.15 1.006.417l1.244 1.244A1.423 1.423 0 0114 4.667c0 .377-.15.74-.417 1.006l-7.916 7.917a1.667 1.667 0 01-.772.415l-2.562.512a.5.5 0 01-.583-.583l.512-2.562c.055-.276.19-.53.416-.772L10.6 2.417A1.423 1.423 0 0111.333 2zm0 1.167a.256.256 0 00-.178.073L10.678 3.5l1.822 1.822.478-.478a.256.256 0 000-.361l-1.244-1.244a.256.256 0 00-.178-.073zM9.5 4.678L3.478 10.7a.5.5 0 00-.125.231l-.384 1.921 1.921-.384a.5.5 0 00.231-.125L11.322 6.5 9.5 4.678z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryTreeItem 
              key={child.id} 
              category={child} 
              level={level + 1}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree = ({ onEdit }: CategoryTreeProps) => {
  const [treeData, setTreeData] = useState<TreeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchTree();
  }, [showInactive]);

  const fetchTree = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.categoriesControllerGetCategoryTree(showInactive);
      // API returns { categories: [...] } structure
      setTreeData(response.data?.categories || []);
    } catch (error) {
      console.error('Failed to fetch category tree:', error);
      setTreeData([]);
    } finally {
      setLoading(false);
    }
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
            Cây Danh Mục
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 rounded border-stroke"
            />
            <span className="text-sm text-bodydark">Hiển thị danh mục đã ẩn</span>
          </label>
        </div>
      </div>

      <div className="p-4">
        {treeData.length === 0 ? (
          <p className="text-center text-bodydark py-10">Không có danh mục nào</p>
        ) : (
          <div className="space-y-1">
            {treeData.map((category) => (
              <CategoryTreeItem 
                key={category.id} 
                category={category}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTree;
