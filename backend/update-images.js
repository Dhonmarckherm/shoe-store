const mongoose = require('mongoose');

// Using placeholder.com to generate colored placeholders with product names
// This creates consistent, recognizable placeholders for each shoe type
const realImages = {
  'Nike Air Max 270': 'https://placehold.co/400x400/e63946/ffffff?text=Nike+Air+Max+270',
  'Adidas Ultraboost 22': 'https://placehold.co/400x400/457b9d/ffffff?text=Adidas+Ultraboost+22',
  'Puma RS-X3': 'https://placehold.co/400x400/1d3557/ffffff?text=Puma+RS-X3',
  'New Balance 574': 'https://placehold.co/400x400/2a9d8f/ffffff?text=New+Balance+574',
  'Converse Chuck Taylor All Star': 'https://placehold.co/400x400/e76f51/ffffff?text=Converse+Chuck+Taylor',
  'Vans Old Skool': 'https://placehold.co/400x400/264653/ffffff?text=Vans+Old+Skool',
  'Nike Zoom Fly 5': 'https://placehold.co/400x400/f4a261/ffffff?text=Nike+Zoom+Fly+5',
  'Asics Gel-Kayano 29': 'https://placehold.co/400x400/2a9d8f/ffffff?text=Asics+Gel-Kayano+29',
  'Brooks Ghost 15': 'https://placehold.co/400x400/e9c46a/ffffff?text=Brooks+Ghost+15',
  'Crocs Classic Clog': 'https://placehold.co/400x400/9b5de5/ffffff?text=Crocs+Classic+Clog',
  'Sperry Authentic Original': 'https://placehold.co/400x400/00bbf9/ffffff?text=Sperry+Boat+Shoe',
  'Toms Alpargata': 'https://placehold.co/400x400/fee440/ffffff?text=Toms+Alpargata',
  'Nike Air Force 1': 'https://placehold.co/400x400/ffffff/333333?text=Nike+Air+Force+1',
  'Adidas Forum Low': 'https://placehold.co/400x400/3a86ff/ffffff?text=Adidas+Forum+Low',
  'Reebok Club C 85': 'https://placehold.co/400x400/8338ec/ffffff?text=Reebok+Club+C+85',
  'Timberland Premium 6-Inch': 'https://placehold.co/400x400/fb8500/ffffff?text=Timberland+6-Inch',
  'Dr. Martens 1460': 'https://placehold.co/400x400/d62828/ffffff?text=Dr+Martens+1460',
  'Caterpillar Second Shift': 'https://placehold.co/400x400/606c38/ffffff?text=CAT+Second+Shift',
  'Clarks Tilden Cap': 'https://placehold.co/400x400/6d597a/ffffff?text=Clarks+Tilden+Cap',
  'Cole Haan Original Grand': 'https://placehold.co/400x400/b08968/ffffff?text=Cole+Haan+Grand',
  'Nike LeBron 20': 'https://placehold.co/400x400/9d0208/ffffff?text=Nike+LeBron+20',
  'Adidas Harden Vol. 7': 'https://placehold.co/400x400/ff006e/ffffff?text=Adidas+Harden+Vol+7',
  'Nike Metcon 8': 'https://placehold.co/400x400/3d5a80/ffffff?text=Nike+Metcon+8',
  'Reebok Nano X3': 'https://placehold.co/400x400/98c1d9/ffffff?text=Reebok+Nano+X3',
  'Birkenstock Arizona': 'https://placehold.co/400x400/d4a373/ffffff?text=Birkenstock+Arizona',
  'Teva Original Universal': 'https://placehold.co/400x400/588157/ffffff?text=Teva+Universal'
};

async function updateImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/shoe-store');
    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();
    
    let updated = 0;
    for (const product of products) {
      const realImage = realImages[product.name];
      if (realImage) {
        await db.collection('products').updateOne(
          { _id: product._id },
          { $set: { images: [realImage] } }
        );
        updated++;
        console.log('Updated:', product.name);
      }
    }
    
    console.log('\nUpdated ' + updated + ' products with real images');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateImages();
