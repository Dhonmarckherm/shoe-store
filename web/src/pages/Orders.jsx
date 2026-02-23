import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  CreditCard, 
  Package, 
  Truck, 
  CheckCircle, 
  RotateCcw, 
  XCircle,
  ChevronRight,
  Search,
  ShoppingBag,
  Store,
  MessageSquare,
  Phone
} from 'lucide-react';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Order status tabs
  const tabs = [
    { id: 'all', label: 'All', icon: ShoppingBag },
    { id: 'to-pay', label: 'To Pay', icon: CreditCard },
    { id: 'to-ship', label: 'To Ship', icon: Package },
    { id: 'to-receive', label: 'To Receive', icon: Truck },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
    { id: 'return', label: 'Return/Refund', icon: RotateCcw },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle },
  ];

  // Exchange rate: 1 USD = 56 PHP
  const exchangeRate = 56;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate, activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching orders with tab:', activeTab);
      const response = await orderAPI.getOrders(activeTab === 'all' ? '' : activeTab);
      console.log('Orders response:', response.data);
      if (response.data.success) {
        // Transform orders to match the component's expected format
        const transformedOrders = response.data.data.map(order => ({
          id: order.orderId,
          _id: order._id,
          status: order.orderStatus,
          date: new Date(order.createdAt).toISOString().split('T')[0],
          store: { 
            name: order.items[0]?.name?.split(' ')[0] + ' Store' || 'Shoe Store', 
            avatar: order.items[0]?.image || 'https://via.placeholder.com/40' 
          },
          items: order.items.map(item => ({
            name: item.name,
            image: item.image,
            price: item.price, // Keep in USD, convert on display
            qty: item.quantity,
            variant: item.variant || `${item.size}`
          })),
          total: order.total, // Keep in USD, convert on display
          shipping: order.shipping,
          discount: order.discount,
          cancelReason: order.cancelReason,
          returnReason: order.returnReason
        }));
        console.log('Transformed orders:', transformedOrders);
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'to-pay': 'bg-amber-100 text-amber-700',
      'to-ship': 'bg-blue-100 text-blue-700',
      'to-receive': 'bg-purple-100 text-purple-700',
      'completed': 'bg-green-100 text-green-700',
      'return': 'bg-orange-100 text-orange-700',
      'cancelled': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'to-pay': 'Waiting for Payment',
      'to-ship': 'To Ship',
      'to-receive': 'To Receive',
      'completed': 'Completed',
      'return': 'Return/Refund',
      'cancelled': 'Cancelled',
    };
    return labels[status] || status;
  };

  const handlePayNow = async (orderId) => {
    try {
      console.log('Paying for order:', orderId);
      const response = await orderAPI.payOrder(orderId);
      console.log('Pay response:', response.data);
      toast.success('Payment successful!');
      fetchOrders();
    } catch (error) {
      console.error('Pay order error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Payment failed');
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Please enter cancellation reason:');
    if (!reason) return;
    
    try {
      console.log('Cancelling order:', orderId);
      const response = await orderAPI.updateOrderStatus(orderId, { status: 'cancelled', reason });
      console.log('Cancel response:', response.data);
      toast.success('Order cancelled');
      fetchOrders();
    } catch (error) {
      console.error('Cancel order error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleConfirmReceived = async (orderId) => {
    try {
      console.log('Confirming received order:', orderId);
      const response = await orderAPI.updateOrderStatus(orderId, { status: 'completed' });
      console.log('Confirm received response:', response.data);
      toast.success('Order confirmed as received!');
      fetchOrders();
    } catch (error) {
      console.error('Confirm received order error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to confirm order');
    }
  };

  const handleReturnOrder = async (orderId) => {
    const reason = prompt('Please enter return reason:');
    if (!reason) return;
    
    try {
      console.log('Returning order:', orderId);
      const response = await orderAPI.updateOrderStatus(orderId, { status: 'return', reason });
      console.log('Return response:', response.data);
      toast.success('Return request submitted');
      fetchOrders();
    } catch (error) {
      console.error('Return order error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    }
  };

  const getActionButton = (status, orderId) => {
    switch (status) {
      case 'to-pay':
        return (
          <div className="flex space-x-2">
            <button 
              onClick={() => handlePayNow(orderId)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-medium text-sm"
            >
              Pay Now
            </button>
            <button 
              onClick={() => handleCancelOrder(orderId)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        );
      case 'to-ship':
        return (
          <div className="flex space-x-2">
            <button className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl font-medium text-sm">
              Contact Seller
            </button>
            <button 
              onClick={() => handleCancelOrder(orderId)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        );
      case 'to-receive':
        return (
          <div className="flex space-x-2">
            <button 
              onClick={() => handleConfirmReceived(orderId)}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 rounded-xl font-medium text-sm"
            >
              Confirm Received
            </button>
            <button className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 text-sm font-medium">
              Track Order
            </button>
          </div>
        );
      case 'completed':
        return (
          <div className="flex space-x-2">
            <button className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl font-medium text-sm">
              Buy Again
            </button>
            <button 
              onClick={() => handleReturnOrder(orderId)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 text-sm font-medium"
            >
              Return/Refund
            </button>
          </div>
        );
      case 'return':
        return (
          <div className="flex space-x-2">
            <button className="flex-1 bg-orange-50 text-orange-600 py-2.5 rounded-xl font-medium text-sm">
              View Return Status
            </button>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex space-x-2">
            <button className="flex-1 bg-blue-50 text-blue-600 py-2.5 rounded-xl font-medium text-sm">
              Buy Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MessageSquare className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID or product name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide px-2 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center min-w-[70px] px-3 py-2 mx-1 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="px-4 pt-4 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery ? 'Try a different search term' : 'Start shopping to see your orders here'}
            </p>
            <button 
              onClick={() => navigate('/products')}
              className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Store className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-800">{order.store.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-1" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              {/* Order Items */}
              <div className="px-4 py-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start mb-4 last:mb-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl bg-gray-100"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium text-gray-800 line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.variant}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-sm">x{item.qty}</span>
                        <span className="font-semibold text-gray-800">₱{(item.price * exchangeRate).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Order ID: {order.id}</span>
                  <span className="text-sm text-gray-500">{order.date}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    {order.discount > 0 && (
                      <span className="text-green-600 ml-2">Saved ₱{(order.discount * exchangeRate).toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Total:</span>
                    <span className="text-lg font-bold text-gray-800">₱{(order.total * exchangeRate).toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                {getActionButton(order.status, order.id)}
              </div>

              {/* Return/Cancel Reason */}
              {(order.returnReason || order.cancelReason) && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                  <p className="text-sm text-red-600">
                    <span className="font-medium">Reason:</span> {order.returnReason || order.cancelReason}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Orders;
