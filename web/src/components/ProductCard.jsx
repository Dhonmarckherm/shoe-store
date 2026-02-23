import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedSize) {
      toast.warning('Please select a size');
      return;
    }

    const sizeInfo = product.sizes.find(s => s.size === selectedSize);
    if (!sizeInfo || sizeInfo.stock === 0) {
      toast.error('Selected size is out of stock');
      return;
    }

    await addToCart(product._id, 1, selectedSize);
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.info('Please sign in to buy');
      navigate('/login');
      return;
    }
    
    if (!selectedSize) {
      toast.warning('Please select a size');
      return;
    }

    const sizeInfo = product.sizes.find(s => s.size === selectedSize);
    if (!sizeInfo || sizeInfo.stock === 0) {
      toast.error('Selected size is out of stock');
      return;
    }

    // Add to cart first
    await addToCart(product._id, 1, selectedSize);
    // Then navigate to checkout with buy now item
    navigate('/checkout', { 
      state: { 
        buyNowItem: {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          size: selectedSize,
          image: product.images[0],
          variant: `${product.colors?.[0] || ''} / Size ${selectedSize}`
        }
      }
    });
  };

  const availableSizes = product.sizes.filter(s => s.stock > 0);

  return (
    <div 
      className="group card hover:shadow-soft-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link to={`/products/${product._id}`} className="block relative aspect-square overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        
        {/* Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={handleAddToCart}
            className="p-3 bg-white rounded-full hover:bg-primary-600 hover:text-white transition-colors"
            title="Add to cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button
            className="p-3 bg-white rounded-full hover:bg-red-500 hover:text-white transition-colors"
            title="Add to wishlist"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Badge */}
        {product.rating >= 4.5 && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded">
            Top Rated
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-1">
          {product.brand}
        </div>
        
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-2 line-clamp-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
            {product.rating}
          </span>
          <span className="text-sm text-secondary-500 dark:text-secondary-400">
            ({product.numReviews})
          </span>
        </div>

        {/* Size Selection */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {availableSizes.slice(0, 4).map((sizeInfo) => (
              <button
                key={sizeInfo.size}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedSize(sizeInfo.size);
                }}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  selectedSize === sizeInfo.size
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-secondary-700 border-secondary-300 dark:border-secondary-600 hover:border-primary-400'
                }`}
              >
                {sizeInfo.size}
              </button>
            ))}
            {availableSizes.length > 4 && (
              <span className="px-2 py-1 text-xs text-secondary-500">+{availableSizes.length - 4}</span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-secondary-900 dark:text-secondary-100">
            ₱{(product.price * 56).toLocaleString()}
          </span>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-4 h-4 inline mr-1" />
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!selectedSize}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Zap className="w-4 h-4 inline mr-1" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
