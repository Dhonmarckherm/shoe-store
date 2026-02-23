import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronLeft,
  Minus,
  Plus
} from 'lucide-react';
import { productAPI, recommendationAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const [productRes, similarRes] = await Promise.all([
        productAPI.getProduct(id),
        recommendationAPI.getSimilarProducts(id),
      ]);
      
      setProduct(productRes.data.data);
      setSimilarProducts(similarRes.data.data);
      
      // Set default selections
      if (productRes.data.data.colors?.length > 0) {
        setSelectedColor(productRes.data.data.colors[0]);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.warning('Please select a size');
      return;
    }

    const sizeInfo = product.sizes.find(s => s.size === selectedSize);
    if (!sizeInfo || sizeInfo.stock === 0) {
      toast.error('Selected size is out of stock');
      return;
    }

    if (quantity > sizeInfo.stock) {
      toast.error(`Only ${sizeInfo.stock} items available`);
      return;
    }

    await addToCart(product._id, quantity, selectedSize, selectedColor);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
            Product Not Found
          </h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700">
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  const availableSizes = product.sizes.filter(s => s.stock > 0);

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link 
          to="/products" 
          className="inline-flex items-center text-secondary-600 dark:text-secondary-400 hover:text-primary-600 mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white dark:bg-secondary-800">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === index 
                        ? 'border-primary-600' 
                        : 'border-transparent hover:border-secondary-300'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="text-sm text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-2">
              {product.brand}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-secondary-900 dark:text-secondary-100">
                  {product.rating}
                </span>
              </div>
              <span className="text-secondary-500 dark:text-secondary-400">
                {product.numReviews} reviews
              </span>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-primary-600 mb-6">
              ${product.price.toFixed(2)}
            </div>

            {/* Description */}
            <p className="text-secondary-600 dark:text-secondary-400 mb-8">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-secondary-900 dark:text-secondary-100 mb-3">
                  Color: <span className="text-secondary-600 dark:text-secondary-400">{selectedColor}</span>
                </h3>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedColor === color
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                          : 'border-secondary-300 dark:border-secondary-600 hover:border-primary-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            <div className="mb-6">
              <h3 className="font-medium text-secondary-900 dark:text-secondary-100 mb-3">
                Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sizeInfo) => (
                  <button
                    key={sizeInfo.size}
                    onClick={() => setSelectedSize(sizeInfo.size)}
                    disabled={sizeInfo.stock === 0}
                    className={`w-14 h-14 rounded-lg border font-medium transition-colors ${
                      selectedSize === sizeInfo.size
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : sizeInfo.stock === 0
                        ? 'border-secondary-200 text-secondary-400 cursor-not-allowed line-through'
                        : 'border-secondary-300 dark:border-secondary-600 hover:border-primary-400'
                    }`}
                  >
                    {sizeInfo.size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="font-medium text-secondary-900 dark:text-secondary-100 mb-3">
                Quantity
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-secondary-300 dark:border-secondary-600 flex items-center justify-center hover:bg-secondary-100 dark:hover:bg-secondary-800"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-secondary-300 dark:border-secondary-600 flex items-center justify-center hover:bg-secondary-100 dark:hover:bg-secondary-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-5 h-5 mr-2" />
                Wishlist
              </Button>
              <Button variant="ghost" size="lg">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-secondary-200 dark:border-secondary-700">
              <div className="flex flex-col items-center text-center">
                <Truck className="w-6 h-6 text-primary-600 mb-2" />
                <span className="text-sm text-secondary-600 dark:text-secondary-400">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="w-6 h-6 text-primary-600 mb-2" />
                <span className="text-sm text-secondary-600 dark:text-secondary-400">2 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="w-6 h-6 text-primary-600 mb-2" />
                <span className="text-sm text-secondary-600 dark:text-secondary-400">30 Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
