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

  // Additional customer for testing
  const customer2Password = await bcrypt.hash('Customer@123', 10);
  
  const customer2 = await prisma.users.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      full_name: 'Trần Thị B',
      email: 'customer@example.com',
      phone: '0923456789',
      password_hash: customer2Password,
      role: 'customer',
      is_active: 1,
      is_email_verified: 1,
    },
  });
  
  console.log(`✅ Customer 2 created: ${customer2.email}`);

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
  // 5. CREATE ADDRESSES FOR CUSTOMERS
  // ============================================
  console.log('\n📍 Creating customer addresses...');
  
  const addresses = await Promise.all([
    // Customer 1 - Default address
    prisma.addresses.upsert({
      where: { id: 1 },
      update: {},
      create: {
        user_id: customer.id,
        recipient_name: 'Nguyễn Văn Test',
        phone: '0912345678',
        address_line: '123 Nguyễn Huệ',
        ward: 'Phường Bến Nghé',
        district: 'Quận 1',
        city: 'Hồ Chí Minh',
        postal_code: '700000',
        is_default: 1,
      },
    }),
    // Customer 1 - Work address
    prisma.addresses.upsert({
      where: { id: 2 },
      update: {},
      create: {
        user_id: customer.id,
        recipient_name: 'Nguyễn Văn Test (Văn phòng)',
        phone: '0912345678',
        address_line: '456 Lê Lợi',
        ward: 'Phường Bến Thành',
        district: 'Quận 1',
        city: 'Hồ Chí Minh',
        postal_code: '700000',
        is_default: 0,
      },
    }),
    // Customer 2 - Default address
    prisma.addresses.upsert({
      where: { id: 3 },
      update: {},
      create: {
        user_id: customer2.id,
        recipient_name: 'Trần Thị B',
        phone: '0923456789',
        address_line: '789 Trần Hưng Đạo',
        ward: 'Phường Cầu Ông Lãnh',
        district: 'Quận 1',
        city: 'Hồ Chí Minh',
        postal_code: '700000',
        is_default: 1,
      },
    }),
  ]);
  
  console.log(`✅ Created ${addresses.length} addresses`);

  // ============================================
  // 6. CREATE SHOPPING CART FOR CUSTOMERS
  // ============================================
  console.log('\n🛒 Creating shopping carts...');
  
  const cart1 = await prisma.shopping_carts.upsert({
    where: { id: 1 },
    update: {},
    create: {
      user_id: customer.id,
    },
  });

  const cart2 = await prisma.shopping_carts.upsert({
    where: { id: 2 },
    update: {},
    create: {
      user_id: customer2.id,
    },
  });
  
  console.log(`✅ Created 2 shopping carts`);

  // ============================================
  // 7. ADD ITEMS TO CART (for customer2 - ready for order)
  // ============================================
  console.log('\n🛍️ Adding items to customer2 cart...');
  
  const cartItems = await Promise.all([
    prisma.cart_items.upsert({
      where: { id: 1 },
      update: {},
      create: {
        cart_id: cart2.id,
        product_id: products[0].id, // iPhone 15 Pro Max
        quantity: 1,
      },
    }),
    prisma.cart_items.upsert({
      where: { id: 2 },
      update: {},
      create: {
        cart_id: cart2.id,
        product_id: products[4].id, // AirPods Pro 2
        quantity: 2,
      },
    }),
  ]);
  
  console.log(`✅ Added ${cartItems.length} items to cart`);

  // ============================================
  // 8. CREATE ORDER STATUSES
  // ============================================
  console.log('\n📋 Creating order statuses...');
  
  const orderStatuses = await Promise.all([
    prisma.order_statuses.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Pending',
        color: '#FFA500',
        description: 'Order received, awaiting confirmation',
        display_order: 1,
      },
    }),
    prisma.order_statuses.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Confirmed',
        color: '#00FF00',
        description: 'Order confirmed by admin',
        display_order: 2,
      },
    }),
    prisma.order_statuses.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        name: 'Processing',
        color: '#0000FF',
        description: 'Order is being prepared',
        display_order: 3,
      },
    }),
    prisma.order_statuses.upsert({
      where: { id: 4 },
      update: {},
      create: {
        id: 4,
        name: 'Shipped',
        color: '#800080',
        description: 'Order has been shipped',
        display_order: 4,
      },
    }),
    prisma.order_statuses.upsert({
      where: { id: 5 },
      update: {},
      create: {
        id: 5,
        name: 'Delivered',
        color: '#008000',
        description: 'Order delivered successfully',
        display_order: 5,
      },
    }),
    prisma.order_statuses.upsert({
      where: { id: 6 },
      update: {},
      create: {
        id: 6,
        name: 'Cancelled',
        color: '#FF0000',
        description: 'Order cancelled',
        display_order: 6,
      },
    }),
    prisma.order_statuses.upsert({
      where: { id: 7 },
      update: {},
      create: {
        id: 7,
        name: 'Returned',
        color: '#A52A2A',
        description: 'Order returned',
        display_order: 7,
      },
    }),
  ]);
  
  console.log(`✅ Created ${orderStatuses.length} order statuses`);

  // ============================================
  // 9. CREATE SAMPLE ORDERS
  // ============================================
  console.log('\n📦 Creating sample orders...');
  
  // Calculate order totals
  const order1Subtotal = Number(products[2].price); // MacBook Pro
  const order1ShippingFee = 0; // Free shipping (over 500k)
  const order1Tax = Math.round(order1Subtotal * 0.1);
  const order1Total = order1Subtotal + order1ShippingFee + order1Tax;
  
  const order2Subtotal = Number(products[1].price) + Number(products[3].price); // Samsung S24 Ultra + iPad Pro
  const order2ShippingFee = 0; // Free shipping
  const order2Tax = Math.round(order2Subtotal * 0.1);
  const order2Total = order2Subtotal + order2ShippingFee + order2Tax;

  // Order 1 - Delivered order for customer 1
  const order1 = await prisma.orders.create({
    data: {
      user_id: customer.id,
      order_number: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0001`,
      status_id: 5, // Delivered
      customer_name: customer.full_name,
      customer_email: customer.email,
      customer_phone: customer.phone || '0912345678',
      
      // Shipping address
      shipping_address_id: addresses[0].id,
      shipping_recipient: addresses[0].recipient_name,
      shipping_phone: addresses[0].phone,
      shipping_address: addresses[0].address_line,
      shipping_ward: addresses[0].ward,
      shipping_district: addresses[0].district,
      shipping_city: addresses[0].city,
      shipping_postal_code: addresses[0].postal_code,
      
      // Billing address (same as shipping)
      billing_address_id: addresses[0].id,
      billing_recipient: addresses[0].recipient_name,
      billing_phone: addresses[0].phone,
      billing_address: addresses[0].address_line,
      billing_ward: addresses[0].ward,
      billing_district: addresses[0].district,
      billing_city: addresses[0].city,
      billing_postal_code: addresses[0].postal_code,
      
      // Payment & Shipping
      payment_method: 'bank_transfer',
      payment_status: 'paid',
      paid_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      shipping_method: 'express',
      tracking_number: 'VTP20251128001',
      shipped_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      delivered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      
      // Amounts
      subtotal: order1Subtotal,
      shipping_fee: order1ShippingFee,
      tax_amount: order1Tax,
      total_amount: order1Total,
      
      customer_note: 'Please deliver after 5 PM',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  });

  // Order 1 items
  await prisma.order_items.create({
    data: {
      order_id: order1.id,
      product_id: products[2].id,
      product_name: products[2].name,
      product_sku: products[2].sku,
      product_image: products[2].primary_image,
      quantity: 1,
      unit_price: products[2].price,
      subtotal: products[2].price,
    },
  });

  // Order 1 history
  await Promise.all([
    prisma.order_history.create({
      data: {
        order_id: order1.id,
        status_id: 1,
        note: 'Order created',
        changed_by: customer.id,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order_history.create({
      data: {
        order_id: order1.id,
        status_id: 2,
        note: 'Order confirmed by admin',
        changed_by: admin.id,
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order_history.create({
      data: {
        order_id: order1.id,
        status_id: 3,
        note: 'Processing order',
        changed_by: admin.id,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order_history.create({
      data: {
        order_id: order1.id,
        status_id: 4,
        note: 'Shipped via Viettel Post',
        changed_by: admin.id,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order_history.create({
      data: {
        order_id: order1.id,
        status_id: 5,
        note: 'Delivered successfully',
        changed_by: admin.id,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // Order 2 - Processing order for customer 1
  const order2 = await prisma.orders.create({
    data: {
      user_id: customer.id,
      order_number: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0002`,
      status_id: 3, // Processing
      customer_name: customer.full_name,
      customer_email: customer.email,
      customer_phone: customer.phone || '0912345678',
      
      // Shipping address
      shipping_address_id: addresses[1].id,
      shipping_recipient: addresses[1].recipient_name,
      shipping_phone: addresses[1].phone,
      shipping_address: addresses[1].address_line,
      shipping_ward: addresses[1].ward,
      shipping_district: addresses[1].district,
      shipping_city: addresses[1].city,
      shipping_postal_code: addresses[1].postal_code,
      
      // Billing address
      billing_address_id: addresses[0].id,
      billing_recipient: addresses[0].recipient_name,
      billing_phone: addresses[0].phone,
      billing_address: addresses[0].address_line,
      billing_ward: addresses[0].ward,
      billing_district: addresses[0].district,
      billing_city: addresses[0].city,
      billing_postal_code: addresses[0].postal_code,
      
      // Payment & Shipping
      payment_method: 'cod',
      payment_status: 'unpaid',
      shipping_method: 'standard',
      
      // Amounts
      subtotal: order2Subtotal,
      shipping_fee: order2ShippingFee,
      tax_amount: order2Tax,
      total_amount: order2Total,
      
      customer_note: 'Deliver to office during business hours',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  });

  // Order 2 items
  await Promise.all([
    prisma.order_items.create({
      data: {
        order_id: order2.id,
        product_id: products[1].id,
        product_name: products[1].name,
        product_sku: products[1].sku,
        product_image: products[1].primary_image,
        quantity: 1,
        unit_price: products[1].price,
        subtotal: products[1].price,
      },
    }),
    prisma.order_items.create({
      data: {
        order_id: order2.id,
        product_id: products[3].id,
        product_name: products[3].name,
        product_sku: products[3].sku,
        product_image: products[3].primary_image,
        quantity: 1,
        unit_price: products[3].price,
        subtotal: products[3].price,
      },
    }),
  ]);

  // Order 2 history
  await Promise.all([
    prisma.order_history.create({
      data: {
        order_id: order2.id,
        status_id: 1,
        note: 'Order created',
        changed_by: customer.id,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order_history.create({
      data: {
        order_id: order2.id,
        status_id: 2,
        note: 'Order confirmed, preparing items',
        changed_by: admin.id,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.order_history.create({
      data: {
        order_id: order2.id,
        status_id: 3,
        note: 'Packing items for shipment',
        changed_by: admin.id,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  // Order 3 - Pending order for customer 2
  const order3Subtotal = Number(products[0].price); // iPhone 15 Pro Max
  const order3ShippingFee = 0;
  const order3Tax = Math.round(order3Subtotal * 0.1);
  const order3Total = order3Subtotal + order3ShippingFee + order3Tax;

  const order3 = await prisma.orders.create({
    data: {
      user_id: customer2.id,
      order_number: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0003`,
      status_id: 1, // Pending
      customer_name: customer2.full_name,
      customer_email: customer2.email,
      customer_phone: customer2.phone || '0923456789',
      
      // Shipping address
      shipping_address_id: addresses[2].id,
      shipping_recipient: addresses[2].recipient_name,
      shipping_phone: addresses[2].phone,
      shipping_address: addresses[2].address_line,
      shipping_ward: addresses[2].ward,
      shipping_district: addresses[2].district,
      shipping_city: addresses[2].city,
      shipping_postal_code: addresses[2].postal_code,
      
      // Billing address (same as shipping)
      billing_address_id: addresses[2].id,
      billing_recipient: addresses[2].recipient_name,
      billing_phone: addresses[2].phone,
      billing_address: addresses[2].address_line,
      billing_ward: addresses[2].ward,
      billing_district: addresses[2].district,
      billing_city: addresses[2].city,
      billing_postal_code: addresses[2].postal_code,
      
      // Payment & Shipping
      payment_method: 'momo',
      payment_status: 'unpaid',
      shipping_method: 'same_day',
      
      // Amounts
      subtotal: order3Subtotal,
      shipping_fee: 80000, // Same day shipping
      tax_amount: order3Tax,
      total_amount: order3Total + 80000,
      
      customer_note: 'Need urgent delivery',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
  });

  // Order 3 items
  await prisma.order_items.create({
    data: {
      order_id: order3.id,
      product_id: products[0].id,
      product_name: products[0].name,
      product_sku: products[0].sku,
      product_image: products[0].primary_image,
      quantity: 1,
      unit_price: products[0].price,
      subtotal: products[0].price,
    },
  });

  // Order 3 history
  await prisma.order_history.create({
    data: {
      order_id: order3.id,
      status_id: 1,
      note: 'Order created, awaiting confirmation',
      changed_by: customer2.id,
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  });
  
  console.log(`✅ Created 3 sample orders`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('✨ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: 3 (1 admin, 2 customers)`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Addresses: ${addresses.length}`);
  console.log(`   - Order Statuses: ${orderStatuses.length}`);
  console.log(`   - Shopping Carts: 2`);
  console.log(`   - Cart Items: ${cartItems.length} (in customer2's cart)`);
  console.log(`   - Orders: 3 (1 delivered, 1 processing, 1 pending)`);
  console.log(`   - Order Items: 5`);
  console.log(`   - Order History: 10 entries\n`);
  
  console.log('🔑 Login Credentials:');
  console.log('\n   👑 ADMIN:');
  console.log('   Email:    admin@networkstore.com');
  console.log('   Password: Admin@123456');
  console.log('\n   👤 CUSTOMER 1:');
  console.log('   Email:    customer@test.com');
  console.log('   Password: Customer@123');
  console.log('   Orders:   2 (1 delivered, 1 processing)');
  console.log('\n   👤 CUSTOMER 2:');
  console.log('   Email:    customer@example.com');
  console.log('   Password: Customer@123');
  console.log('   Orders:   1 (pending)');
  console.log('   Cart:     2 items (ready to place order)');
  
  console.log('\n📦 Sample Orders:');
  console.log(`   - Order 1: ${order1.order_number} (Delivered) - MacBook Pro`);
  console.log(`   - Order 2: ${order2.order_number} (Processing) - Samsung S24 Ultra + iPad Pro`);
  console.log(`   - Order 3: ${order3.order_number} (Pending) - iPhone 15 Pro Max`);
  
  console.log('\n🚀 Test Orders Module:');
  console.log('   1. Start server: npm run start:dev');
  console.log('   2. Run automated test: ./test-orders-flow.sh');
  console.log('   3. Or test manually with Postman/curl');
  console.log('   4. View documentation: ORDERS_API_DOCUMENTATION.md');
  console.log('   5. See testing guide: TESTING_ORDERS.md\n');
  
  console.log('🧪 Quick Test Commands:');
  console.log('   # Login as customer');
  console.log('   curl -X POST http://localhost:3000/api/v1/auth/login \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"email":"customer@example.com","password":"Customer@123"}\'');
  console.log('\n   # View orders');
  console.log('   curl -X GET http://localhost:3000/api/v1/orders \\');
  console.log('     -H "Authorization: Bearer YOUR_TOKEN"\n');
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
