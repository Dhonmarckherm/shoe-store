// Direct MongoDB seed script for Render backend
const mongoose = require('mongoose');

const Product = require('./src/models/Product');

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://dhonmarck2004_db_user:EZC8I5hN27VsvoJq@cluster1.p6sn0sb.mongodb.net/shoe-store?retryWrites=true&w=majority';

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
    name: 'Nike Air Force 1',
    description: 'The Nike Air Force 1 is a classic basketball shoe that has become a streetwear icon. Its timeless design and comfortable cushioning make it a must-have for any sneaker collection.',
    price: 110.00,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
      'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800',
    ],
    category: 'sneakers',
    brand: 'Nike',
    sizes: [
      { size: '7', stock: 20 },
      { size: '8', stock: 25 },
      { size: '9', stock: 30 },
      { size: '10', stock: 22 },
      { size: '11', stock: 15 },
    ],
    colors: ['White', 'Black', 'White/Black'],
    features: ['Air-Sole unit', 'Leather upper', 'Padded collar', 'Pivot points'],
    rating: 4.8,
    numReviews: 512,
  },
  {
    name: 'New Balance 574',
    description: 'The New Balance 574 is a running-inspired lifestyle shoe that combines comfort and style. With its ENCAP midsole cushioning and suede/mesh upper, it is perfect for everyday wear.',
    price: 85.00,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473e23551?w=800',
      'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=800',
    ],
    category: 'sneakers',
    brand: 'New Balance',
    sizes: [
      { size: '7', stock: 12 },
      { size: '8', stock: 18 },
      { size: '9', stock: 22 },
      { size: '10', stock: 16 },
      { size: '11', stock: 10 },
    ],
    colors: ['Grey', 'Navy', 'Burgundy'],
    features: ['ENCAP midsole', 'Suede/mesh upper', 'EVA foam cushioning', 'Rubber outsole'],
    rating: 4.6,
    numReviews: 189,
  },
  {
    name: 'Converse Chuck Taylor All Star',
    description: 'The Converse Chuck Taylor All Star is the most iconic sneaker in the world. Its timeless design and affordable price make it a staple in everyones wardrobe.',
    price: 60.00,
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800',
    ],
    category: 'sneakers',
    brand: 'Converse',
    sizes: [
      { size: '7', stock: 25 },
      { size: '8', stock: 30 },
      { size: '9', stock: 35 },
      { size: '10', stock: 28 },
      { size: '11', stock: 20 },
    ],
    colors: ['Black', 'White', 'Red', 'Navy'],
    features: ['Canvas upper', 'Vulcanized rubber sole', 'OrthoLite insole', 'Iconic silhouette'],
    rating: 4.7,
    numReviews: 892,
  },
  {
    name: 'Vans Old Skool',
    description: 'The Vans Old Skool is a classic skate shoe with a low-top silhouette. Its durable construction and iconic side stripe make it a favorite among skaters and sneaker enthusiasts.',
    price: 65.00,
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
    ],
    category: 'sports',
    brand: 'Vans',
    sizes: [
      { size: '7', stock: 18 },
      { size: '8', stock: 22 },
      { size: '9', stock: 28 },
      { size: '10', stock: 20 },
      { size: '11', stock: 14 },
    ],
    colors: ['Black/White', 'Navy', 'Burgundy'],
    features: ['Durable canvas', 'Padded collar', 'Waffle outsole', 'Iconic side stripe'],
    rating: 4.6,
    numReviews: 324,
  },
  {
    name: 'Puma RS-X3',
    description: 'The Puma RS-X3 is a bold and chunky sneaker inspired by the original RS Shoes from the 80s. It features a mix of materials and vibrant colors for a retro-futuristic look.',
    price: 110.00,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
      'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
    ],
    category: 'sneakers',
    brand: 'Puma',
    sizes: [
      { size: '7', stock: 10 },
      { size: '8', stock: 15 },
      { size: '9', stock: 20 },
      { size: '10', stock: 14 },
      { size: '11', stock: 8 },
    ],
    colors: ['White/Blue', 'Black/Red', 'Grey/Yellow'],
    features: ['Running System technology', 'Mesh/leather upper', 'Chunky midsole', 'Bold design'],
    rating: 4.4,
    numReviews: 156,
  },
  {
    name: 'Reebok Club C 85',
    description: 'The Reebok Club C 85 is a tennis-inspired classic with a clean and simple design. Its soft leather upper and low-cut design provide comfort and style for everyday wear.',
    price: 75.00,
    images: [
      'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
      'https://images.unsplash.com/photo-1628149455676-13d87888a7f7?w=800',
    ],
    category: 'sneakers',
    brand: 'Reebok',
    sizes: [
      { size: '7', stock: 14 },
      { size: '8', stock: 18 },
      { size: '9', stock: 22 },
      { size: '10', stock: 16 },
      { size: '11', stock: 10 },
    ],
    colors: ['White/Green', 'White/Navy', 'White'],
    features: ['Soft leather upper', 'Low-cut design', 'Die-cut EVA midsole', 'Rubber outsole'],
    rating: 4.5,
    numReviews: 178,
  },
  {
    name: 'Nike LeBron 20',
    description: 'The Nike LeBron 20 is built for explosive players. With responsive cushioning and a lightweight design, it helps you dominate on the court.',
    price: 200.00,
    images: [
      'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800',
    ],
    category: 'sports',
    brand: 'Nike',
    sizes: [
      { size: '7', stock: 8 },
      { size: '8', stock: 12 },
      { size: '9', stock: 16 },
      { size: '10', stock: 12 },
      { size: '11', stock: 8 },
    ],
    colors: ['Black/Red', 'White/Blue', 'Purple/Gold'],
    features: ['Zoom Air cushioning', 'Knit upper', 'Lightweight design', 'Court-ready traction'],
    rating: 4.8,
    numReviews: 234,
  },
  {
    name: 'Adidas Harden Vol. 7',
    description: 'The Adidas Harden Vol. 7 is designed for James Hardens explosive playing style. It features responsive cushioning and a secure fit for elite performance on the court.',
    price: 160.00,
    images: [
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    ],
    category: 'sports',
    brand: 'Adidas',
    sizes: [
      { size: '7', stock: 6 },
      { size: '8', stock: 10 },
      { size: '9', stock: 14 },
      { size: '10', stock: 10 },
      { size: '11', stock: 6 },
    ],
    colors: ['Black', 'White/Red', 'Blue/Yellow'],
    features: ['Bounce cushioning', 'Textile upper', 'Rubber outsole', 'Secure lacing system'],
    rating: 4.6,
    numReviews: 167,
  },
  {
    name: 'Brooks Ghost 15',
    description: 'The Brooks Ghost 15 is a neutral running shoe that offers smooth transitions and soft cushioning. Perfect for daily training and long runs.',
    price: 140.00,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
    ],
    category: 'running',
    brand: 'Brooks',
    sizes: [
      { size: '7', stock: 12 },
      { size: '8', stock: 16 },
      { size: '9', stock: 20 },
      { size: '10', stock: 14 },
      { size: '11', stock: 8 },
    ],
    colors: ['Black/Grey', 'White/Blue', 'Red/Black'],
    features: ['DNA LOFT cushioning', 'Segmented Crash Pad', '3D Fit Print upper', 'Smooth transitions'],
    rating: 4.7,
    numReviews: 412,
  },
  {
    name: 'ASICS Gel-Kayano 29',
    description: 'The ASICS Gel-Kayano 29 provides excellent stability and cushioning for overpronators. It is perfect for long-distance runners who need extra support.',
    price: 160.00,
    images: [
      'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
    ],
    category: 'running',
    brand: 'ASICS',
    sizes: [
      { size: '7', stock: 10 },
      { size: '8', stock: 14 },
      { size: '9', stock: 18 },
      { size: '10', stock: 12 },
      { size: '11', stock: 6 },
    ],
    colors: ['Black/White', 'Blue/Orange', 'Grey/Red'],
    features: ['GEL technology', 'Dynamic DuoMax Support', 'FlyteFoam cushioning', 'Engineered mesh upper'],
    rating: 4.6,
    numReviews: 289,
  },
];

async function seedProducts() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB!');

    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Existing products cleared!');

    // Insert new products
    console.log('Inserting new products...');
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully seeded ${products.length} products!`);

    // Display seeded products
    console.log('\n📦 Seeded Products:');
    products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - $${product.price}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding products:', error.message);
    process.exit(1);
  }
}

seedProducts();
