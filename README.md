# AI-Powered Shoe Store Application

A full-stack e-commerce application for shoes with web and mobile platforms, featuring face recognition authentication and AI-powered recommendations.

## Features

- **User Authentication**: Email/password login and face recognition authentication
- **Product Browsing**: Browse shoes by category, search products, view details
- **Shopping Cart**: Add items, update quantities, remove items
- **AI Recommendations**: Personalized product recommendations based on browsing history
- **Responsive Design**: Mobile-first approach with dark mode support
- **Secure**: JWT authentication, encrypted face data, password hashing

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt for password hashing
- AES-256 encryption for face data
- Express Validator for input validation

### Web Frontend
- React.js + Vite
- Tailwind CSS
- React Router
- Axios
- face-api.js for face recognition
- React Toastify for notifications

### Mobile App
- React Native + Expo
- React Navigation
- Expo Camera & Face Detector
- Axios

## Project Structure

```
shoe-store/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth & validation middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic & AI
│   │   └── utils/          # Helper functions
│   ├── package.json
│   └── server.js
├── web/                    # React.js web app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # React context providers
│   │   └── services/       # API services
│   ├── package.json
│   └── vite.config.js
└── mobile/                 # React Native app
    ├── src/
    │   ├── screens/        # App screens
    │   ├── navigation/     # Navigation setup
    │   ├── context/        # Context providers
    │   └── services/       # API services
    ├── package.json
    └── App.js
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd shoe-store/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shoe-store
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h
ENCRYPTION_KEY=your-32-char-encryption-key
NODE_ENV=development
```

4. Seed the database with sample products:
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Web Frontend Setup

1. Navigate to the web directory:
```bash
cd shoe-store/web
```

2. Install dependencies:
```bash
npm install
```

3. Download face-api.js models:
Create a `public/models` folder and download the required models from [face-api.js models](https://github.com/justadudewhohacks/face-api.js/tree/master/weights):
- tiny_face_detector_model-weights_manifest.json
- tiny_face_detector_model-shard1
- face_landmark_68_model-weights_manifest.json
- face_landmark_68_model-shard1
- face_recognition_model-weights_manifest.json
- face_recognition_model-shard1 (and shard2)

4. Start the development server:
```bash
npm run dev
```

The web app will run on `http://localhost:5173`

### Mobile App Setup

1. Navigate to the mobile directory:
```bash
cd shoe-store/mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update the API URL in `src/services/api.js`:
```javascript
const API_URL = 'http://YOUR_BACKEND_IP:5000/api';
```

4. Start the Expo development server:
```bash
npx expo start
```

5. Scan the QR code with the Expo Go app on your mobile device, or press `i` for iOS simulator / `a` for Android emulator.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/face-login` - Login with face recognition
- `POST /api/auth/face-register` - Register face for user
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get product categories

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations
- `GET /api/recommendations/similar/:productId` - Get similar products

## Security Features

- **Password Hashing**: bcrypt with salt rounds 10
- **JWT Authentication**: Secure tokens with 24h expiry
- **Face Data Encryption**: AES-256 encryption for facial descriptors
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Express Validator for all inputs
- **CORS**: Configured for specific origins
- **Helmet**: Security headers

## AI Recommendation Algorithm

The recommendation engine uses a hybrid approach:

1. **Content-Based Filtering**: Analyzes user's browsing history to recommend products from preferred categories
2. **Collaborative Filtering**: Suggests products based on similar user behavior
3. **Popularity Fallback**: Shows trending products when no history exists

## Face Recognition

The application uses face-api.js (web) and Expo Face Detector (mobile) for face recognition:

- **Registration**: Captures and encrypts 128-dimensional face descriptors
- **Login**: Compares captured face with stored descriptors using Euclidean distance
- **Threshold**: 0.6 distance threshold for face matching

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT signing |
| JWT_EXPIRE | JWT token expiry time |
| ENCRYPTION_KEY | 32-character key for face data encryption |
| NODE_ENV | Environment (development/production) |

### Web
| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API URL |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on the GitHub repository.
