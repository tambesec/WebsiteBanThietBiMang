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
      where: { slug: 'router' },
      update: {},
      create: {
        name: 'Router',
        slug: 'router',
        description: 'Router WiFi, Router băng tần kép, Router Mesh cho gia đình và doanh nghiệp',
        is_active: 1,
        display_order: 1,
      },
    }),
    prisma.categories.upsert({
      where: { slug: 'switch' },
      update: {},
      create: {
        name: 'Switch',
        slug: 'switch',
        description: 'Switch quản lý, Switch không quản lý, Switch PoE, Switch công nghiệp',
        is_active: 1,
        display_order: 2,
      },
    }),
    prisma.categories.upsert({
      where: { slug: 'access-point' },
      update: {},
      create: {
        name: 'Access Point',
        slug: 'access-point',
        description: 'Access Point WiFi 6, WiFi 5, Indoor, Outdoor cho doanh nghiệp',
        is_active: 1,
        display_order: 3,
      },
    }),
    prisma.categories.upsert({
      where: { slug: 'firewall' },
      update: {},
      create: {
        name: 'Firewall',
        slug: 'firewall',
        description: 'Firewall phần cứng, UTM, Next-Gen Firewall bảo mật mạng',
        is_active: 1,
        display_order: 4,
      },
    }),
    prisma.categories.upsert({
      where: { slug: 'modem' },
      update: {},
      create: {
        name: 'Modem',
        slug: 'modem',
        description: 'Modem ADSL, Modem 4G/5G, Modem cáp quang GPON',
        is_active: 1,
        display_order: 5,
      },
    }),
    prisma.categories.upsert({
      where: { slug: 'cable-adapter' },
      update: {},
      create: {
        name: 'Cáp & Adapter',
        slug: 'cable-adapter',
        description: 'Cáp mạng Cat5e, Cat6, Cat6a, Adapter USB, SFP Module',
        is_active: 1,
        display_order: 6,
      },
    }),
    prisma.categories.upsert({
      where: { slug: 'network-tool' },
      update: {},
      create: {
        name: 'Công cụ mạng',
        slug: 'network-tool',
        description: 'Máy test mạng, Crimping tool, Cable tester, Network analyzer',
        is_active: 1,
        display_order: 7,
      },
    }),
    prisma.categories.upsert({
      where: { slug: 'poe-injector' },
      update: {},
      create: {
        name: 'PoE & Power',
        slug: 'poe-injector',
        description: 'PoE Injector, PoE Splitter, UPS cho thiết bị mạng',
        is_active: 1,
        display_order: 8,
      },
    }),
  ]);
  
  console.log(`✅ Created ${categories.length} categories`);

  // ============================================
  // 4. CREATE PRODUCTS
  // ============================================
  console.log('\n📦 Creating products...');
  
  const imageUrl = 'https://res.cloudinary.com/diysxuomq/image/upload/v1764316897/1697728623_IMG_2102767_kbaubp.jpg';
  
  const products = await Promise.all([
    // ========== ROUTERS ==========
    prisma.products.upsert({
      where: { sku: 'TP-AX3000' },
      update: {},
      create: {
        category_id: categories[0].id, // Router
        name: 'TP-Link Archer AX3000 WiFi 6 Router',
        slug: 'tp-link-archer-ax3000-wifi-6',
        brand: 'TP-Link',
        model: 'Archer AX3000',
        description: 'Router WiFi 6 dual-band tốc độ 3.0 Gbps, hỗ trợ OFDMA, MU-MIMO, bảo mật WPA3',
        price: 1890000,
        compare_at_price: 2290000,
        sku: 'TP-AX3000',
        stock_quantity: 45,
        specifications: JSON.stringify({
          wifi_standard: 'WiFi 6 (802.11ax)',
          speed: '3.0 Gbps (574 Mbps @ 2.4GHz + 2402 Mbps @ 5GHz)',
          antennas: '4 external high-gain antennas',
          ports: '1x Gigabit WAN + 4x Gigabit LAN',
          cpu: 'Dual-core 1.5GHz processor',
          memory: '256MB RAM, 128MB Flash',
          features: 'OFDMA, MU-MIMO, Beamforming, Smart Connect',
          security: 'WPA3, VPN Server, Firewall',
          coverage: 'Up to 3500 sq ft (325 m²)',
        }),
        primary_image: imageUrl,
        warranty_months: 24,
        is_active: 1,
        is_featured: 1,
        meta_title: 'TP-Link Archer AX3000 - Router WiFi 6 Dual-Band',
        meta_description: 'Router WiFi 6 TP-Link AX3000 tốc độ 3.0Gbps, công nghệ OFDMA, MU-MIMO, bảo mật WPA3',
      },
    }),

    prisma.products.upsert({
      where: { sku: 'ASUS-RT-AX86U' },
      update: {},
      create: {
        category_id: categories[0].id, // Router
        name: 'ASUS RT-AX86U Gaming Router WiFi 6',
        slug: 'asus-rt-ax86u-gaming-router',
        brand: 'ASUS',
        model: 'RT-AX86U',
        description: 'Router gaming WiFi 6 chuyên nghiệp, AiMesh, Gaming Port 2.5G, Mobile Game Mode',
        price: 5490000,
        compare_at_price: 6290000,
        sku: 'ASUS-RT-AX86U',
        stock_quantity: 28,
        specifications: JSON.stringify({
          wifi_standard: 'WiFi 6 (802.11ax)',
          speed: '5700 Mbps (861 Mbps @ 2.4GHz + 4804 Mbps @ 5GHz)',
          antennas: '3 external + 1 internal',
          ports: '1x 2.5G WAN + 1x Gigabit WAN/LAN + 4x Gigabit LAN + 2x USB 3.2',
          cpu: 'Quad-core 1.8GHz',
          memory: '1GB RAM, 256MB Flash',
          features: 'AiMesh, Mobile Game Mode, VPN Fusion, Adaptive QoS',
          security: 'AiProtection Pro, WPA3',
          coverage: 'Up to 5000 sq ft (464 m²)',
        }),
        primary_image: imageUrl,
        warranty_months: 36,
        is_active: 1,
        is_featured: 1,
        meta_title: 'ASUS RT-AX86U - Gaming Router WiFi 6 Chuyên Nghiệp',
        meta_description: 'Router gaming ASUS RT-AX86U WiFi 6, AiMesh, Gaming Port 2.5G, Mobile Game Mode',
      },
    }),

    prisma.products.upsert({
      where: { sku: 'UBIQUITI-UDM-PRO' },
      update: {},
      create: {
        category_id: categories[0].id, // Router
        name: 'Ubiquiti UniFi Dream Machine Pro',
        slug: 'ubiquiti-unifi-dream-machine-pro',
        brand: 'Ubiquiti',
        model: 'UDM-Pro',
        description: 'Router doanh nghiệp all-in-one, Gateway, Switch, Controller, NVR, IDS/IPS',
        price: 12990000,
        compare_at_price: 14990000,
        sku: 'UBIQUITI-UDM-PRO',
        stock_quantity: 15,
        specifications: JSON.stringify({
          type: 'Enterprise Gateway + Switch + Controller',
          throughput: '3.5 Gbps with IDS/IPS',
          ports: '1x 10G SFP+, 1x Gigabit WAN, 8x Gigabit LAN PoE+',
          poe_budget: '54W total PoE+ budget',
          cpu: 'Quad-core ARM Cortex-A57',
          memory: '4GB DDR4 RAM',
          storage: '1TB HDD (expandable)',
          features: 'UniFi Controller, IDS/IPS, DPI, VPN, VLAN',
          max_devices: '500+ concurrent clients',
          rack_mountable: '1U 19-inch rack',
        }),
        primary_image: imageUrl,
        warranty_months: 12,
        is_active: 1,
        is_featured: 1,
        meta_title: 'Ubiquiti UniFi Dream Machine Pro - Enterprise Gateway',
        meta_description: 'UniFi Dream Machine Pro all-in-one, IDS/IPS, PoE+, 10G SFP+, NVR cho doanh nghiệp',
      },
    }),

    // ========== SWITCHES ==========
    prisma.products.upsert({
      where: { sku: 'TP-TL-SG108E' },
      update: {},
      create: {
        category_id: categories[1].id, // Switch
        name: 'TP-Link TL-SG108E 8-Port Gigabit Easy Smart Switch',
        slug: 'tp-link-tl-sg108e-8-port',
        brand: 'TP-Link',
        model: 'TL-SG108E',
        description: 'Switch quản lý 8 cổng Gigabit, VLAN, QoS, IGMP Snooping, web-based management',
        price: 690000,
        compare_at_price: 890000,
        sku: 'TP-TL-SG108E',
        stock_quantity: 120,
        specifications: JSON.stringify({
          ports: '8x 10/100/1000 Mbps RJ45',
          switching_capacity: '16 Gbps',
          forwarding_rate: '11.9 Mpps',
          mac_address_table: '4K',
          vlan: '802.1Q VLAN, MTU VLAN',
          qos: '802.1p CoS, DSCP',
          features: 'IGMP Snooping, Port Mirroring, Cable Diagnostics',
          management: 'Web-based GUI',
          power: '100-240V AC, 50/60Hz',
          fanless: 'Yes (silent operation)',
        }),
        primary_image: imageUrl,
        warranty_months: 36,
        is_active: 1,
        is_featured: 0,
        meta_title: 'TP-Link TL-SG108E - Switch 8 Port Gigabit Quản Lý',
        meta_description: 'Switch TP-Link SG108E 8 cổng Gigabit có quản lý, VLAN, QoS, web management',
      },
    }),

    prisma.products.upsert({
      where: { sku: 'CISCO-SG350-28P' },
      update: {},
      create: {
        category_id: categories[1].id, // Switch
        name: 'Cisco SG350-28P 28-Port Gigabit PoE Managed Switch',
        slug: 'cisco-sg350-28p-poe-switch',
        brand: 'Cisco',
        model: 'SG350-28P',
        description: 'Switch quản lý 28 cổng Gigabit PoE+, Layer 3, 195W budget, lifetime warranty',
        price: 15990000,
        compare_at_price: 18990000,
        sku: 'CISCO-SG350-28P',
        stock_quantity: 22,
        specifications: JSON.stringify({
          ports: '24x Gigabit PoE+ + 2x Gigabit Combo + 2x SFP',
          poe_ports: '24 ports PoE+ (802.3at)',
          poe_budget: '195W total',
          switching_capacity: '56 Gbps',
          layer: 'Layer 3 (Static routing, RIP)',
          vlan: '4K VLANs',
          qos: 'Advanced QoS, 8 queues',
          features: 'ACL, DHCP Server, IPv6, Spanning Tree, Link Aggregation',
          management: 'CLI, Web GUI, SNMP',
          warranty: 'Lifetime Limited',
        }),
        primary_image: imageUrl,
        warranty_months: 120,
        is_active: 1,
        is_featured: 1,
        meta_title: 'Cisco SG350-28P - Switch PoE 28 Port Layer 3',
        meta_description: 'Switch Cisco SG350-28P PoE+ 195W, Layer 3, 28 cổng Gigabit, lifetime warranty',
      },
    }),

    prisma.products.upsert({
      where: { sku: 'UBNT-USW-24-POE' },
      update: {},
      create: {
        category_id: categories[1].id, // Switch
        name: 'Ubiquiti UniFi Switch 24 Port PoE (Gen2)',
        slug: 'ubiquiti-unifi-switch-24-poe-gen2',
        brand: 'Ubiquiti',
        model: 'USW-24-PoE',
        description: 'Switch UniFi 24 cổng Gigabit PoE+, 400W budget, 2x SFP+, UniFi Controller',
        price: 11990000,
        compare_at_price: 13990000,
        sku: 'UBNT-USW-24-POE',
        stock_quantity: 18,
        specifications: JSON.stringify({
          ports: '24x Gigabit RJ45 PoE+ + 2x 10G SFP+',
          poe_ports: '24 ports PoE+ (802.3at)',
          poe_budget: '400W total',
          switching_capacity: '68 Gbps',
          forwarding_rate: '50.6 Mpps',
          vlan: '4K VLANs',
          features: 'UniFi Controller Integration, Storm Control, Port Isolation',
          management: 'UniFi Network Controller',
          power: '100-240V AC',
          rack_mountable: '1U 19-inch rack',
        }),
        primary_image: imageUrl,
        warranty_months: 12,
        is_active: 1,
        is_featured: 1,
        meta_title: 'Ubiquiti UniFi Switch 24 PoE - Switch PoE 400W',
        meta_description: 'UniFi Switch 24 PoE Gen2, 400W budget, 2x SFP+ 10G, UniFi Controller',
      },
    }),

    // ========== ACCESS POINTS ==========
    prisma.products.upsert({
      where: { sku: 'UBNT-U6-LITE' },
      update: {},
      create: {
        category_id: categories[2].id, // Access Point
        name: 'Ubiquiti UniFi 6 Lite Access Point WiFi 6',
        slug: 'ubiquiti-unifi-6-lite-ap',
        brand: 'Ubiquiti',
        model: 'U6-Lite',
        description: 'Access Point WiFi 6 dual-band, 1.5 Gbps throughput, UniFi Controller, PoE',
        price: 2790000,
        compare_at_price: 3290000,
        sku: 'UBNT-U6-LITE',
        stock_quantity: 65,
        specifications: JSON.stringify({
          wifi_standard: 'WiFi 6 (802.11ax)',
          speed: '1500 Mbps (300 Mbps @ 2.4GHz + 1200 Mbps @ 5GHz)',
          concurrent_clients: '300+',
          max_range: '122m (400 ft)',
          power: 'PoE+ (802.3at) or 802.3af',
          mounting: 'Ceiling/Wall mount',
          antennas: '2x2 MU-MIMO',
          features: 'OFDMA, BSS Coloring, WPA3',
          management: 'UniFi Network Controller',
          dimensions: '160 x 160 x 32.65 mm',
        }),
        primary_image: imageUrl,
        warranty_months: 12,
        is_active: 1,
        is_featured: 1,
        meta_title: 'Ubiquiti UniFi 6 Lite - Access Point WiFi 6',
        meta_description: 'UniFi 6 Lite WiFi 6 AP, 1.5Gbps, 300+ clients, PoE, UniFi Controller',
      },
    }),

    prisma.products.upsert({
      where: { sku: 'TP-EAP660HD' },
      update: {},
      create: {
        category_id: categories[2].id, // Access Point
        name: 'TP-Link EAP660 HD WiFi 6 AX3600 Access Point',
        slug: 'tp-link-eap660-hd-wifi6',
        brand: 'TP-Link',
        model: 'EAP660 HD',
        description: 'Access Point WiFi 6 AX3600, 2.5G Ethernet, Omada Controller, 1024-QAM',
        price: 4290000,
        compare_at_price: 4990000,
        sku: 'TP-EAP660HD',
        stock_quantity: 42,
        specifications: JSON.stringify({
          wifi_standard: 'WiFi 6 (802.11ax)',
          speed: '3600 Mbps (574 Mbps @ 2.4GHz + 2882 Mbps @ 5GHz)',
          ethernet: '1x 2.5 Gigabit RJ45 + 1x Gigabit RJ45',
          concurrent_clients: '512+',
          power: 'PoE+ (802.3at)',
          antennas: '4x4 MU-MIMO',
          features: 'OFDMA, 1024-QAM, Airtime Fairness, Band Steering',
          management: 'Omada Controller',
          mounting: 'Ceiling mount',
          coverage: '200m² (2150 sq ft)',
        }),
        primary_image: imageUrl,
        warranty_months: 36,
        is_active: 1,
        is_featured: 1,
        meta_title: 'TP-Link EAP660 HD - WiFi 6 AX3600 Access Point',
        meta_description: 'TP-Link EAP660 HD WiFi 6, 3600Mbps, 2.5G port, Omada Controller',
      },
    }),

    // ========== FIREWALL ==========
    prisma.products.upsert({
      where: { sku: 'FORTINET-FG-60F' },
      update: {},
      create: {
        category_id: categories[3].id, // Firewall
        name: 'Fortinet FortiGate 60F Next-Gen Firewall',
        slug: 'fortinet-fortigate-60f-ngfw',
        brand: 'Fortinet',
        model: 'FortiGate 60F',
        description: 'Next-Generation Firewall, SD-WAN, IPS, SSL Inspection, 10 Gbps throughput',
        price: 28990000,
        compare_at_price: 32990000,
        sku: 'FORTINET-FG-60F',
        stock_quantity: 8,
        specifications: JSON.stringify({
          firewall_throughput: '10 Gbps',
          ngfw_throughput: '1.8 Gbps',
          ips_throughput: '1.5 Gbps',
          ssl_inspection: '850 Mbps',
          ports: '10x GE RJ45 + 2x GE SFP',
          vpn: 'IPsec VPN, SSL VPN',
          features: 'SD-WAN, IPS, Application Control, Web Filtering, Anti-Malware',
          users: 'Recommended for 50-200 users',
          management: 'FortiOS, FortiManager, FortiAnalyzer',
          warranty: '1 year hardware + UTM bundle',
        }),
        primary_image: imageUrl,
        warranty_months: 12,
        is_active: 1,
        is_featured: 1,
        meta_title: 'Fortinet FortiGate 60F - Next-Gen Firewall SMB',
        meta_description: 'FortiGate 60F NGFW, SD-WAN, IPS, 10Gbps throughput, 50-200 users',
      },
    }),

    prisma.products.upsert({
      where: { sku: 'PFSENSE-SG-1100' },
      update: {},
      create: {
        category_id: categories[3].id, // Firewall
        name: 'Netgate pfSense SG-1100 Security Gateway',
        slug: 'netgate-pfsense-sg-1100',
        brand: 'Netgate',
        model: 'SG-1100',
        description: 'pfSense Security Gateway, Firewall, VPN, QoS, cho gia đình và SOHO',
        price: 4990000,
        compare_at_price: 5990000,
        sku: 'PFSENSE-SG-1100',
        stock_quantity: 16,
        specifications: JSON.stringify({
          throughput: '460 Mbps',
          vpn_throughput: '160 Mbps (AES-128-CBC)',
          ports: '3x Gigabit Ethernet',
          cpu: 'Dual-core ARM Cortex-A53',
          memory: '1GB DDR3 RAM',
          storage: '8GB eMMC',
          features: 'Firewall, VPN, QoS, Traffic Shaping, Captive Portal',
          os: 'pfSense Plus',
          users: 'Recommended for 10-25 users',
          power: '12V 1A DC',
        }),
        primary_image: imageUrl,
        warranty_months: 12,
        is_active: 1,
        is_featured: 0,
        meta_title: 'Netgate pfSense SG-1100 - Security Gateway SOHO',
        meta_description: 'pfSense SG-1100 firewall, VPN, QoS, cho gia đình và văn phòng nhỏ',
      },
    }),

    // ========== MODEM ==========
    prisma.products.upsert({
      where: { sku: 'VIETTEL-GPON-G97RG6M' },
      update: {},
      create: {
        category_id: categories[4].id, // Modem
        name: 'Viettel G97RG6M Modem GPON WiFi 6 Dual Band',
        slug: 'viettel-g97rg6m-gpon-wifi6',
        brand: 'Viettel',
        model: 'G97RG6M',
        description: 'Modem quang GPON WiFi 6 AX3000, 4 cổng LAN Gigabit, 2 cổng điện thoại',
        price: 1490000,
        compare_at_price: 1990000,
        sku: 'VIETTEL-G97RG6M',
        stock_quantity: 85,
        specifications: JSON.stringify({
          type: 'GPON ONU',
          wifi: 'WiFi 6 Dual Band AX3000',
          speed: '3000 Mbps (574 Mbps @ 2.4GHz + 2402 Mbps @ 5GHz)',
          ports: '4x Gigabit LAN + 2x FXS + 1x USB 2.0',
          wan: '1x GPON SC/APC',
          antennas: '4 internal antennas',
          features: 'IPTV, VoIP, TR-069, WPS',
          power: '12V 1.5A',
          dimensions: '220 x 148 x 38 mm',
        }),
        primary_image: imageUrl,
        warranty_months: 12,
        is_active: 1,
        is_featured: 0,
        meta_title: 'Viettel G97RG6M - Modem GPON WiFi 6 Dual Band',
        meta_description: 'Modem quang Viettel G97RG6M WiFi 6 AX3000, 4 LAN Gigabit, IPTV',
      },
    }),

    prisma.products.upsert({
      where: { sku: 'DLINK-DWR-2101-5G' },
      update: {},
      create: {
        category_id: categories[4].id, // Modem
        name: 'D-Link DWR-2101 5G NR Mobile Router',
        slug: 'dlink-dwr-2101-5g-router',
        brand: 'D-Link',
        model: 'DWR-2101',
        description: 'Router 5G NR, WiFi 6 AX1800, 4G/5G Dual SIM, tốc độ download 3.4 Gbps',
        price: 8990000,
        compare_at_price: 10990000,
        sku: 'DLINK-DWR-2101-5G',
        stock_quantity: 12,
        specifications: JSON.stringify({
          cellular: '5G NR + 4G LTE Dual SIM',
          download_speed: 'Up to 3.4 Gbps (5G)',
          upload_speed: 'Up to 450 Mbps',
          wifi: 'WiFi 6 AX1800 Dual Band',
          ports: '2x Gigabit LAN + 1x Gigabit WAN/LAN',
          sim: '2x Nano SIM (failover)',
          features: 'VPN, Firewall, DDNS, Port Forwarding',
          battery: 'Optional (external)',
          antennas: '4x external detachable',
        }),
        primary_image: imageUrl,
        warranty_months: 24,
        is_active: 1,
        is_featured: 1,
        meta_title: 'D-Link DWR-2101 - Router 5G NR WiFi 6',
        meta_description: 'Router 5G D-Link DWR-2101, WiFi 6 AX1800, 3.4Gbps, Dual SIM',
      },
    }),

    // ========== CABLE & ADAPTER ==========
    prisma.products.upsert({
      where: { sku: 'AMP-CAT6-UTP-305M' },
      update: {},
      create: {
        category_id: categories[5].id, // Cable & Adapter
        name: 'Cáp mạng AMP Cat6 UTP 305m (1 thùng)',
        slug: 'cap-mang-amp-cat6-utp-305m',
        brand: 'AMP',
        model: 'Cat6 UTP',
        description: 'Cáp mạng Cat6 UTP 4 đôi, tốc độ 1 Gbps, 250MHz, chuẩn TIA/EIA-568-B',
        price: 1890000,
        compare_at_price: 2290000,
        sku: 'AMP-CAT6-UTP-305M',
        stock_quantity: 35,
        specifications: JSON.stringify({
          category: 'Cat6 UTP',
          conductor: '23 AWG Bare Copper',
          pairs: '4 pairs (8 conductors)',
          bandwidth: '250 MHz',
          speed: '1000 Mbps (1 Gigabit)',
          max_length: '100m per segment',
          jacket: 'PVC',
          color: 'Blue',
          standard: 'TIA/EIA-568-B.2-1',
          packaging: '305m/box',
        }),
        primary_image: imageUrl,
        warranty_months: 12,
        is_active: 1,
        is_featured: 0,
        meta_title: 'Cáp Mạng AMP Cat6 UTP 305m - Gigabit Ethernet',
        meta_description: 'Cáp mạng AMP Cat6 UTP 305m, 23AWG bare copper, 1Gbps, 250MHz',
      },
    }),

    prisma.products.upsert({
      where: { sku: 'COMMSCOPE-CAT6A-STP' },
      update: {},
      create: {
        category_id: categories[5].id, // Cable & Adapter
        name: 'CommScope Cat6A S/FTP Cable 305m',
        slug: 'commscope-cat6a-sftp-305m',
        brand: 'CommScope',
        model: 'Cat6A S/FTP',
        description: 'Cáp mạng Cat6A S/FTP chống nhiễu, 10 Gbps, 500MHz, LSZH',
        price: 4290000,
        compare_at_price: 4990000,
        sku: 'COMMSCOPE-CAT6A-STP',
        stock_quantity: 18,
        specifications: JSON.stringify({
          category: 'Cat6A S/FTP (Shielded)',
          conductor: '23 AWG Bare Copper',
          pairs: '4 pairs individually shielded + overall shield',
          bandwidth: '500 MHz',
          speed: '10 Gbps (10 Gigabit Ethernet)',
          max_length: '100m per segment',
          jacket: 'LSZH (Low Smoke Zero Halogen)',
          color: 'Gray',
          standard: 'ISO/IEC 11801, TIA-568.2-D',
          packaging: '305m/box',
        }),
        primary_image: imageUrl,
        warranty_months: 15,
        is_active: 1,
        is_featured: 1,
        meta_title: 'CommScope Cat6A S/FTP - Cáp 10 Gigabit Chống Nhiễu',
        meta_description: 'Cáp CommScope Cat6A S/FTP 305m, 10Gbps, 500MHz, LSZH, chống nhiễu',
      },
    }),

    prisma.products.upsert({
      where: { sku: 'TP-UE300' },
      update: {},
      create: {
        category_id: categories[5].id, // Cable & Adapter
        name: 'TP-Link UE300 USB 3.0 to Gigabit Ethernet Adapter',
        slug: 'tp-link-ue300-usb-ethernet',
        brand: 'TP-Link',
        model: 'UE300',
        description: 'Adapter USB 3.0 sang Gigabit Ethernet, tốc độ 1000 Mbps, plug and play',
        price: 190000,
        compare_at_price: 290000,
        sku: 'TP-UE300',
        stock_quantity: 250,
        specifications: JSON.stringify({
          interface: 'USB 3.0 Type-A',
          ethernet: '1x Gigabit RJ45',
          speed: '10/100/1000 Mbps auto-negotiation',
          chipset: 'Realtek RTL8153',
          os_support: 'Windows, macOS, Linux, Chrome OS',
          features: 'Plug and Play, Wake-on-LAN',
          led: '1x Link/Activity LED',
          cable_length: '12cm integrated USB cable',
          dimensions: '58 x 24 x 15 mm',
        }),
        primary_image: imageUrl,
        warranty_months: 24,
        is_active: 1,
        is_featured: 0,
        meta_title: 'TP-Link UE300 - Adapter USB 3.0 to Gigabit',
        meta_description: 'Adapter USB TP-Link UE300, USB 3.0 to Gigabit Ethernet 1000Mbps',
      },
    }),

    // ========== NETWORK TOOLS ==========
    prisma.products.upsert({
      where: { sku: 'FLUKE-MS2-100' },
      update: {},
      create: {
        category_id: categories[6].id, // Network Tool
        name: 'Fluke Networks MicroScanner2 Cable Verifier',
        slug: 'fluke-microscanner2-cable-tester',
        brand: 'Fluke Networks',
        model: 'MS2-100',
        description: 'Máy test cáp mạng chuyên nghiệp, kiểm tra Cat5e/6/6A, wiremap, length, PoE',
        price: 8990000,
        compare_at_price: 10990000,
        sku: 'FLUKE-MS2-100',
        stock_quantity: 8,
        specifications: JSON.stringify({
          test_cables: 'Cat5e, Cat6, Cat6A, Coax',
          tests: 'Wiremap, Length, Distance to Fault, PoE detection',
          poe_detection: '802.3af/at/bt (up to 90W)',
          display: 'Color LCD',
          reporting: 'PC reporting software included',
          battery: 'Rechargeable Li-ion (8 hours)',
          features: 'Tone Generator, IntelliTone support',
          certification: 'CE, FCC',
          warranty: '2 years',
        }),
        primary_image: imageUrl,
        warranty_months: 24,
        is_active: 1,
        is_featured: 1,
        meta_title: 'Fluke MicroScanner2 - Máy Test Cáp Mạng Chuyên Nghiệp',
        meta_description: 'Fluke MicroScanner2 test cáp Cat5e/6/6A, wiremap, length, PoE',
      },
    }),

    prisma.products.upsert({
      where: { sku: 'PROSKIT-MT-7062' },
      update: {},
      create: {
        category_id: categories[6].id, // Network Tool
        name: 'Pro\'sKit MT-7062 RJ45 Crimping Tool Kit',
        slug: 'proskit-mt7062-crimping-tool',
        brand: 'Pro\'sKit',
        model: 'MT-7062',
        description: 'Bộ dụng cụ bấm mạng RJ45/RJ11, cắt, tuốt dây, kèm cable tester',
        price: 350000,
        compare_at_price: 490000,
        sku: 'PROSKIT-MT-7062',
        stock_quantity: 156,
        specifications: JSON.stringify({
          crimping: 'RJ45, RJ12, RJ11 (8P8C, 6P6C, 6P4C, 6P2C)',
          cutting: 'Integrated wire cutter',
          stripping: 'Cable stripper for round/flat cables',
          tester: 'Basic cable tester included',
          material: 'Carbon steel with comfort grip',
          ratchet: 'Ratchet mechanism for consistent crimps',
          kit_includes: 'Crimper, Tester, 10x RJ45 connectors, 10x boots',
          weight: '320g',
        }),
        primary_image: imageUrl,
        warranty_months: 12,
        is_active: 1,
        is_featured: 0,
        meta_title: 'Pro\'sKit MT-7062 - Bộ Dụng Cụ Bấm Mạng RJ45',
        meta_description: 'Bộ bấm mạng Pro\'sKit MT-7062, RJ45/RJ11, kèm cable tester',
      },
    }),

    // ========== POE & POWER ==========
    prisma.products.upsert({
      where: { sku: 'TP-TL-POE150S' },
      update: {},
      create: {
        category_id: categories[7].id, // PoE & Power
        name: 'TP-Link TL-POE150S PoE Injector Adapter',
        slug: 'tp-link-tl-poe150s-injector',
        brand: 'TP-Link',
        model: 'TL-POE150S',
        description: 'PoE Injector 48V 15.4W, 802.3af, cấp nguồn cho Access Point, IP Camera',
        price: 190000,
        compare_at_price: 290000,
        sku: 'TP-TL-POE150S',
        stock_quantity: 185,
        specifications: JSON.stringify({
          standard: '802.3af PoE',
          power_output: '15.4W',
          voltage: '48V DC',
          ports: '1x Data In + 1x PoE Out',
          ethernet: 'Gigabit 10/100/1000 Mbps',
          max_distance: '100m',
          input: '100-240V AC 50/60Hz',
          protection: 'Short circuit, Overload, Overcurrent',
          led: 'Power, PoE',
          plug_and_play: 'Yes',
        }),
        primary_image: imageUrl,
        warranty_months: 24,
        is_active: 1,
        is_featured: 0,
        meta_title: 'TP-Link TL-POE150S - PoE Injector 802.3af 15.4W',
        meta_description: 'PoE Injector TP-Link TL-POE150S 48V 15.4W, 802.3af, Gigabit',
      },
    }),

    prisma.products.upsert({
      where: { sku: 'UBNT-POE-48-24W' },
      update: {},
      create: {
        category_id: categories[7].id, // PoE & Power
        name: 'Ubiquiti PoE Injector 48V 24W 802.3at',
        slug: 'ubiquiti-poe-injector-48v-24w',
        brand: 'Ubiquiti',
        model: 'POE-48-24W',
        description: 'PoE+ Injector 48V 24W 802.3at cho UniFi Access Points, Gigabit Ethernet',
        price: 290000,
        compare_at_price: 390000,
        sku: 'UBNT-POE-48-24W',
        stock_quantity: 142,
        specifications: JSON.stringify({
          standard: '802.3at PoE+',
          power_output: '24W',
          voltage: '48V DC',
          ports: '1x Data In + 1x PoE Out (Gigabit)',
          ethernet: 'Gigabit 10/100/1000 Mbps',
          max_distance: '100m',
          input: '100-240V AC 50/60Hz',
          compatible: 'UniFi AP-AC-Lite, AP-AC-LR, AP-AC-Pro',
          dimensions: '95 x 45 x 28 mm',
          weight: '135g',
        }),
        primary_image: imageUrl,
        warranty_months: 12,
        is_active: 1,
        is_featured: 0,
        meta_title: 'Ubiquiti PoE Injector 48V 24W - 802.3at PoE+',
        meta_description: 'PoE+ Injector Ubiquiti 48V 24W 802.3at, Gigabit, cho UniFi AP',
      },
    }),

    prisma.products.upsert({
      where: { sku: 'APC-BX650LI-MS' },
      update: {},
      create: {
        category_id: categories[7].id, // PoE & Power
        name: 'APC Back-UPS BX650LI-MS 650VA UPS',
        slug: 'apc-back-ups-bx650li-ms',
        brand: 'APC',
        model: 'BX650LI-MS',
        description: 'Bộ lưu điện UPS 650VA/325W cho thiết bị mạng, AVR, 4 ổ cắm',
        price: 1490000,
        compare_at_price: 1790000,
        sku: 'APC-BX650LI-MS',
        stock_quantity: 42,
        specifications: JSON.stringify({
          capacity: '650VA / 325W',
          topology: 'Line Interactive',
          battery: '12V 7Ah sealed lead-acid',
          runtime: '10 min @ 50% load, 3 min @ full load',
          outlets: '4x Universal (with surge protection)',
          avr: 'Automatic Voltage Regulation',
          input_voltage: '160-290V AC',
          output_voltage: '230V AC ±10%',
          features: 'Audible alarm, LED status, Replaceable battery',
          dimensions: '280 x 100 x 142 mm',
          weight: '4.2 kg',
        }),
        primary_image: imageUrl,
        warranty_months: 24,
        is_active: 1,
        is_featured: 0,
        meta_title: 'APC Back-UPS BX650LI-MS - UPS 650VA Cho Thiết Bị Mạng',
        meta_description: 'UPS APC BX650LI-MS 650VA/325W, AVR, 4 ổ cắm, cho router, switch',
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
  console.log('\n' + '='.repeat(60));
  console.log('✨ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: 3 (1 admin, 2 customers)`);
  console.log(`   - Categories: ${categories.length} (Network Equipment)`);
  console.log(`   - Products: ${products.length} (Routers, Switches, Access Points, etc.)`);
  console.log(`   - Addresses: ${addresses.length}`);
  console.log(`   - Order Statuses: ${orderStatuses.length}`);
  console.log(`   - Shopping Carts: 2`);
  console.log(`   - Cart Items: ${cartItems.length} (in customer2's cart)`);
  console.log(`   - Orders: 3 sample orders\n`);
  
  console.log('🔑 Login Credentials:');
  console.log('\n   👑 ADMIN:');
  console.log('   Email:    admin@networkstore.com');
  console.log('   Password: Admin@123456');
  console.log('   Role:     Administrator');
  console.log('\n   👤 CUSTOMER 1:');
  console.log('   Email:    customer@test.com');
  console.log('   Password: Customer@123');
  console.log('\n   👤 CUSTOMER 2:');
  console.log('   Email:    customer@example.com');
  console.log('   Password: Customer@123');
  
  console.log('\n📦 Network Equipment Categories:');
  console.log('   1. Router - WiFi 6, Mesh, Enterprise Gateway');
  console.log('   2. Switch - Managed, PoE, Layer 3');
  console.log('   3. Access Point - WiFi 6, Indoor/Outdoor');
  console.log('   4. Firewall - NGFW, Security Gateway');
  console.log('   5. Modem - GPON, 4G/5G');
  console.log('   6. Cable & Adapter - Cat6/6A, USB Ethernet');
  console.log('   7. Network Tools - Cable Tester, Crimping');
  console.log('   8. PoE & Power - Injector, UPS');
  
  console.log('\n🏷️  Featured Products:');
  console.log('   - TP-Link Archer AX3000 WiFi 6 Router - 1,890,000₫');
  console.log('   - ASUS RT-AX86U Gaming Router - 5,490,000₫');
  console.log('   - Ubiquiti UniFi Dream Machine Pro - 12,990,000₫');
  console.log('   - Cisco SG350-28P PoE Switch - 15,990,000₫');
  console.log('   - Ubiquiti UniFi 6 Lite Access Point - 2,790,000₫');
  console.log('   - Fortinet FortiGate 60F Firewall - 28,990,000₫');
  console.log('   - D-Link DWR-2101 5G Router - 8,990,000₫');
  
  console.log('\n🧪 Quick Test Commands:');
  console.log('   # Login as customer');
  console.log('   curl -X POST http://localhost:3000/api/v1/auth/login \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"email":"customer@test.com","password":"Customer@123"}\'');
  console.log('\n   # Get all products');
  console.log('   curl http://localhost:3000/api/v1/products');
  console.log('\n   # Get products by category (Router)');
  console.log('   curl http://localhost:3000/api/v1/products?category_id=1');
  console.log('\n   # Search products');
  console.log('   curl http://localhost:3000/api/v1/products?search=wifi');
  console.log('\n' + '='.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
