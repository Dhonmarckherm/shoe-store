import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight,
  Truck,
  Shield
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemove = async (itemId) => {
    await removeFromCart(itemId);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to proceed with checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  // Convert to PHP (1 USD = 56 PHP)
  const exchangeRate = 56;
  const shippingCost = cart.totalAmount > 100 ? 0 : 15;
  const tax = cart.totalAmount * 0.08;
  const totalUSD = cart.totalAmount + shippingCost + tax;
  const totalPHP = totalUSD * exchangeRate;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-secondary-400" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/products">
            <Button size="lg">
              Start Shopping
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-8">
          Shopping Cart ({cart.totalItems} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div 
                key={item._id} 
                className="card p-4 sm:p-6 flex flex-col sm:flex-row gap-4"
              >
                {/* Product Image */}
                <Link 
                  to={`/products/${item.productId?._id || item.productId}`}
                  className="w-full sm:w-32 h-32 flex-shrink-0"
                >
                  <img
                    src={item.productId?.images?.[0] || 'https://via.placeholder.com/150'}
                    alt={item.productId?.name || 'Product'}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1">
                  <Link 
                    to={`/products/${item.productId?._id || item.productId}`}
                    className="font-semibold text-secondary-900 dark:text-secondary-100 hover:text-primary-600 transition-colors"
                  >
                    {item.productId?.name || 'Product'}
                  </Link>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                    {item.productId?.brand}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 text-sm text-secondary-600 dark:text-secondary-400">
                    <span>Size: {item.size}</span>
                    {item.color && <span>Color: {item.color}</span>}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        disabled={loading || item.quantity <= 1}
                        className="w-8 h-8 rounded-lg border border-secondary-300 dark:border-secondary-600 flex items-center justify-center hover:bg-secondary-100 dark:hover:bg-secondary-700 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        disabled={loading}
                        className="w-8 h-8 rounded-lg border border-secondary-300 dark:border-secondary-600 flex items-center justify-center hover:bg-secondary-100 dark:hover:bg-secondary-700 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price and Remove */}
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-secondary-900 dark:text-secondary-100">
                        ₱{(((item.productId?.price || 0) * item.quantity) * 56).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleRemove(item._id)}
                        disabled={loading}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
                Order Summary
              </h2>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 rounded-lg border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-sm"
                  />
                  <Button variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-secondary-600 dark:text-secondary-400">
                  <span>Subtotal</span>
                  <span>₱{(cart.totalAmount * 56).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-secondary-600 dark:text-secondary-400">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `₱${(shippingCost * 56).toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-secondary-600 dark:text-secondary-400">
                  <span>Tax (8%)</span>
                  <span>₱{(tax * 56).toLocaleString()}</span>
                </div>
                {shippingCost === 0 && (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    You got free shipping!
                  </div>
                )}
                <div className="border-t border-secondary-200 dark:border-secondary-700 pt-3">
                  <div className="flex justify-between text-lg font-bold text-secondary-900 dark:text-secondary-100">
                    <span>Total</span>
                    <span>₱{totalPHP.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                className="w-full mb-4"
                onClick={handleCheckout}
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400">
                  <Truck className="w-4 h-4" />
                  <span>Free shipping over $100</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400">
                  <Shield className="w-4 h-4" />
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
