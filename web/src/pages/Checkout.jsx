import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  MapPin, 
  CreditCard, 
  Wallet, 
  Truck, 
  ChevronRight,
  Check,
  Plus,
  Edit2,
  Phone,
  User,
  Home,
  Building2,
  Landmark
} from 'lucide-react';

const Checkout = () => {
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get items from location state (buy now) or cart
  const buyNowItem = location.state?.buyNowItem;
  // Cart is an object with items array, not an array directly
  const cartItems = cart?.items || [];
  const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;
  
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirm
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Address state
  const [address, setAddress] = useState({
    fullName: user?.fullName || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Philippines',
    label: 'Home', // Home, Work, Other
  });
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'ewallet'
  const [selectedEWallet, setSelectedEWallet] = useState('');
  
  // E-wallet options (Philippines focused)
  const eWallets = [
    { id: 'gcash', name: 'GCash', color: 'bg-blue-500', icon: 'G' },
    { id: 'paymaya', name: 'PayMaya', color: 'bg-green-500', icon: 'P' },
    { id: 'grabpay', name: 'GrabPay', color: 'bg-green-600', icon: 'GP' },
    { id: 'shopeepay', name: 'ShopeePay', color: 'bg-orange-500', icon: 'SP' },
    { id: 'coins', name: 'Coins.ph', color: 'bg-yellow-500', icon: 'C' },
  ];
  
  // Calculate totals (convert to PHP - 1 USD = 56 PHP)
  const exchangeRate = 56;
  const subtotal = checkoutItems.reduce((sum, item) => sum + ((item.price || item.productId?.price || 0) * (item.quantity || 1)), 0) * exchangeRate;
  const shipping = subtotal > 28000 ? 0 : 2800; // Free shipping over ₱28,000 (approx $500)
  const discount = 0; // Apply voucher discount here
  const total = subtotal + shipping - discount;
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);
  
  // Separate effect for cart check to avoid redirect loop
  useEffect(() => {
    if (!buyNowItem && cartItems.length === 0 && !loading) {
      navigate('/cart');
    }
  }, [buyNowItem, cartItems.length, navigate, loading]);
  
  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      // Prepare order data
      const orderData = {
        items: checkoutItems.map(item => ({
          productId: item.productId?._id || item.productId,
          name: item.productId?.name || item.name,
          image: item.productId?.images?.[0] || item.image,
          price: item.productId?.price || item.price,
          quantity: item.quantity,
          size: item.size,
          variant: item.variant || `${item.productId?.colors?.[0] || ''} / Size ${item.size}`
        })),
        shippingAddress: address,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : selectedEWallet,
        subtotal: subtotal / exchangeRate, // Store in USD
        shipping: shipping / exchangeRate,
        discount: discount / exchangeRate,
        total: total / exchangeRate
      };

      // Create order via API
      const response = await orderAPI.createOrder(orderData);
      
      if (response.data.success) {
        // Clear cart if not buy now
        if (!buyNowItem) {
          clearCart();
        }
        
        setOrderPlaced(true);
        toast.success('Order placed successfully!');
      }
    } catch (error) {
      console.error('Place order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const isAddressValid = () => {
    return address.fullName && address.phone && address.street && address.city && address.state;
  };
  
  const isPaymentValid = () => {
    if (paymentMethod === 'cod') return true;
    return paymentMethod === 'ewallet' && selectedEWallet;
  };
  
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-6">
            Your order has been placed successfully. You will receive a confirmation email shortly.
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-500">Order Total</p>
            <p className="text-2xl font-bold text-gray-800">₱{total.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">
              Payment: {paymentMethod === 'cod' ? 'Cash on Delivery' : eWallets.find(w => w.id === selectedEWallet)?.name}
            </p>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/orders')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold"
            >
              View My Orders
            </button>
            <button 
              onClick={() => navigate('/products')}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center px-4 py-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 ml-2">Checkout</h1>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center px-8 pb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <span className={`ml-2 text-sm ${step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Address</span>
          </div>
          <div className={`w-12 h-0.5 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <span className={`ml-2 text-sm ${step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Payment</span>
          </div>
          <div className={`w-12 h-0.5 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
            <span className={`ml-2 text-sm ${step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>Confirm</span>
          </div>
        </div>
      </div>
      
      <div className="px-4 pt-4 space-y-4">
        {/* Step 1: Delivery Address */}
        {step === 1 && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Delivery Address</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={address.fullName}
                      onChange={(e) => setAddress({...address, fullName: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({...address, phone: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="House/Building number, Street name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({...address, state: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="State"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={address.zipCode}
                      onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="ZIP Code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={address.country}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address Label</label>
                  <div className="flex space-x-3">
                    {['Home', 'Work', 'Other'].map((label) => (
                      <button
                        key={label}
                        onClick={() => setAddress({...address, label})}
                        className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                          address.label === label
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setStep(2)}
              disabled={!isAddressValid()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-blue-500/30"
            >
              Continue to Payment
            </button>
          </>
        )}
        
        {/* Step 2: Payment Method */}
        {step === 2 && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">Payment Method</h2>
              </div>
              
              {/* COD Option */}
              <button
                onClick={() => { setPaymentMethod('cod'); setSelectedEWallet(''); }}
                className={`w-full flex items-center p-4 rounded-xl border-2 mb-3 transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">Cash on Delivery (COD)</p>
                  <p className="text-sm text-gray-500">Pay when you receive your order</p>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
              
              {/* E-Wallet Option */}
              <button
                onClick={() => setPaymentMethod('ewallet')}
                className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'ewallet'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                  <Wallet className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">E-Wallet</p>
                  <p className="text-sm text-gray-500">Pay with GCash, PayMaya, and more</p>
                </div>
                {paymentMethod === 'ewallet' && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
              
              {/* E-Wallet Selection */}
              {paymentMethod === 'ewallet' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-3">Select E-Wallet Platform</p>
                  <div className="grid grid-cols-3 gap-3">
                    {eWallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={() => setSelectedEWallet(wallet.id)}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                          selectedEWallet === wallet.id
                            ? 'border-blue-600 bg-white shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-10 h-10 ${wallet.color} rounded-lg flex items-center justify-center text-white font-bold text-sm mb-2`}>
                          {wallet.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{wallet.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!isPaymentValid()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-blue-500/30"
              >
                Review Order
              </button>
            </div>
          </>
        )}
        
        {/* Step 3: Order Summary */}
        {step === 3 && (
          <>
            {/* Delivery Address Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Delivery Address</h2>
                </div>
                <button onClick={() => setStep(1)} className="text-blue-600 text-sm font-medium">
                  Edit
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded">
                    {address.label}
                  </span>
                </div>
                <p className="font-semibold text-gray-800">{address.fullName}</p>
                <p className="text-gray-600 text-sm mt-1">{address.phone}</p>
                <p className="text-gray-600 text-sm mt-1">
                  {address.street}, {address.city}, {address.state} {address.zipCode}
                </p>
              </div>
            </div>
            
            {/* Payment Method Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Payment Method</h2>
                </div>
                <button onClick={() => setStep(2)} className="text-blue-600 text-sm font-medium">
                  Edit
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center">
                {paymentMethod === 'cod' ? (
                  <>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive</p>
                    </div>
                  </>
                ) : (
                  <>
                    {selectedEWallet && (
                      <>
                        <div className={`w-10 h-10 ${eWallets.find(w => w.id === selectedEWallet)?.color} rounded-lg flex items-center justify-center mr-3`}>
                          <span className="text-white font-bold text-xs">
                            {eWallets.find(w => w.id === selectedEWallet)?.icon}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {eWallets.find(w => w.id === selectedEWallet)?.name}
                          </p>
                          <p className="text-sm text-gray-500">E-Wallet Payment</p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items ({checkoutItems.length})</h2>
              <div className="space-y-4">
                {checkoutItems.map((item, index) => {
                  const itemName = item.productId?.name || item.name;
                  const itemImage = item.productId?.images?.[0] || item.image;
                  const itemPrice = item.productId?.price || item.price || 0;
                  const itemVariant = item.variant || `${item.productId?.colors?.[0] || ''} / Size ${item.size}`;
                  return (
                    <div key={index} className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <img 
                        src={itemImage || 'https://via.placeholder.com/80'}
                        alt={itemName}
                        className="w-20 h-20 object-cover rounded-xl bg-gray-100"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-800 line-clamp-2">{itemName}</h3>
                        {itemVariant && (
                          <p className="text-sm text-gray-500 mt-1">{itemVariant}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                          <span className="font-semibold text-gray-800">₱{((itemPrice * item.quantity) * 56).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Price Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : 'text-gray-800'}>
                    {shipping === 0 ? 'FREE' : `₱${shipping.toLocaleString()}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-₱{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-blue-600">₱{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold"
              >
                Back
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-blue-500/30"
              >
                {loading ? 'Placing Order...' : `Place Order (₱${total.toLocaleString()})`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;
