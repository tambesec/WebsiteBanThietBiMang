import { Router, Request, Response } from 'express';

const router = Router();

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
};

const sampleCategories: Category[] = [
  { 
    id: '1', 
    name: 'Router', 
    slug: 'router', 
    description: 'Thiết bị định tuyến mạng',
    image: '/images/categories/router.png'
  },
  { 
    id: '2', 
    name: 'Switch', 
    slug: 'switch', 
    description: 'Thiết bị chuyển mạch',
    image: '/images/categories/switch.png'
  },
  { 
    id: '3', 
    name: 'Access Point', 
    slug: 'access-point', 
    description: 'Điểm phát sóng WiFi',
    image: '/images/categories/access-point.png'
  },
  { 
    id: '4', 
    name: 'Firewall', 
    slug: 'firewall', 
    description: 'Tường lửa bảo mật',
    image: '/images/categories/firewall.png'
  },
  { 
    id: '5', 
    name: 'Cable & Accessories', 
    slug: 'cable-accessories', 
    description: 'Cáp mạng và phụ kiện',
    image: '/images/categories/accessories.png'
  },
];

// GET /api/v1/categories - Get all categories
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: sampleCategories,
    message: 'Lấy danh sách danh mục thành công'
  });
});

// GET /api/v1/categories/:id - Get category by ID
router.get('/:id', (req: Request, res: Response) => {
  const category = sampleCategories.find(c => c.id === req.params.id);
  if (category) {
    res.json({
      success: true,
      data: category,
      message: 'Lấy thông tin danh mục thành công'
    });
  } else {
    res.status(404).json({ 
      success: false,
      message: 'Không tìm thấy danh mục' 
    });
  }
});

export default router;
