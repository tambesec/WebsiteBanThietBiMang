import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create roles
  console.log('📝 Creating roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator role with full permissions',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user role',
    },
  });

  // 2. Create admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.siteUser.upsert({
    where: { email: 'admin@nettechpro.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@nettechpro.com',
      passwordHash: adminPassword,
      phone: '0123456789',
      isActive: true,
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });

  // 3. Create test user
  console.log('👤 Creating test user...');
  const userPassword = await bcrypt.hash('user123', 10);
  const testUser = await prisma.siteUser.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'user@example.com',
      passwordHash: userPassword,
      phone: '0987654321',
      isActive: true,
      roles: {
        create: {
          roleId: userRole.id,
        },
      },
    },
  });

  // 4. Create categories
  console.log('📁 Creating categories...');
  const routerCategory = await prisma.productCategory.upsert({
    where: { slug: 'router' },
    update: {},
    create: {
      name: 'Router',
      slug: 'router',
    },
  });

  const switchCategory = await prisma.productCategory.upsert({
    where: { slug: 'switch' },
    update: {},
    create: {
      name: 'Switch',
      slug: 'switch',
    },
  });

  const accessPointCategory = await prisma.productCategory.upsert({
    where: { slug: 'access-point' },
    update: {},
    create: {
      name: 'Access Point',
      slug: 'access-point',
    },
  });

  const firewallCategory = await prisma.productCategory.upsert({
    where: { slug: 'firewall' },
    update: {},
    create: {
      name: 'Firewall',
      slug: 'firewall',
    },
  });

  // 5. Create products
  console.log('🛒 Creating products...');

  // TP-Link Archer AX3000
  const product1 = await prisma.product.upsert({
    where: { slug: 'tp-link-archer-ax3000' },
    update: {},
    create: {
      name: 'TP-Link Archer AX3000 WiFi 6 Router',
      slug: 'tp-link-archer-ax3000',
      brand: 'TP-Link',
      model: 'AX3000',
      description:
        'Dual-band WiFi 6 router with speeds up to 3 Gbps. Perfect for home and small office use.',
      categoryId: routerCategory.id,
      isActive: true,
    },
  });

  await prisma.productItem.upsert({
    where: { sku: 'AX3000-BLK-001' },
    update: {},
    create: {
      productId: product1.id,
      sku: 'AX3000-BLK-001',
      price: 2990000,
      qtyInStock: 50,
      weightKg: 0.5,
      warrantyMonths: 24,
      isActive: true,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: product1.id,
      imageUrl: '/images/products/tp-link-ax3000.jpg',
      displayOrder: 1,
      isPrimary: true,
    },
  });

  // Cisco Catalyst 2960
  const product2 = await prisma.product.upsert({
    where: { slug: 'cisco-catalyst-2960' },
    update: {},
    create: {
      name: 'Cisco Catalyst 2960 24-Port Switch',
      slug: 'cisco-catalyst-2960',
      brand: 'Cisco',
      model: 'Catalyst 2960',
      description:
        'Enterprise-grade 24-port managed switch with Layer 2 features and PoE support.',
      categoryId: switchCategory.id,
      isActive: true,
    },
  });

  await prisma.productItem.upsert({
    where: { sku: 'C2960-24P-001' },
    update: {},
    create: {
      productId: product2.id,
      sku: 'C2960-24P-001',
      price: 15900000,
      qtyInStock: 20,
      weightKg: 3.2,
      warrantyMonths: 36,
      isActive: true,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: product2.id,
      imageUrl: '/images/products/cisco-catalyst-2960.jpg',
      displayOrder: 1,
      isPrimary: true,
    },
  });

  // Ubiquiti UniFi AP AC Pro
  const product3 = await prisma.product.upsert({
    where: { slug: 'ubiquiti-unifi-ap-ac-pro' },
    update: {},
    create: {
      name: 'Ubiquiti UniFi AP AC Pro',
      slug: 'ubiquiti-unifi-ap-ac-pro',
      brand: 'Ubiquiti',
      model: 'UAP-AC-PRO',
      description:
        'Professional dual-band 802.11ac access point with speeds up to 1300 Mbps.',
      categoryId: accessPointCategory.id,
      isActive: true,
    },
  });

  await prisma.productItem.upsert({
    where: { sku: 'UAP-AC-PRO-001' },
    update: {},
    create: {
      productId: product3.id,
      sku: 'UAP-AC-PRO-001',
      price: 4590000,
      qtyInStock: 35,
      weightKg: 0.35,
      warrantyMonths: 12,
      isActive: true,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: product3.id,
      imageUrl: '/images/products/ubiquiti-unifi-ap.jpg',
      displayOrder: 1,
      isPrimary: true,
    },
  });

  // Fortinet FortiGate 60F
  const product4 = await prisma.product.upsert({
    where: { slug: 'fortinet-fortigate-60f' },
    update: {},
    create: {
      name: 'Fortinet FortiGate 60F Firewall',
      slug: 'fortinet-fortigate-60f',
      brand: 'Fortinet',
      model: 'FortiGate 60F',
      description:
        'Next-generation firewall with advanced threat protection for small to medium businesses.',
      categoryId: firewallCategory.id,
      isActive: true,
    },
  });

  await prisma.productItem.upsert({
    where: { sku: 'FG-60F-001' },
    update: {},
    create: {
      productId: product4.id,
      sku: 'FG-60F-001',
      price: 24900000,
      qtyInStock: 10,
      weightKg: 1.8,
      warrantyMonths: 12,
      isActive: true,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: product4.id,
      imageUrl: '/images/products/fortinet-fortigate-60f.jpg',
      displayOrder: 1,
      isPrimary: true,
    },
  });

  // D-Link DGS-1210-28
  const product5 = await prisma.product.upsert({
    where: { slug: 'd-link-dgs-1210-28' },
    update: {},
    create: {
      name: 'D-Link DGS-1210-28 Smart Managed Switch',
      slug: 'd-link-dgs-1210-28',
      brand: 'D-Link',
      model: 'DGS-1210-28',
      description: '28-port Gigabit Smart Managed Switch with 4 SFP ports.',
      categoryId: switchCategory.id,
      isActive: true,
    },
  });

  await prisma.productItem.upsert({
    where: { sku: 'DGS-1210-28-001' },
    update: {},
    create: {
      productId: product5.id,
      sku: 'DGS-1210-28-001',
      price: 8900000,
      qtyInStock: 15,
      weightKg: 2.1,
      warrantyMonths: 24,
      isActive: true,
    },
  });

  await prisma.productImage.create({
    data: {
      productId: product5.id,
      imageUrl: '/images/products/d-link-dgs-1210.jpg',
      displayOrder: 1,
      isPrimary: true,
    },
  });

  // 6. Create order statuses
  console.log('📦 Creating order statuses...');
  await prisma.orderStatus.createMany({
    data: [
      { name: 'Pending', displayOrder: 1 },
      { name: 'Processing', displayOrder: 2 },
      { name: 'Shipped', displayOrder: 3 },
      { name: 'Delivered', displayOrder: 4 },
      { name: 'Cancelled', displayOrder: 5 },
    ],
    skipDuplicates: true,
  });

  // 7. Create payment methods
  console.log('💳 Creating payment methods...');
  await prisma.paymentMethod.createMany({
    data: [
      { name: 'Cash on Delivery', code: 'COD', isActive: true },
      { name: 'Bank Transfer', code: 'BANK_TRANSFER', isActive: true },
      { name: 'Credit Card', code: 'CREDIT_CARD', isActive: true },
      { name: 'Momo', code: 'MOMO', isActive: true },
      { name: 'ZaloPay', code: 'ZALOPAY', isActive: true },
    ],
    skipDuplicates: true,
  });

  // 8. Create shipping methods
  console.log('🚚 Creating shipping methods...');
  await prisma.shippingMethod.createMany({
    data: [
      {
        name: 'Standard Shipping',
        code: 'STANDARD',
        basePrice: 30000,
        pricePerKg: 5000,
        estimatedDays: 3,
        isActive: true,
      },
      {
        name: 'Express Shipping',
        code: 'EXPRESS',
        basePrice: 60000,
        pricePerKg: 10000,
        estimatedDays: 1,
        isActive: true,
      },
      {
        name: 'Same Day Delivery',
        code: 'SAME_DAY',
        basePrice: 100000,
        pricePerKg: 15000,
        estimatedDays: 0,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // 9. Create sample discount
  console.log('🎫 Creating sample discount...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.discount.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: 'Welcome discount - 10% off your first order',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 1000000,
      maxUses: 100,
      usedCount: 0,
      startsAt: tomorrow,
      endsAt: nextMonth,
      isActive: true,
    },
  });

  console.log('✅ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- Admin user: admin@nettechpro.com / admin123');
  console.log('- Test user: user@example.com / user123');
  console.log('- Products: 5 items across 4 categories');
  console.log('- Order statuses: 5 statuses');
  console.log('- Payment methods: 5 methods');
  console.log('- Shipping methods: 3 methods');
  console.log('- Discount code: WELCOME10');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
