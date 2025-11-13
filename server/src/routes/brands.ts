import { Router, Request, Response } from 'express';

const router = Router();

type Brand = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
};

const sampleBrands: Brand[] = [
  { id: '1', name: 'Cisco', slug: 'cisco', logo: '/images/brands/cisco.png' },
  { id: '2', name: 'TP-Link', slug: 'tp-link', logo: '/images/brands/tp-link.png' },
  { id: '3', name: 'D-Link', slug: 'd-link', logo: '/images/brands/d-link.png' },
  { id: '4', name: 'Ubiquiti', slug: 'ubiquiti', logo: '/images/brands/ubiquiti.png' },
  { id: '5', name: 'Netgear', slug: 'netgear', logo: '/images/brands/netgear.png' },
];

// GET /api/v1/brands - Get all brands
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: sampleBrands,
    message: 'Lấy danh sách thương hiệu thành công'
  });
});

// GET /api/v1/brands/:id - Get brand by ID
router.get('/:id', (req: Request, res: Response) => {
  const brand = sampleBrands.find(b => b.id === req.params.id);
  if (brand) {
    res.json({
      success: true,
      data: brand,
      message: 'Lấy thông tin thương hiệu thành công'
    });
  } else {
    res.status(404).json({ 
      success: false,
      message: 'Không tìm thấy thương hiệu' 
    });
  }
});

export default router;
