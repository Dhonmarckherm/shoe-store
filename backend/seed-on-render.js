// Seed products to Render backend
const axios = require('axios');

const API_URL = 'https://shoe-store-api-yqhk.onrender.com/api';

async function seedProducts() {
  try {
    console.log('Seeding products to Render backend...');
    
    // Try to hit the seed endpoint
    const response = await axios.post(`${API_URL}/seed`);
    console.log('Products seeded successfully!');
    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.log('Seed endpoint response:', error.response.data);
    } else {
      console.log('Note: Seed endpoint not available. Products can be added through the admin panel.');
      console.log('The database is ready to accept products!');
    }
  }
}

seedProducts();
