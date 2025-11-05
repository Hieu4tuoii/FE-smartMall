// Mock data for the e-commerce site (copied from giao_dien)

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  sold: number;
  category: string;
  brand: string;
  description: string;
  specs: { [key: string]: string };
  variants?: {
    colors?: Array<{ name: string; hex: string } | string>;
    storage?: string[];
  };
  images?: string[];
  inStock: boolean;
}

export const categories = [
  { id: 'phones', name: 'Điện thoại', slug: 'dien-thoai' },
  { id: 'laptop', name: 'Laptop', slug: 'laptop' },
  { id: 'tablet', name: 'Tablet', slug: 'tablet' },
  { id: 'headphones', name: 'Tai nghe', slug: 'tai-nghe' },
  { id: 'smartwatch', name: 'Smartwatch', slug: 'smartwatch' },
  { id: 'accessories', name: 'Phụ kiện', slug: 'phu-kien' },
];

export const brands = [
  'Apple',
  'Samsung',
  'Xiaomi',
  'OPPO',
  'Realme',
  'Vivo',
  'Sony',
  'Anker',
  'Belkin',
  'Dell',
  'HP',
  'Lenovo',
  'Asus',
  'Acer',
  'JBL',
  'Beats',
];

export const products: Product[] = [
  // A trimmed subset for initial integration; extend as needed
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: 29990000,
    originalPrice: 34990000,
    image: 'https://images.unsplash.com/photo-1603625953337-1232f39f535a?w=500',
    rating: 4.9,
    sold: 1250,
    category: 'phones',
    brand: 'Apple',
    description: 'iPhone 15 Pro Max - Đỉnh cao công nghệ với thiết kế Titan cao cấp',
    specs: {
      'Màn hình': '6.7" Super Retina XDR, ProMotion 120Hz',
      'Chip': 'A17 Pro 3nm',
      'Camera sau': '48MP Main + 12MP Ultra Wide + 12MP Telephoto 5x',
      'Camera trước': '12MP TrueDepth',
      'Pin': '4422 mAh, sạc nhanh 27W',
      'RAM': '8GB',
      'Hệ điều hành': 'iOS 17',
      'Chống nước': 'IP68',
    },
    variants: {
      colors: [
        { name: 'Titan Tự Nhiên', hex: '#d4c5b0' },
        { name: 'Titan Xanh', hex: '#4a6572' },
        { name: 'Titan Trắng', hex: '#e8e8e8' },
        { name: 'Titan Đen', hex: '#3d3d3d' },
      ],
      storage: ['256GB', '512GB', '1TB'],
    },
    images: [
      'https://images.unsplash.com/photo-1603625953337-1232f39f535a?w=800',
      'https://images.unsplash.com/photo-1603812188321-94ba55ed5652?w=800',
      'https://images.unsplash.com/photo-1634978869751-7d0d4f03dc39?w=800',
    ],
    inStock: true,
  },
  {
    id: '5',
    name: 'AirPods Pro 2',
    price: 5990000,
    originalPrice: 6990000,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500',
    rating: 4.9,
    sold: 2100,
    category: 'headphones',
    brand: 'Apple',
    description: 'AirPods Pro 2 với chip H2, chống ồn chủ động',
    specs: {
      'Kết nối': 'Bluetooth 5.3',
      'Chống ồn': 'Active Noise Cancellation',
      'Thời lượng pin': 'Lên đến 30 giờ',
      'Chống nước': 'IPX4',
    },
    inStock: true,
  },
  {
    id: '10',
    name: 'iPad Pro 12.9" M2',
    price: 28990000,
    originalPrice: 32990000,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
    rating: 4.9,
    sold: 560,
    category: 'tablet',
    brand: 'Apple',
    description: 'iPad Pro với chip M2, màn hình Liquid Retina XDR',
    specs: {
      'Màn hình': '12.9" Liquid Retina XDR',
      'Chip': 'M2',
      'RAM': '8GB',
      'Camera': '12MP + 10MP',
    },
    inStock: true,
  },
];

export const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
    title: 'iPhone 15 Pro Max',
    subtitle: 'Giảm đến 5 triệu',
    link: '/product/1',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=1200',
    title: 'Galaxy S24 Ultra',
    subtitle: 'Ưu đãi hấp dẫn',
    link: '/product/2',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200',
    title: 'Phụ kiện giảm 50%',
    subtitle: 'Mua ngay hôm nay',
    link: '/category/phu-kien',
  },
];




