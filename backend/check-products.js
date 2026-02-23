const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const MONGODB_URI = 'mongodb+srv://dhonmarck2004_db_user:EZC8I5hN27VsvoJq@cluster1.p6sn0sb.mongodb.net/shoe-store?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI).then(async () => {
  const products = await Product.find().select('name price');
  console.log('Total products:', products.length);
  console.log('\nProducts:');
  products.forEach((p, i) => console.log(`${i+1}. ${p.name} - $${p.price}`));
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
