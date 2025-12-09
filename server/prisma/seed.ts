import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============ ROLES & PERMISSIONS ============
  console.log('📋 Creating roles and permissions...');
  
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'users.view' },
      update: {},
      create: { name: 'users.view', description: 'View users' },
    }),
    prisma.permission.upsert({
      where: { name: 'users.create' },
      update: {},
      create: { name: 'users.create', description: 'Create users' },
    }),
    prisma.permission.upsert({
      where: { name: 'users.edit' },
      update: {},
      create: { name: 'users.edit', description: 'Edit users' },
    }),
    prisma.permission.upsert({
      where: { name: 'users.delete' },
      update: {},
      create: { name: 'users.delete', description: 'Delete users' },
    }),
    prisma.permission.upsert({
      where: { name: 'products.view' },
      update: {},
      create: { name: 'products.view', description: 'View products' },
    }),
    prisma.permission.upsert({
      where: { name: 'products.create' },
      update: {},
      create: { name: 'products.create', description: 'Create products' },
    }),
    prisma.permission.upsert({
      where: { name: 'products.edit' },
      update: {},
      create: { name: 'products.edit', description: 'Edit products' },
    }),
    prisma.permission.upsert({
      where: { name: 'products.delete' },
      update: {},
      create: { name: 'products.delete', description: 'Delete products' },
    }),
    prisma.permission.upsert({
      where: { name: 'orders.view' },
      update: {},
      create: { name: 'orders.view', description: 'View orders' },
    }),
    prisma.permission.upsert({
      where: { name: 'orders.manage' },
      update: {},
      create: { name: 'orders.manage', description: 'Manage orders' },
    }),
    prisma.permission.upsert({
      where: { name: 'reports.view' },
      update: {},
      create: { name: 'reports.view', description: 'View reports' },
    }),
    prisma.permission.upsert({
      where: { name: 'settings.manage' },
      update: {},
      create: { name: 'settings.manage', description: 'Manage settings' },
    }),
  ]);

  const customerRole = await prisma.role.upsert({
    where: { name: 'customer' },
    update: {},
    create: { name: 'customer', description: 'Regular customer' },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: 'Administrator' },
  });

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: { name: 'super_admin', description: 'Super Administrator' },
  });

  // Assign all permissions to super_admin
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: permission.id },
    });
  }

  // Assign most permissions to admin (except settings)
  for (const permission of permissions.filter(p => p.name !== 'settings.manage')) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }

  console.log('✅ Roles and permissions created');

  // ============ USERS ============
  console.log('👤 Creating users...');
  
  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@123', 10);

  const superAdmin = await prisma.siteUser.upsert({
    where: { email: 'admin@networkstore.com' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'admin@networkstore.com',
      firstName: 'Super',
      lastName: 'Admin',
      fullName: 'Super Admin',
      phone: '0909123456',
      passwordHash: passwordHash,
      isActive: true,
      isEmailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: superAdmin.id, roleId: superAdminRole.id },
  });

  const adminUser = await prisma.siteUser.upsert({
    where: { email: 'manager@networkstore.com' },
    update: {},
    create: {
      username: 'manager',
      email: 'manager@networkstore.com',
      firstName: 'Quản',
      lastName: 'Lý',
      fullName: 'Quản Lý',
      phone: '0909123457',
      passwordHash: passwordHash,
      isActive: true,
      isEmailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  const customer1 = await prisma.siteUser.upsert({
    where: { email: 'customer1@gmail.com' },
    update: {},
    create: {
      username: 'nguyenvana',
      email: 'customer1@gmail.com',
      firstName: 'Văn A',
      lastName: 'Nguyễn',
      fullName: 'Nguyễn Văn A',
      phone: '0912345678',
      passwordHash: customerPasswordHash,
      isActive: true,
      isEmailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: customer1.id, roleId: customerRole.id } },
    update: {},
    create: { userId: customer1.id, roleId: customerRole.id },
  });

  const customer2 = await prisma.siteUser.upsert({
    where: { email: 'customer2@gmail.com' },
    update: {},
    create: {
      username: 'tranthib',
      email: 'customer2@gmail.com',
      firstName: 'Thị B',
      lastName: 'Trần',
      fullName: 'Trần Thị B',
      phone: '0987654321',
      passwordHash: customerPasswordHash,
      isActive: true,
      isEmailVerified: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: customer2.id, roleId: customerRole.id } },
    update: {},
    create: { userId: customer2.id, roleId: customerRole.id },
  });

  console.log('✅ Users created');

  // ============ BRANDS ============
  console.log('🏢 Creating brands...');

  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'cisco' },
      update: {},
      create: {
        name: 'Cisco',
        slug: 'cisco',
        logo: 'https://placehold.co/200x80/049cdb/ffffff?text=CISCO',
        description: 'Cisco Systems - Nhà cung cấp thiết bị mạng hàng đầu thế giới',
        website: 'https://www.cisco.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'tp-link' },
      update: {},
      create: {
        name: 'TP-Link',
        slug: 'tp-link',
        logo: 'https://placehold.co/200x80/2ecc71/ffffff?text=TP-LINK',
        description: 'TP-Link - Thiết bị mạng chất lượng cao với giá cả hợp lý',
        website: 'https://www.tp-link.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'mikrotik' },
      update: {},
      create: {
        name: 'MikroTik',
        slug: 'mikrotik',
        logo: 'https://placehold.co/200x80/e74c3c/ffffff?text=MikroTik',
        description: 'MikroTik - Giải pháp mạng chuyên nghiệp từ Latvia',
        website: 'https://mikrotik.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'ubiquiti' },
      update: {},
      create: {
        name: 'Ubiquiti',
        slug: 'ubiquiti',
        logo: 'https://placehold.co/200x80/3498db/ffffff?text=Ubiquiti',
        description: 'Ubiquiti Networks - Thiết bị mạng không dây hiệu năng cao',
        website: 'https://ui.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'netgear' },
      update: {},
      create: {
        name: 'Netgear',
        slug: 'netgear',
        logo: 'https://placehold.co/200x80/9b59b6/ffffff?text=NETGEAR',
        description: 'Netgear - Thiết bị mạng cho gia đình và doanh nghiệp',
        website: 'https://www.netgear.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'd-link' },
      update: {},
      create: {
        name: 'D-Link',
        slug: 'd-link',
        logo: 'https://placehold.co/200x80/f39c12/ffffff?text=D-LINK',
        description: 'D-Link - Giải pháp kết nối mạng toàn diện',
        website: 'https://www.dlink.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'asus' },
      update: {},
      create: {
        name: 'ASUS',
        slug: 'asus',
        logo: 'https://placehold.co/200x80/1a1a2e/00ff00?text=ASUS',
        description: 'ASUS - Router gaming và thiết bị mạng cao cấp',
        website: 'https://www.asus.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'juniper' },
      update: {},
      create: {
        name: 'Juniper',
        slug: 'juniper',
        logo: 'https://placehold.co/200x80/34495e/ffffff?text=Juniper',
        description: 'Juniper Networks - Thiết bị mạng doanh nghiệp',
        website: 'https://www.juniper.net',
      },
    }),
  ]);

  console.log('✅ Brands created');

  // ============ CATEGORIES ============
  console.log('📂 Creating categories...');

  const routerCategory = await prisma.productCategory.upsert({
    where: { slug: 'router' },
    update: {},
    create: {
      name: 'Router',
      slug: 'router',
      description: 'Bộ định tuyến mạng - Router WiFi và Router có dây',
      image: 'https://placehold.co/500x500/3498db/ffffff?text=Router',
      displayOrder: 1,
    },
  });

  const switchCategory = await prisma.productCategory.upsert({
    where: { slug: 'switch' },
    update: {},
    create: {
      name: 'Switch',
      slug: 'switch',
      description: 'Bộ chia mạng - Switch quản lý và không quản lý',
      image: 'https://placehold.co/500x500/2ecc71/ffffff?text=Switch',
      displayOrder: 2,
    },
  });

  const accessPointCategory = await prisma.productCategory.upsert({
    where: { slug: 'access-point' },
    update: {},
    create: {
      name: 'Access Point',
      slug: 'access-point',
      description: 'Điểm truy cập không dây - WiFi AP cho doanh nghiệp',
      image: 'https://placehold.co/500x500/9b59b6/ffffff?text=Access+Point',
      displayOrder: 3,
    },
  });

  const firewallCategory = await prisma.productCategory.upsert({
    where: { slug: 'firewall' },
    update: {},
    create: {
      name: 'Firewall',
      slug: 'firewall',
      description: 'Tường lửa - Thiết bị bảo mật mạng',
      image: 'https://placehold.co/500x500/e74c3c/ffffff?text=Firewall',
      displayOrder: 4,
    },
  });

  const cableCategory = await prisma.productCategory.upsert({
    where: { slug: 'cable-accessories' },
    update: {},
    create: {
      name: 'Cáp & Phụ kiện',
      slug: 'cable-accessories',
      description: 'Cáp mạng, đầu nối và phụ kiện',
      image: 'https://placehold.co/500x500/f39c12/ffffff?text=Cap+%26+Phu+kien',
      displayOrder: 5,
    },
  });

  const nasCategory = await prisma.productCategory.upsert({
    where: { slug: 'nas-storage' },
    update: {},
    create: {
      name: 'NAS & Lưu trữ',
      slug: 'nas-storage',
      description: 'Thiết bị lưu trữ mạng NAS',
      image: 'https://placehold.co/500x500/1abc9c/ffffff?text=NAS+Storage',
      displayOrder: 6,
    },
  });

  // Sub-categories
  await prisma.productCategory.upsert({
    where: { slug: 'wifi-6-router' },
    update: {},
    create: {
      name: 'Router WiFi 6',
      slug: 'wifi-6-router',
      description: 'Router hỗ trợ WiFi 6 (802.11ax)',
      parentId: routerCategory.id,
      displayOrder: 1,
    },
  });

  await prisma.productCategory.upsert({
    where: { slug: 'gaming-router' },
    update: {},
    create: {
      name: 'Router Gaming',
      slug: 'gaming-router',
      description: 'Router tối ưu cho gaming',
      parentId: routerCategory.id,
      displayOrder: 2,
    },
  });

  await prisma.productCategory.upsert({
    where: { slug: 'managed-switch' },
    update: {},
    create: {
      name: 'Switch Managed',
      slug: 'managed-switch',
      description: 'Switch quản lý thông minh',
      parentId: switchCategory.id,
      displayOrder: 1,
    },
  });

  await prisma.productCategory.upsert({
    where: { slug: 'poe-switch' },
    update: {},
    create: {
      name: 'Switch PoE',
      slug: 'poe-switch',
      description: 'Switch hỗ trợ Power over Ethernet',
      parentId: switchCategory.id,
      displayOrder: 2,
    },
  });

  console.log('✅ Categories created');

  // ============ PRODUCTS ============
  console.log('📦 Creating products...');

  const productsData = [
    {
      categoryId: routerCategory.id,
      brandId: brands.find(b => b.slug === 'tp-link')!.id,
      name: 'TP-Link Archer AX73 Router WiFi 6 AX5400',
      slug: 'tp-link-archer-ax73-wifi-6',
      model: 'Archer AX73',
      shortDescription: 'Router WiFi 6 tốc độ cao với 6 anten ngoài',
      description: `<h3>TP-Link Archer AX73 - Router WiFi 6 AX5400</h3>
<p>Router WiFi 6 mạnh mẽ với tốc độ lên đến 5400Mbps, lý tưởng cho gaming và streaming 4K.</p>
<ul>
<li>Tốc độ WiFi 6: 574 Mbps (2.4GHz) + 4804 Mbps (5GHz)</li>
<li>6 anten ngoài tăng cường phủ sóng</li>
<li>CPU quad-core 1.5GHz</li>
<li>1 cổng USB 3.0 cho chia sẻ file</li>
<li>Hỗ trợ OneMesh và TP-Link HomeShield</li>
</ul>`,
      price: 3290000,
      salePrice: 2990000,
      stock: 50,
      isFeatured: true,
      avgRating: 4.7,
      reviewCount: 128,
      viewCount: 5420,
      soldCount: 234,
      specifications: JSON.stringify({
        'Chuẩn WiFi': 'WiFi 6 (802.11ax)',
        'Tốc độ': '5400 Mbps',
        'Cổng WAN': '1 x Gigabit',
        'Cổng LAN': '4 x Gigabit',
        'USB': '1 x USB 3.0',
        'Bảo hành': '24 tháng',
      }),
      tags: JSON.stringify(['wifi6', 'router', 'tp-link', 'gaming', 'ax5400']),
    },
    {
      categoryId: routerCategory.id,
      brandId: brands.find(b => b.slug === 'asus')!.id,
      name: 'ASUS RT-AX86U Pro Router Gaming WiFi 6',
      slug: 'asus-rt-ax86u-pro-gaming',
      model: 'RT-AX86U Pro',
      shortDescription: 'Router gaming WiFi 6 với Mobile Game Mode',
      description: `<h3>ASUS RT-AX86U Pro - Router Gaming Đỉnh Cao</h3>
<p>Router gaming chuyên nghiệp với công nghệ WiFi 6, tối ưu cho gaming di động và PC.</p>
<ul>
<li>Tốc độ: 574 Mbps (2.4GHz) + 4804 Mbps (5GHz)</li>
<li>Cổng gaming 2.5G cho tốc độ tối đa</li>
<li>Mobile Game Mode giảm ping cho game mobile</li>
<li>AiProtection Pro bảo mật mạng</li>
<li>AiMesh hỗ trợ mở rộng vùng phủ</li>
</ul>`,
      price: 7990000,
      salePrice: 6990000,
      stock: 25,
      isFeatured: true,
      avgRating: 4.9,
      reviewCount: 86,
      viewCount: 3200,
      soldCount: 98,
      specifications: JSON.stringify({
        'Chuẩn WiFi': 'WiFi 6 (802.11ax)',
        'Tốc độ': '5700 Mbps',
        'Cổng WAN': '1 x 2.5G, 1 x Gigabit',
        'Cổng LAN': '4 x Gigabit',
        'USB': '1 x USB 3.2, 1 x USB 2.0',
        'Bảo hành': '36 tháng',
      }),
      tags: JSON.stringify(['wifi6', 'router', 'asus', 'gaming', 'ax5700']),
    },
    {
      categoryId: switchCategory.id,
      brandId: brands.find(b => b.slug === 'cisco')!.id,
      name: 'Cisco CBS350-24P-4G Switch PoE+ 24 cổng',
      slug: 'cisco-cbs350-24p-4g-poe',
      model: 'CBS350-24P-4G',
      shortDescription: 'Switch managed 24 cổng PoE+ cho doanh nghiệp',
      description: `<h3>Cisco CBS350-24P-4G - Switch Doanh Nghiệp</h3>
<p>Switch quản lý thông minh với 24 cổng PoE+ và 4 cổng SFP uplink.</p>
<ul>
<li>24 cổng Gigabit PoE+ (195W)</li>
<li>4 cổng SFP Gigabit</li>
<li>Switching capacity: 56 Gbps</li>
<li>Quản lý qua web, CLI, SNMP</li>
<li>Hỗ trợ VLAN, QoS, ACL</li>
</ul>`,
      price: 15900000,
      salePrice: null,
      stock: 15,
      isFeatured: true,
      avgRating: 4.8,
      reviewCount: 42,
      viewCount: 1850,
      soldCount: 67,
      specifications: JSON.stringify({
        'Số cổng': '24 x Gigabit PoE+',
        'Uplink': '4 x SFP',
        'PoE Budget': '195W',
        'Switching': '56 Gbps',
        'MAC Address': '16K',
        'Bảo hành': '36 tháng',
      }),
      tags: JSON.stringify(['switch', 'cisco', 'poe', 'managed', 'enterprise']),
    },
    {
      categoryId: switchCategory.id,
      brandId: brands.find(b => b.slug === 'tp-link')!.id,
      name: 'TP-Link TL-SG108 Switch 8 cổng Gigabit',
      slug: 'tp-link-tl-sg108-8-port',
      model: 'TL-SG108',
      shortDescription: 'Switch 8 cổng Gigabit cho văn phòng nhỏ',
      description: `<h3>TP-Link TL-SG108 - Switch Gigabit Cơ Bản</h3>
<p>Switch unmanaged 8 cổng Gigabit, plug-and-play, tiết kiệm năng lượng.</p>
<ul>
<li>8 cổng RJ45 Gigabit</li>
<li>Thiết kế vỏ thép chắc chắn</li>
<li>Green Ethernet tiết kiệm điện</li>
<li>Plug and Play không cần cấu hình</li>
<li>Fanless hoạt động êm ái</li>
</ul>`,
      price: 450000,
      salePrice: 399000,
      stock: 200,
      isFeatured: false,
      avgRating: 4.5,
      reviewCount: 356,
      viewCount: 12500,
      soldCount: 1250,
      specifications: JSON.stringify({
        'Số cổng': '8 x Gigabit',
        'Switching': '16 Gbps',
        'MAC Address': '4K',
        'Kích thước': '158×101×25mm',
        'Bảo hành': '24 tháng',
      }),
      tags: JSON.stringify(['switch', 'tp-link', 'gigabit', 'unmanaged', 'office']),
    },
    {
      categoryId: accessPointCategory.id,
      brandId: brands.find(b => b.slug === 'ubiquiti')!.id,
      name: 'Ubiquiti UniFi U6 Pro WiFi 6 Access Point',
      slug: 'ubiquiti-unifi-u6-pro',
      model: 'U6-Pro',
      shortDescription: 'Access Point WiFi 6 chuyên nghiệp cho doanh nghiệp',
      description: `<h3>Ubiquiti UniFi U6 Pro - WiFi 6 Enterprise</h3>
<p>Access Point WiFi 6 với thiết kế đẹp, hiệu năng cao cho môi trường doanh nghiệp.</p>
<ul>
<li>WiFi 6 tốc độ 5.3 Gbps</li>
<li>Hỗ trợ 300+ client đồng thời</li>
<li>PoE+ powered</li>
<li>Quản lý qua UniFi Controller</li>
<li>Thiết kế gắn trần đẹp mắt</li>
</ul>`,
      price: 4500000,
      salePrice: 4200000,
      stock: 35,
      isFeatured: true,
      avgRating: 4.8,
      reviewCount: 67,
      viewCount: 2890,
      soldCount: 145,
      specifications: JSON.stringify({
        'Chuẩn WiFi': 'WiFi 6 (802.11ax)',
        'Tốc độ': '5.3 Gbps',
        'Băng tần': 'Dual-band 2.4/5 GHz',
        'PoE': '802.3at PoE+',
        'Clients': '300+',
        'Bảo hành': '24 tháng',
      }),
      tags: JSON.stringify(['access-point', 'ubiquiti', 'wifi6', 'enterprise', 'unifi']),
    },
    {
      categoryId: firewallCategory.id,
      brandId: brands.find(b => b.slug === 'mikrotik')!.id,
      name: 'MikroTik hEX RB750Gr3 Router/Firewall',
      slug: 'mikrotik-hex-rb750gr3',
      model: 'RB750Gr3',
      shortDescription: 'Router/Firewall nhỏ gọn với RouterOS',
      description: `<h3>MikroTik hEX RB750Gr3 - Router Đa Năng</h3>
<p>Router/Firewall compact với RouterOS, lý tưởng cho văn phòng và mạng SOHO.</p>
<ul>
<li>5 cổng Gigabit Ethernet</li>
<li>CPU dual-core 880MHz</li>
<li>256MB RAM</li>
<li>RouterOS Level 4 license</li>
<li>USB port cho lưu trữ</li>
</ul>`,
      price: 1690000,
      salePrice: 1590000,
      stock: 45,
      isFeatured: false,
      avgRating: 4.6,
      reviewCount: 189,
      viewCount: 4560,
      soldCount: 320,
      specifications: JSON.stringify({
        'CPU': 'Dual-core 880MHz',
        'RAM': '256MB',
        'Cổng': '5 x Gigabit',
        'USB': '1 x USB 2.0',
        'OS': 'RouterOS L4',
        'Bảo hành': '12 tháng',
      }),
      tags: JSON.stringify(['router', 'firewall', 'mikrotik', 'routeros', 'soho']),
    },
    {
      categoryId: cableCategory.id,
      brandId: brands.find(b => b.slug === 'tp-link')!.id,
      name: 'Cáp mạng Cat6 UTP 305m - Thùng',
      slug: 'cap-mang-cat6-utp-305m',
      model: 'CAT6-305M',
      shortDescription: 'Cáp mạng Cat6 UTP chính hãng, thùng 305 mét',
      description: `<h3>Cáp Mạng Cat6 UTP 305m</h3>
<p>Cáp mạng Cat6 chất lượng cao cho hệ thống mạng LAN.</p>
<ul>
<li>Chuẩn Cat6 UTP</li>
<li>Tốc độ hỗ trợ 1Gbps</li>
<li>Chiều dài: 305 mét/thùng</li>
<li>Vỏ PVC chống cháy</li>
<li>Đạt chuẩn Fluke test</li>
</ul>`,
      price: 1290000,
      salePrice: 1190000,
      stock: 100,
      isFeatured: false,
      avgRating: 4.4,
      reviewCount: 234,
      viewCount: 8900,
      soldCount: 567,
      specifications: JSON.stringify({
        'Chuẩn': 'Cat6 UTP',
        'Tốc độ': '1 Gbps',
        'Chiều dài': '305m',
        'Lõi': '23AWG',
        'Bảo hành': '12 tháng',
      }),
      tags: JSON.stringify(['cable', 'cat6', 'utp', 'network']),
    },
    {
      categoryId: nasCategory.id,
      brandId: brands.find(b => b.slug === 'netgear')!.id,
      name: 'Synology DS220+ NAS 2-Bay',
      slug: 'synology-ds220-plus-nas',
      model: 'DS220+',
      shortDescription: 'NAS 2 khay cho gia đình và văn phòng nhỏ',
      description: `<h3>Synology DS220+ - NAS Đa Năng</h3>
<p>NAS 2 khay với CPU Intel, lý tưởng cho backup và media server.</p>
<ul>
<li>CPU Intel Celeron J4025</li>
<li>2GB RAM DDR4 (mở rộng 6GB)</li>
<li>2 khay HDD 3.5"/2.5"</li>
<li>2 cổng Gigabit LAN</li>
<li>DSM OS dễ sử dụng</li>
</ul>`,
      price: 8500000,
      salePrice: 7990000,
      stock: 20,
      isFeatured: true,
      avgRating: 4.9,
      reviewCount: 52,
      viewCount: 2100,
      soldCount: 78,
      specifications: JSON.stringify({
        'CPU': 'Intel Celeron J4025',
        'RAM': '2GB DDR4',
        'Khay': '2 x HDD/SSD',
        'LAN': '2 x Gigabit',
        'USB': '2 x USB 3.0',
        'Bảo hành': '24 tháng',
      }),
      tags: JSON.stringify(['nas', 'storage', 'synology', 'backup', 'media-server']),
    },
  ];

  for (const productData of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });

    // Create product item (SKU)
    const sku = `SKU-${product.slug.toUpperCase().slice(0, 10)}-001`;
    await prisma.productItem.upsert({
      where: { sku },
      update: {},
      create: {
        productId: product.id,
        sku,
        price: productData.price,
        salePrice: productData.salePrice,
        qtyInStock: productData.stock,
        warrantyMonths: 24,
      },
    });

    // Create product images with working placeholder URLs
    // Use placehold.co for reliable placeholder images
    const productImages: Record<string, string[]> = {
      'tp-link-archer-ax73-wifi-6': [
        'https://placehold.co/800x800/0066cc/ffffff?text=TP-Link+AX73',
        'https://placehold.co/800x800/0077dd/ffffff?text=Router+WiFi6',
        'https://placehold.co/800x800/0088ee/ffffff?text=AX5400',
      ],
      'asus-rt-ax86u-pro-gaming': [
        'https://placehold.co/800x800/1a1a2e/00ff00?text=ASUS+AX86U',
        'https://placehold.co/800x800/16213e/00ff00?text=Gaming+Router',
        'https://placehold.co/800x800/0f3460/00ff00?text=WiFi6+Pro',
      ],
      'cisco-cbs350-24p-4g-poe': [
        'https://placehold.co/800x800/049cdb/ffffff?text=Cisco+CBS350',
        'https://placehold.co/800x800/0088cc/ffffff?text=PoE+Switch',
        'https://placehold.co/800x800/0077bb/ffffff?text=24+Ports',
      ],
      'tp-link-tl-sg108-8-port': [
        'https://placehold.co/800x800/0066cc/ffffff?text=TP-Link+SG108',
        'https://placehold.co/800x800/0055bb/ffffff?text=8Port+Switch',
        'https://placehold.co/800x800/0044aa/ffffff?text=Gigabit',
      ],
      'ubiquiti-unifi-u6-pro': [
        'https://placehold.co/800x800/3498db/ffffff?text=UniFi+U6+Pro',
        'https://placehold.co/800x800/2980b9/ffffff?text=Access+Point',
        'https://placehold.co/800x800/2471a3/ffffff?text=WiFi6+AP',
      ],
      'mikrotik-hex-rb750gr3': [
        'https://placehold.co/800x800/e74c3c/ffffff?text=MikroTik+hEX',
        'https://placehold.co/800x800/c0392b/ffffff?text=RB750Gr3',
        'https://placehold.co/800x800/a93226/ffffff?text=RouterOS',
      ],
      'cap-mang-cat6-utp-305m': [
        'https://placehold.co/800x800/27ae60/ffffff?text=Cat6+Cable',
        'https://placehold.co/800x800/229954/ffffff?text=UTP+305m',
        'https://placehold.co/800x800/1e8449/ffffff?text=Network+Cable',
      ],
      'synology-ds220-plus-nas': [
        'https://placehold.co/800x800/34495e/ffffff?text=Synology+DS220',
        'https://placehold.co/800x800/2c3e50/ffffff?text=NAS+2Bay',
        'https://placehold.co/800x800/283747/ffffff?text=Storage',
      ],
    };

    const defaultImages = [
      'https://placehold.co/800x800/6c757d/ffffff?text=Product+1',
      'https://placehold.co/800x800/5a6268/ffffff?text=Product+2',
      'https://placehold.co/800x800/495057/ffffff?text=Product+3',
    ];

    const imageUrls = productImages[product.slug] || defaultImages;

    for (let i = 0; i < imageUrls.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          imageUrl: imageUrls[i],
          displayOrder: i,
          isPrimary: i === 0,
        },
      });
    }
  }

  console.log('✅ Products created');

  // ============ PAYMENT METHODS ============
  console.log('💳 Creating payment methods...');

  const paymentMethods = await Promise.all([
    prisma.paymentMethod.upsert({
      where: { code: 'cod' },
      update: {},
      create: { name: 'Thanh toán khi nhận hàng (COD)', code: 'cod' },
    }),
    prisma.paymentMethod.upsert({
      where: { code: 'bank_transfer' },
      update: {},
      create: { name: 'Chuyển khoản ngân hàng', code: 'bank_transfer' },
    }),
    prisma.paymentMethod.upsert({
      where: { code: 'vnpay' },
      update: {},
      create: { name: 'VNPay', code: 'vnpay' },
    }),
    prisma.paymentMethod.upsert({
      where: { code: 'momo' },
      update: {},
      create: { name: 'Ví MoMo', code: 'momo' },
    }),
    prisma.paymentMethod.upsert({
      where: { code: 'zalopay' },
      update: {},
      create: { name: 'ZaloPay', code: 'zalopay' },
    }),
  ]);

  console.log('✅ Payment methods created');

  // ============ SHIPPING METHODS ============
  console.log('🚚 Creating shipping methods...');

  await Promise.all([
    prisma.shippingMethod.upsert({
      where: { code: 'standard' },
      update: {},
      create: {
        name: 'Giao hàng tiêu chuẩn',
        code: 'standard',
        basePrice: 30000,
        pricePerKg: 5000,
        estimatedDays: 5,
      },
    }),
    prisma.shippingMethod.upsert({
      where: { code: 'express' },
      update: {},
      create: {
        name: 'Giao hàng nhanh',
        code: 'express',
        basePrice: 50000,
        pricePerKg: 8000,
        estimatedDays: 2,
      },
    }),
    prisma.shippingMethod.upsert({
      where: { code: 'same_day' },
      update: {},
      create: {
        name: 'Giao trong ngày (Nội thành)',
        code: 'same_day',
        basePrice: 80000,
        pricePerKg: 10000,
        estimatedDays: 1,
      },
    }),
  ]);

  console.log('✅ Shipping methods created');

  // ============ ORDER STATUSES ============
  console.log('📊 Creating order statuses...');

  await Promise.all([
    prisma.orderStatus.upsert({
      where: { name: 'pending' },
      update: {},
      create: { name: 'pending', displayOrder: 1 },
    }),
    prisma.orderStatus.upsert({
      where: { name: 'confirmed' },
      update: {},
      create: { name: 'confirmed', displayOrder: 2 },
    }),
    prisma.orderStatus.upsert({
      where: { name: 'processing' },
      update: {},
      create: { name: 'processing', displayOrder: 3 },
    }),
    prisma.orderStatus.upsert({
      where: { name: 'shipping' },
      update: {},
      create: { name: 'shipping', displayOrder: 4 },
    }),
    prisma.orderStatus.upsert({
      where: { name: 'delivered' },
      update: {},
      create: { name: 'delivered', displayOrder: 5 },
    }),
    prisma.orderStatus.upsert({
      where: { name: 'cancelled' },
      update: {},
      create: { name: 'cancelled', displayOrder: 6 },
    }),
    prisma.orderStatus.upsert({
      where: { name: 'refunded' },
      update: {},
      create: { name: 'refunded', displayOrder: 7 },
    }),
  ]);

  console.log('✅ Order statuses created');

  // ============ DISCOUNTS ============
  console.log('🏷️ Creating discounts...');

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  await Promise.all([
    prisma.discount.upsert({
      where: { code: 'WELCOME10' },
      update: {},
      create: {
        code: 'WELCOME10',
        description: 'Giảm 10% cho khách hàng mới',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 500000,
        maxUses: 1000,
        startsAt: now,
        endsAt: nextYear,
      },
    }),
    prisma.discount.upsert({
      where: { code: 'SALE50K' },
      update: {},
      create: {
        code: 'SALE50K',
        description: 'Giảm 50,000đ cho đơn từ 1 triệu',
        discountType: 'fixed_amount',
        discountValue: 50000,
        minOrderAmount: 1000000,
        maxUses: 500,
        startsAt: now,
        endsAt: nextMonth,
      },
    }),
    prisma.discount.upsert({
      where: { code: 'FREESHIP' },
      update: {},
      create: {
        code: 'FREESHIP',
        description: 'Miễn phí vận chuyển cho đơn từ 2 triệu',
        discountType: 'fixed_amount',
        discountValue: 30000,
        minOrderAmount: 2000000,
        maxUses: 200,
        startsAt: now,
        endsAt: nextMonth,
      },
    }),
    prisma.discount.upsert({
      where: { code: 'VIP20' },
      update: {},
      create: {
        code: 'VIP20',
        description: 'Giảm 20% cho khách VIP (tối đa 500K)',
        discountType: 'percentage',
        discountValue: 20,
        minOrderAmount: 1000000,
        maxUses: 100,
        startsAt: now,
        endsAt: nextYear,
      },
    }),
  ]);

  console.log('✅ Discounts created');

  // ============ SAMPLE ADDRESSES ============
  console.log('📍 Creating sample addresses...');

  const address1 = await prisma.address.create({
    data: {
      recipientName: 'Nguyễn Văn A',
      phone: '0912345678',
      streetAddress: '123 Nguyễn Huệ, Phường Bến Nghé',
      ward: 'Phường Bến Nghé',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
    },
  });

  await prisma.userAddress.create({
    data: {
      userId: customer1.id,
      addressId: address1.id,
      addressType: 'shipping',
      isDefault: true,
    },
  });

  const address2 = await prisma.address.create({
    data: {
      recipientName: 'Trần Thị B',
      phone: '0987654321',
      streetAddress: '456 Lê Lợi, Phường Bến Thành',
      ward: 'Phường Bến Thành',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
    },
  });

  await prisma.userAddress.create({
    data: {
      userId: customer2.id,
      addressId: address2.id,
      addressType: 'shipping',
      isDefault: true,
    },
  });

  console.log('✅ Sample addresses created');

  // ============ USER PAYMENTS ============
  console.log('💰 Creating user payment methods...');

  const codMethod = paymentMethods.find(p => p.code === 'cod')!;
  
  await prisma.userPayment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: customer1.id,
      paymentMethodId: codMethod.id,
      isDefault: true,
    },
  });

  await prisma.userPayment.upsert({
    where: { id: 2 },
    update: {},
    create: {
      userId: customer2.id,
      paymentMethodId: codMethod.id,
      isDefault: true,
    },
  });

  console.log('✅ User payment methods created');

  // ============ SAMPLE REVIEWS ============
  console.log('⭐ Creating sample reviews...');

  const products = await prisma.product.findMany({ take: 5 });
  
  const reviewComments = [
    'Sản phẩm rất tốt, đóng gói cẩn thận. Giao hàng nhanh!',
    'Chất lượng tuyệt vời, đúng như mô tả. Sẽ mua lại.',
    'Hàng chính hãng, setup dễ dàng. Recommend!',
    'Giá cả hợp lý, chất lượng ổn định. Shop nhiệt tình.',
    'Sản phẩm ok, nhưng giao hàng hơi chậm.',
  ];

  for (const product of products) {
    await prisma.productReview.create({
      data: {
        userId: customer1.id,
        productId: product.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
        comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });

    await prisma.productReview.create({
      data: {
        userId: customer2.id,
        productId: product.id,
        rating: Math.floor(Math.random() * 2) + 4,
        comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });
  }

  console.log('✅ Sample reviews created');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('='.repeat(50));
  console.log('📝 Test Accounts:');
  console.log('='.repeat(50));
  console.log('🔐 Super Admin:');
  console.log('   Email: admin@networkstore.com');
  console.log('   Password: Admin@123456');
  console.log('');
  console.log('🔐 Admin:');
  console.log('   Email: manager@networkstore.com');
  console.log('   Password: Admin@123456');
  console.log('');
  console.log('👤 Customer 1:');
  console.log('   Email: customer1@gmail.com');
  console.log('   Password: Customer@123');
  console.log('');
  console.log('👤 Customer 2:');
  console.log('   Email: customer2@gmail.com');
  console.log('   Password: Customer@123');
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
