const https = require('https');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Real shoe images from Wikimedia Commons (public domain or CC licensed)
const shoeImages = {
  'Nike Air Max 270': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Nike_Air_Max_90_Premium_%28white%29.jpg/640px-Nike_Air_Max_90_Premium_%28white%29.jpg',
  'Adidas Ultraboost 22': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Ultra_Boost_4.0_%28white%29.jpg/640px-Adidas_Ultra_Boost_4.0_%28white%29.jpg',
  'Puma RS-X3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Puma_sneakers.jpg/640px-Puma_sneakers.jpg',
  'New Balance 574': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/New_Balance_574_sneakers.jpg/640px-New_Balance_574_sneakers.jpg',
  'Converse Chuck Taylor All Star': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Converse_Chuck_Taylor_All-Stars_%28white%29.jpg/640px-Converse_Chuck_Taylor_All-Stars_%28white%29.jpg',
  'Vans Old Skool': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Vans_Old_Skool_sneakers.jpg/640px-Vans_Old_Skool_sneakers.jpg',
  'Nike Zoom Fly 5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Nike_Air_Max_90_Premium_%28white%29.jpg/640px-Nike_Air_Max_90_Premium_%28white%29.jpg',
  'Asics Gel-Kayano 29': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/ASICS_running_shoes.jpg/640px-ASICS_running_shoes.jpg',
  'Brooks Ghost 15': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Nike_Air_Max_90_Premium_%28white%29.jpg/640px-Nike_Air_Max_90_Premium_%28white%29.jpg',
  'Crocs Classic Clog': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Crocs_shoes.jpg/640px-Crocs_shoes.jpg',
  'Sperry Authentic Original': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Boat_shoes.jpg/640px-Boat_shoes.jpg',
  'Toms Alpargata': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Espadrilles.jpg/640px-Espadrilles.jpg',
  'Nike Air Force 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Nike_Air_Force_1_%28white%29.jpg/640px-Nike_Air_Force_1_%28white%29.jpg',
  'Adidas Forum Low': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Ultra_Boost_4.0_%28white%29.jpg/640px-Adidas_Ultra_Boost_4.0_%28white%29.jpg',
  'Reebok Club C 85': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Reebok_sneakers.jpg/640px-Reebok_sneakers.jpg',
  'Timberland Premium 6-Inch': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Timberland_boots.jpg/640px-Timberland_boots.jpg',
  'Dr. Martens 1460': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Dr._Martens_1460_boots.jpg/640px-Dr._Martens_1460_boots.jpg',
  'Caterpillar Second Shift': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Timberland_boots.jpg/640px-Timberland_boots.jpg',
  'Clarks Tilden Cap': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Dress_shoes.jpg/640px-Dress_shoes.jpg',
  'Cole Haan Original Grand': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Dress_shoes.jpg/640px-Dress_shoes.jpg',
  'Nike LeBron 20': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Nike_Air_Max_90_Premium_%28white%29.jpg/640px-Nike_Air_Max_90_Premium_%28white%29.jpg',
  'Adidas Harden Vol. 7': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Ultra_Boost_4.0_%28white%29.jpg/640px-Adidas_Ultra_Boost_4.0_%28white%29.jpg',
  'Nike Metcon 8': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Nike_Air_Max_90_Premium_%28white%29.jpg/640px-Nike_Air_Max_90_Premium_%28white%29.jpg',
  'Reebok Nano X3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Reebok_sneakers.jpg/640px-Reebok_sneakers.jpg',
  'Birkenstock Arizona': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Birkenstock_sandals.jpg/640px-Birkenstock_sandals.jpg',
  'Teva Original Universal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Sport_sandals.jpg/640px-Sport_sandals.jpg'
};

// Fallback to generic shoe images by category
const categoryImages = {
  'running': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Nike_Air_Max_90_Premium_%28white%29.jpg/640px-Nike_Air_Max_90_Premium_%28white%29.jpg',
  'casual': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Converse_Chuck_Taylor_All-Stars_%28white%29.jpg/640px-Converse_Chuck_Taylor_All-Stars_%28white%29.jpg',
  'sneakers': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Nike_Air_Force_1_%28white%29.jpg/640px-Nike_Air_Force_1_%28white%29.jpg',
  'boots': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Timberland_boots.jpg/640px-Timberland_boots.jpg',
  'formal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Dress_shoes.jpg/640px-Dress_shoes.jpg',
  'sports': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Nike_Air_Max_90_Premium_%28white%29.jpg/640px-Nike_Air_Max_90_Premium_%28white%29.jpg',
  'training': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Reebok_sneakers.jpg/640px-Reebok_sneakers.jpg',
  'sandals': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Birkenstock_sandals.jpg/640px-Birkenstock_sandals.jpg'
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function downloadAndUpdateImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/shoe-store');
    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();
    
    const imagesDir = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    let updated = 0;
    for (const product of products) {
      const imageName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.jpg';
      const imagePath = path.join(imagesDir, imageName);
      const imageUrl = shoeImages[product.name] || categoryImages[product.category] || categoryImages['sneakers'];
      
      try {
        // Download image
        await downloadImage(imageUrl, imagePath);
        console.log(`Downloaded: ${product.name}`);
        
        // Update database with local image path
        const localImageUrl = `/images/${imageName}`;
        await db.collection('products').updateOne(
          { _id: product._id },
          { $set: { images: [localImageUrl] } }
        );
        updated++;
      } catch (err) {
        console.error(`Failed to download ${product.name}:`, err.message);
      }
    }
    
    console.log(`\nUpdated ${updated} products with local images`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

downloadAndUpdateImages();
