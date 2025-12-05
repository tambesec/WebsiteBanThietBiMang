import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed Database with Initial Data
 * Run: npx prisma db seed
 */
async function main() {
  console.log('🌱 Starting database seeding...\n');

  // ============================================
  // 1. CREATE ADMIN USER
  // ============================================
  console.log('👤 Creating admin user...');
  
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  
  const admin = await prisma.users.upsert({
    where: { email: 'admin@networkstore.com' },
    update: {},
    create: {
      full_name: 'Network Store Admin',
      email: 'admin@networkstore.com',
      phone: '0987654321',
      password_hash: adminPassword,
      role: 'admin',
      is_active: 1,
      is_email_verified: 1,
    },
  });
  
  console.log(`✅ Admin created: ${admin.email}`);

  // ============================================
  // 2. CREATE TEST CUSTOMER USER
  // ============================================
  console.log('\n👥 Creating test customer...');
  
  const customerPassword = await bcrypt.hash('Customer@123', 10);
  
  const customer = await prisma.users.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      full_name: 'Nguyễn Văn Test',
      email: 'customer@test.com',
      phone: '0912345678',
      password_hash: customerPassword,
      role: 'customer',
      is_active: 1,
      is_email_verified: 1,
    },
  });
  
  console.log(`✅ Customer created: ${customer.email}`);

  // ============================================
  // 3. CREATE CATEGORIES
  // ============================================
  console.log('\n📁 Creating categories...');
  
  const categories = await Promise.all([
    prisma.categories.upsert({
      where: { slug: 'dien-thoai' },
      update: {},
      create: {
        name: 'Điện thoại',
        slug: 'dien-thoai',
        description: 'Điện thoại thông minh các loại',
        is_active: 1,
        display_order: 1,
      },
    }),
    prisma.categories.upsert({
      where: { slug: 'laptop' },
      update: {},
      create: {
        name: 'Laptop',
        slug: 'laptop',
        description: 'Laptop cho công việc và giải trí',
        is_active: 1,
        display_order: 2,
      },
    }),
    prisma.categories.upsert({
      where: { slug: 'tablet' },
      update: {},
      create: {
        name: 'Tablet',
        slug: 'tablet',
        description: 'Máy tính bảng',
        is_active: 1,
        display_order: 3,
      },
    }),
    prisma.categories.upsert({
      where: { slug: 'phu-kien' },
      update: {},
      create: {
        name: 'Phụ kiện',
        slug: 'phu-kien',
        description: 'Phụ kiện công nghệ',
        is_active: 1,
        display_order: 4,
      },
    }),
  ]);
  
  console.log(`✅ Created ${categories.length} categories`);

  // ============================================
  // 4. CREATE SAMPLE PRODUCTS
  // ============================================
  console.log('\n📦 Creating sample products...');
  
  const products = await Promise.all([
    // iPhone 15 Pro Max
    prisma.products.upsert({
      where: { sku: 'IPHONE15-PROMAX-256-TITAN' },
      update: {},
      create: {
        category_id: categories[0].id, // Điện thoại
        name: 'iPhone 15 Pro Max 256GB',
        slug: 'iphone-15-pro-max-256gb',
        brand: 'Apple',
        model: 'A3105',
        description: 'iPhone 15 Pro Max với chip A17 Pro, camera 48MP, khung titan cao cấp',
        price: 29990000,
        compare_at_price: 34990000,
        sku: 'IPHONE15-PROMAX-256-TITAN',
        stock_quantity: 50,
        specifications: JSON.stringify({
          screen: '6.7 inch Super Retina XDR OLED',
          chip: 'A17 Pro',
          ram: '8GB',
          storage: '256GB',
          camera: '48MP + 12MP + 12MP',
          front_camera: '12MP',
          battery: '4422mAh',
          os: 'iOS 17',
          weight: '221g',
        }),
        primary_image: 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg',
        warranty_months: 12,
        is_active: 1,
        is_featured: 1,
        meta_title: 'iPhone 15 Pro Max 256GB - Giá tốt nhất',
        meta_description: 'Mua iPhone 15 Pro Max 256GB chính hãng VN/A, giá ưu đãi, trả góp 0%',
      },
    }),
    
    // Samsung Galaxy S24 Ultra
    prisma.products.upsert({
      where: { sku: 'SAMSUNG-S24U-512-TITAN' },
      update: {},
      create: {
        category_id: categories[0].id,
        name: 'Samsung Galaxy S24 Ultra 512GB',
        slug: 'samsung-galaxy-s24-ultra-512gb',
        brand: 'Samsung',
        model: 'SM-S928',
        description: 'Galaxy S24 Ultra với S Pen tích hợp, camera 200MP, Snapdragon 8 Gen 3',
        price: 28990000,
        compare_at_price: 31990000,
        sku: 'SAMSUNG-S24U-512-TITAN',
        stock_quantity: 35,
        specifications: JSON.stringify({
          screen: '6.8 inch Dynamic AMOLED 2X',
          chip: 'Snapdragon 8 Gen 3',
          ram: '12GB',
          storage: '512GB',
          camera: '200MP + 50MP + 12MP + 10MP',
          front_camera: '12MP',
          battery: '5000mAh',
          os: 'Android 14',
          weight: '232g',
        }),
        primary_image: 'https://cdn.tgdd.vn/Products/Images/42/320722/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg',
        warranty_months: 12,
        is_active: 1,
        is_featured: 1,
        meta_title: 'Samsung Galaxy S24 Ultra 512GB - Flagship 2024',
        meta_description: 'Galaxy S24 Ultra 512GB chính hãng, camera 200MP, S Pen, giá tốt',
      },
    }),

    // MacBook Pro 14
    prisma.products.upsert({
      where: { sku: 'MBP14-M3PRO-18-512' },
      update: {},
      create: {
        category_id: categories[1].id, // Laptop
        name: 'MacBook Pro 14 inch M3 Pro 18GB 512GB',
        slug: 'macbook-pro-14-m3-pro-18gb-512gb',
        brand: 'Apple',
        model: 'MRX33',
        description: 'MacBook Pro 14 inch với chip M3 Pro mạnh mẽ, màn hình Liquid Retina XDR',
        price: 52990000,
        compare_at_price: 55990000,
        sku: 'MBP14-M3PRO-18-512',
        stock_quantity: 20,
        specifications: JSON.stringify({
          screen: '14.2 inch Liquid Retina XDR',
          chip: 'Apple M3 Pro 11-core CPU',
          gpu: '14-core GPU',
          ram: '18GB Unified Memory',
          storage: '512GB SSD',
          battery: '70Wh - up to 18 hours',
          os: 'macOS Sonoma',
          weight: '1.55kg',
          ports: '3x Thunderbolt 4, HDMI, SD Card, MagSafe 3',
        }),
        primary_image: 'https://cdn.tgdd.vn/Products/Images/44/309016/apple-macbook-pro-14-m3-pro-mrx33saa-1-750x500.jpg',
        warranty_months: 12,
        is_active: 1,
        is_featured: 1,
        meta_title: 'MacBook Pro 14 M3 Pro - Laptop chuyên nghiệp',
        meta_description: 'MacBook Pro 14 M3 Pro 18GB RAM 512GB SSD chính hãng Apple VN',
      },
    }),

    // iPad Pro M2
    prisma.products.upsert({
      where: { sku: 'IPADPRO-M2-11-128-WIFI' },
      update: {},
      create: {
        category_id: categories[2].id, // Tablet
        name: 'iPad Pro M2 11 inch WiFi 128GB',
        slug: 'ipad-pro-m2-11-inch-wifi-128gb',
        brand: 'Apple',
        model: 'MNXE3ZA/A',
        description: 'iPad Pro M2 11 inch với hiệu năng mạnh mẽ, màn hình Liquid Retina',
        price: 20990000,
        compare_at_price: 22990000,
        sku: 'IPADPRO-M2-11-128-WIFI',
        stock_quantity: 30,
        specifications: JSON.stringify({
          screen: '11 inch Liquid Retina',
          chip: 'Apple M2',
          ram: '8GB',
          storage: '128GB',
          camera: '12MP Wide + 10MP Ultra Wide',
          front_camera: '12MP TrueDepth',
          battery: 'Up to 10 hours',
          os: 'iPadOS 17',
          weight: '466g',
        }),
        primary_image: 'https://cdn.tgdd.vn/Products/Images/522/289699/ipad-pro-11-2022-wifi-gray-thumb-600x600.jpg',
        warranty_months: 12,
        is_active: 1,
        is_featured: 0,
        meta_title: 'iPad Pro M2 11 inch - Máy tính bảng cao cấp',
        meta_description: 'iPad Pro M2 11 inch WiFi 128GB chính hãng Apple VN/A',
      },
    }),

    // AirPods Pro 2
    prisma.products.upsert({
      where: { sku: 'AIRPODS-PRO2-USBC' },
      update: {},
      create: {
        category_id: categories[3].id, // Phụ kiện
        name: 'AirPods Pro Gen 2 USB-C',
        slug: 'airpods-pro-gen-2-usb-c',
        brand: 'Apple',
        model: 'MTJV3',
        description: 'AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động, cổng USB-C',
        price: 5990000,
        compare_at_price: 6990000,
        sku: 'AIRPODS-PRO2-USBC',
        stock_quantity: 100,
        specifications: JSON.stringify({
          chip: 'Apple H2',
          features: 'Active Noise Cancellation, Transparency Mode, Spatial Audio',
          battery: 'Up to 6 hours listening time',
          case_battery: 'Up to 30 hours with charging case',
          charging: 'USB-C, Wireless (MagSafe, Qi)',
          water_resistance: 'IPX4',
          weight: '5.3g per earbud',
        }),
        primary_image: 'https://cdn.tgdd.vn/Products/Images/54/320068/airpods-pro-2-usb-c-thumb-600x600.jpg',
        warranty_months: 12,
        is_active: 1,
        is_featured: 1,
        meta_title: 'AirPods Pro 2 USB-C - Tai nghe không dây cao cấp',
        meta_description: 'AirPods Pro Gen 2 USB-C chính hãng Apple, chống ồn chủ động',
      },
    }),
  ]);
  
  console.log(`✅ Created ${products.length} products`);

  // ============================================
  // 5. CREATE SHOPPING CART FOR CUSTOMER
  // ============================================
  console.log('\n🛒 Creating shopping cart...');
  
  // Check if cart exists for customer
  const existingCart = await prisma.shopping_carts.findFirst({
    where: { user_id: customer.id },
  });
  
  if (!existingCart) {
    await prisma.shopping_carts.create({
      data: {
        user_id: customer.id,
      },
    });
    console.log(`✅ Cart created for customer`);
  } else {
    console.log(`✅ Cart already exists for customer`);
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('✨ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: 2 (1 admin, 1 customer)`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Shopping Carts: 1\n`);
  
  console.log('🔑 Login Credentials:');
  console.log('\n   👑 ADMIN:');
  console.log('   Email:    admin@networkstore.com');
  console.log('   Password: Admin@123456');
  console.log('\n   👤 CUSTOMER:');
  console.log('   Email:    customer@test.com');
  console.log('   Password: Customer@123');
  
  console.log('\n🚀 Test the API:');
  console.log('   1. Start server: npm run start:dev');
  console.log('   2. Open Swagger: http://localhost:3000/api');
  console.log('   3. Login with admin credentials');
  console.log('   4. Copy access_token and authorize');
  console.log('   5. Test Products endpoints!\n');
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
