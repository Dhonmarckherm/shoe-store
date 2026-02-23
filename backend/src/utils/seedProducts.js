const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const sampleProducts = [
  {
    name: 'Nike Air Max 270',
    description: 'The Nike Air Max 270 delivers visible cushioning under every step. Updated for modern comfort, it features a mesh upper for breathability and a large Max Air unit for all-day comfort.',
    price: 150.00,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    ],
    category: 'running',
    brand: 'Nike',
    sizes: [
      { size: '7', stock: 15 },
      { size: '8', stock: 20 },
      { size: '9', stock: 25 },
      { size: '10', stock: 18 },
      { size: '11', stock: 12 },
    ],
    colors: ['Black/Red', 'White/Blue', 'Grey/Orange'],
    features: ['Max Air cushioning', 'Breathable mesh upper', 'Foam midsole', 'Rubber outsole'],
    rating: 4.5,
    numReviews: 128,
  },
  {
    name: 'Adidas Ultraboost 22',
    description: 'Experience incredible energy return with the Adidas Ultraboost 22. The Primeknit upper wraps your foot for a supportive fit, while Boost cushioning delivers comfort with every stride.',
    price: 190.00,
    images: [
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
    ],
    category: 'running',
    brand: 'Adidas',
    sizes: [
      { size: '7', stock: 10 },
      { size: '8', stock: 15 },
      { size: '9', stock: 20 },
      { size: '10', stock: 15 },
      { size: '11', stock: 8 },
    ],
    colors: ['Core Black', 'Cloud White', 'Solar Red'],
    features: ['Boost midsole', 'Primeknit upper', 'Continental Rubber outsole', 'Sock-like fit'],
    rating: 4.7,
    numReviews: 245,
  },
  {
    name: 'New Balance 574',
    description: 'A classic sneaker that never goes out of style. The New Balance 574 features ENCAP midsole technology for support and durability, making it perfect for everyday wear.',
    price: 85.00,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
    ],
    category: 'casual',
    brand: 'New Balance',
    sizes: [
      { size: '7', stock: 25 },
      { size: '8', stock: 30 },
      { size: '9', stock: 35 },
      { size: '10', stock: 28 },
      { size: '11', stock: 20 },
    ],
    colors: ['Grey', 'Navy', 'Burgundy'],
    features: ['ENCAP midsole', 'Suede and mesh upper', 'Durable rubber outsole', 'Classic design'],
    rating: 4.4,
    numReviews: 312,
  },
  {
    name: 'Jordan 1 Retro High',
    description: 'The shoe that started it all. The Air Jordan 1 Retro High OG delivers heritage style with premium materials and the iconic silhouette that changed basketball forever.',
    price: 170.00,
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    ],
    category: 'sneakers',
    brand: 'Jordan',
    sizes: [
      { size: '7', stock: 5 },
      { size: '8', stock: 8 },
      { size: '9', stock: 10 },
      { size: '10', stock: 6 },
      { size: '11', stock: 4 },
    ],
    colors: ['Chicago', 'Royal Blue', 'Bred'],
    features: ['Full-grain leather', 'Air-Sole unit', 'Rubber outsole', 'High-top design'],
    rating: 4.8,
    numReviews: 567,
  },
  {
    name: 'Puma RS-X3',
    description: 'Bold and bulky, the RS-X3 celebrates reinvention with a futuristic design. The Running System technology provides superior cushioning for all-day comfort.',
    price: 110.00,
    images: [
      'https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3?w=800',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
    ],
    category: 'sneakers',
    brand: 'Puma',
    sizes: [
      { size: '7', stock: 18 },
      { size: '8', stock: 22 },
      { size: '9', stock: 25 },
      { size: '10', stock: 20 },
      { size: '11', stock: 15 },
    ],
    colors: ['White/Multi', 'Black/Red', 'Blue/Yellow'],
    features: ['RS technology', 'Mesh upper', 'Rubber outsole', 'Bold design'],
    rating: 4.3,
    numReviews: 89,
  },
  {
    name: 'Converse Chuck Taylor All Star',
    description: 'The iconic sneaker that defined generations. The Chuck Taylor All Star features a canvas upper and rubber sole for timeless style and comfort.',
    price: 55.00,
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800',
      'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=800',
    ],
    category: 'casual',
    brand: 'Converse',
    sizes: [
      { size: '7', stock: 50 },
      { size: '8', stock: 55 },
      { size: '9', stock: 60 },
      { size: '10', stock: 50 },
      { size: '11', stock: 40 },
    ],
    colors: ['Optical White', 'Black', 'Red'],
    features: ['Canvas upper', 'Rubber outsole', 'Medial eyelets', 'Classic design'],
    rating: 4.6,
    numReviews: 892,
  },
  {
    name: 'Vans Old Skool',
    description: 'The Vans Old Skool is a classic skate shoe featuring the iconic side stripe. Durable suede and canvas uppers make it perfect for skating or casual wear.',
    price: 65.00,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
      'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800',
    ],
    category: 'casual',
    brand: 'Vans',
    sizes: [
      { size: '7', stock: 30 },
      { size: '8', stock: 35 },
      { size: '9', stock: 40 },
      { size: '10', stock: 32 },
      { size: '11', stock: 25 },
    ],
    colors: ['Black/White', 'Navy', 'Checkerboard'],
    features: ['Suede and canvas upper', 'Padded collar', 'Waffle outsole', 'Iconic side stripe'],
    rating: 4.5,
    numReviews: 445,
  },
  {
    name: 'Nike Air Force 1',
    description: 'The legend lives on in the Nike Air Force 1. This hoops original puts a fresh spin on what you know best: durable leather, crisp details, and the perfect amount of flash.',
    price: 90.00,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800',
    ],
    category: 'casual',
    brand: 'Nike',
    sizes: [
      { size: '7', stock: 40 },
      { size: '8', stock: 45 },
      { size: '9', stock: 50 },
      { size: '10', stock: 42 },
      { size: '11', stock: 35 },
    ],
    colors: ['White', 'Black', 'Triple White'],
    features: ['Leather upper', 'Air-Sole cushioning', 'Rubber outsole', 'Perforations'],
    rating: 4.7,
    numReviews: 723,
  },
  {
    name: 'Timberland 6" Premium Boot',
    description: 'The original waterproof boot that started it all. The Timberland 6" Premium Boot features premium waterproof leather, seam-sealed construction, and classic styling.',
    price: 198.00,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800',
    ],
    category: 'boots',
    brand: 'Timberland',
    sizes: [
      { size: '7', stock: 12 },
      { size: '8', stock: 15 },
      { size: '9', stock: 18 },
      { size: '10', stock: 14 },
      { size: '11', stock: 10 },
    ],
    colors: ['Wheat Nubuck', 'Black', 'Dark Brown'],
    features: ['Waterproof leather', 'Seam-sealed construction', 'Padded collar', 'Rubber lug outsole'],
    rating: 4.6,
    numReviews: 334,
  },
  {
    name: 'Dr. Martens 1460',
    description: 'The iconic 8-eye boot with a history of rebellion. The Dr. Martens 1460 features the signature air-cushioned sole and yellow stitching that defines the brand.',
    price: 150.00,
    images: [
      'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800',
      'https://images.unsplash.com/photo-1542841791-19218b9f50f3?w=800',
    ],
    category: 'boots',
    brand: 'Dr. Martens',
    sizes: [
      { size: '7', stock: 8 },
      { size: '8', stock: 12 },
      { size: '9', stock: 15 },
      { size: '10', stock: 10 },
      { size: '11', stock: 7 },
    ],
    colors: ['Black Smooth', 'Cherry Red', 'White'],
    features: ['AirWair sole', 'Smooth leather', 'Yellow stitching', 'Goodyear welt'],
    rating: 4.7,
    numReviews: 278,
  },
  {
    name: 'Birkenstock Arizona',
    description: 'The classic two-strap sandal with adjustable buckles. The Birkenstock Arizona features the iconic footbed that molds to your feet for custom comfort.',
    price: 110.00,
    images: [
      'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800',
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=800',
    ],
    category: 'sandals',
    brand: 'Birkenstock',
    sizes: [
      { size: '7', stock: 20 },
      { size: '8', stock: 25 },
      { size: '9', stock: 30 },
      { size: '10', stock: 22 },
      { size: '11', stock: 18 },
    ],
    colors: ['Mocha', 'Black', 'White'],
    features: ['Cork footbed', 'Suede lining', 'EVA sole', 'Adjustable straps'],
    rating: 4.8,
    numReviews: 512,
  },
  {
    name: 'Reebok Nano X3',
    description: 'The official shoe of fitness. The Reebok Nano X3 is built for CrossFit and high-intensity training with stability, flexibility, and durability.',
    price: 140.00,
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
    ],
    category: 'training',
    brand: 'Reebok',
    sizes: [
      { size: '7', stock: 15 },
      { size: '8', stock: 20 },
      { size: '9', stock: 25 },
      { size: '10', stock: 18 },
      { size: '11', stock: 12 },
    ],
    colors: ['Black/White', 'Vector Navy', 'Chalk/Gum'],
    features: ['Flexweave upper', 'Floatride Energy Foam', 'RopePro tech', 'Toe Tection'],
    rating: 4.5,
    numReviews: 156,
  },
  // Additional product variations to increase total count
  {
    name: 'Nike Dunk Low',
    description: 'The Nike Dunk Low brings 80s basketball style to the streets. Originally designed for high-flying dunk contests, this icon returns with crisp leather and bold color blocking.',
    price: 115.00,
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
    ],
    category: 'sneakers',
    brand: 'Nike',
    sizes: [
      { size: '7', stock: 22 },
      { size: '8', stock: 28 },
      { size: '9', stock: 32 },
      { size: '10', stock: 25 },
      { size: '11', stock: 18 },
    ],
    colors: ['Panda', 'Kentucky', 'What The'],
    features: ['Full-grain leather', 'Padded collar', 'Rubber outsole', 'Perforated toe'],
    rating: 4.6,
    numReviews: 387,
  },
  {
    name: 'Adidas Forum Low',
    description: 'Step into iconic basketball heritage with the Adidas Forum Low. The classic X-strap design and premium leather upper deliver timeless style and comfort.',
    price: 90.00,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
      'https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800',
    ],
    category: 'sneakers',
    brand: 'Adidas',
    sizes: [
      { size: '7', stock: 18 },
      { size: '8', stock: 24 },
      { size: '9', stock: 28 },
      { size: '10', stock: 22 },
      { size: '11', stock: 15 },
    ],
    colors: ['White/Blue', 'Black/White', 'Red/White'],
    features: ['Leather upper', 'X-strap design', 'Rubber outsole', 'Perforated details'],
    rating: 4.4,
    numReviews: 234,
  },
  {
    name: 'Reebok Classic Leather',
    description: 'The Reebok Classic Leather is a timeless icon that never goes out of style. Featuring premium leather and the iconic vector logo, it\'s perfect for everyday wear.',
    price: 85.00,
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
    ],
    category: 'casual',
    brand: 'Reebok',
    sizes: [
      { size: '7', stock: 30 },
      { size: '8', stock: 35 },
      { size: '9', stock: 40 },
      { size: '10', stock: 32 },
      { size: '11', stock: 25 },
    ],
    colors: ['White', 'Black', 'Navy'],
    features: ['Premium leather', 'EVA midsole', 'Rubber outsole', 'Vector logo'],
    rating: 4.5,
    numReviews: 412,
  },
  {
    name: 'Asics Gel-Kayano 29',
    description: 'The Asics Gel-Kayano 29 delivers premium stability and cushioning for runners. Featuring FF Blast Plus cushioning and a Guidance Line midsole for smooth heel-to-toe transition.',
    price: 160.00,
    images: [
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800',
    ],
    category: 'running',
    brand: 'Asics',
    sizes: [
      { size: '7', stock: 12 },
      { size: '8', stock: 18 },
      { size: '9', stock: 22 },
      { size: '10', stock: 16 },
      { size: '11', stock: 10 },
    ],
    colors: ['Black/Silver', 'White/Blue', 'Grey/Orange'],
    features: ['FF Blast Plus cushioning', 'Guidance Line', 'Engineered mesh', 'Gel technology'],
    rating: 4.7,
    numReviews: 178,
  },
  {
    name: 'Brooks Ghost 15',
    description: 'The Brooks Ghost 15 offers neutral cushioning and a smooth ride. Perfect for daily training runs with DNA Loft cushioning and 3D Fit Print upper.',
    price: 130.00,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    ],
    category: 'running',
    brand: 'Brooks',
    sizes: [
      { size: '7', stock: 15 },
      { size: '8', stock: 20 },
      { size: '9', stock: 25 },
      { size: '10', stock: 18 },
      { size: '11', stock: 12 },
    ],
    colors: ['Black/White', 'Blue/Grey', 'Pink/White'],
    features: ['DNA Loft cushioning', '3D Fit Print', 'Segmented crash pad', 'Soft engineered mesh'],
    rating: 4.6,
    numReviews: 205,
  },
  {
    name: 'Crocs Classic Clog',
    description: 'The iconic Crocs Classic Clog with ventilation holes and comfortable Croslite material. Perfect for casual wear and all-day comfort.',
    price: 49.99,
    images: [
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=800',
      'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800',
    ],
    category: 'sandals',
    brand: 'Crocs',
    sizes: [
      { size: '7', stock: 45 },
      { size: '8', stock: 50 },
      { size: '9', stock: 55 },
      { size: '10', stock: 48 },
      { size: '11', stock: 40 },
    ],
    colors: ['Classic Grey', 'Black', 'White'],
    features: ['Croslite material', 'Ventilation holes', 'Odor-resistant', 'Lightweight'],
    rating: 4.3,
    numReviews: 678,
  },
  {
    name: 'Teva Original Universal',
    description: 'The Teva Original Universal sandal with adjustable straps and durable construction. Perfect for outdoor adventures and casual wear.',
    price: 75.00,
    images: [
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=800',
      'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=800',
    ],
    category: 'sandals',
    brand: 'Teva',
    sizes: [
      { size: '7', stock: 25 },
      { size: '8', stock: 30 },
      { size: '9', stock: 35 },
      { size: '10', stock: 28 },
      { size: '11', stock: 22 },
    ],
    colors: ['Black', 'Brown', 'Grey'],
    features: ['Adjustable straps', 'Durabrasion rubber', 'Microban protection', 'Anatomical footbed'],
    rating: 4.4,
    numReviews: 321,
  },
  {
    name: 'Sperry Authentic Original',
    description: 'The classic Sperry boat shoe with rawhide laces and non-marking sole. Timeless style meets nautical heritage.',
    price: 100.00,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
    ],
    category: 'casual',
    brand: 'Sperry',
    sizes: [
      { size: '7', stock: 18 },
      { size: '8', stock: 22 },
      { size: '9', stock: 25 },
      { size: '10', stock: 20 },
      { size: '11', stock: 15 },
    ],
    colors: ['White', 'Brown', 'Navy'],
    features: ['Rawhide laces', 'Non-marking sole', 'Leather upper', 'Moccasin construction'],
    rating: 4.5,
    numReviews: 267,
  },
  {
    name: 'Clarks Tilden Cap',
    description: 'The Clarks Tilden Cap combines comfort and style with OrthoLite footbed and premium leather construction. Perfect for business casual wear.',
    price: 125.00,
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
    ],
    category: 'casual',
    brand: 'Clarks',
    sizes: [
      { size: '7', stock: 15 },
      { size: '8', stock: 20 },
      { size: '9', stock: 25 },
      { size: '10', stock: 18 },
      { size: '11', stock: 12 },
    ],
    colors: ['Black', 'Brown', 'Tan'],
    features: ['OrthoLite footbed', 'Premium leather', 'Cushion Soft technology', 'Durable construction'],
    rating: 4.6,
    numReviews: 189,
  },
  {
    name: 'Cole Haan Original Grand',
    description: 'The Cole Haan Original Grand combines style and comfort with Grand.OS technology and premium materials. Perfect for dress casual occasions.',
    price: 165.00,
    images: [
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
    ],
    category: 'casual',
    brand: 'Cole Haan',
    sizes: [
      { size: '7', stock: 12 },
      { size: '8', stock: 16 },
      { size: '9', stock: 20 },
      { size: '10', stock: 15 },
      { size: '11', stock: 10 },
    ],
    colors: ['Black', 'Brown', 'Navy'],
    features: ['Grand.OS technology', 'Laser-perforated design', 'Premium leather', 'Memory foam insole'],
    rating: 4.7,
    numReviews: 234,
  },
  {
    name: 'Caterpillar Second Shift',
    description: 'The Caterpillar Second Shift work boot combines durability with comfort. Features waterproof construction and steel toe protection.',
    price: 185.00,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800',
    ],
    category: 'boots',
    brand: 'Caterpillar',
    sizes: [
      { size: '7', stock: 8 },
      { size: '8', stock: 12 },
      { size: '9', stock: 15 },
      { size: '10', stock: 10 },
      { size: '11', stock: 6 },
    ],
    colors: ['Black', 'Brown'],
    features: ['Waterproof leather', 'Steel toe', 'Slip-resistant sole', 'Cushion insole'],
    rating: 4.5,
    numReviews: 156,
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shoe-store');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${sampleProducts.length} products`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  seedProducts();
}

module.exports = seedProducts;
