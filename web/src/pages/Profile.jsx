import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, orderAPI } from '../services/api';
import { 
  User, 
  Settings, 
  ShoppingBag, 
  Package, 
  Truck, 
  Star, 
  Wallet, 
  Gift, 
  Tag,
  Store,
  Heart,
  Clock,
  ChevronRight,
  Camera,
  Lock,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  LogOut,
  CreditCard,
  Ticket,
  Bell,
  Shield
} from 'lucide-react';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [sellerData, setSellerData] = useState({ storeName: '', description: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [sellerLoading, setSellerLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Order counts
  const [orderCounts, setOrderCounts] = useState({
    total: 0,
    toPay: 0,
    toShip: 0,
    toReceive: 0,
    completed: 0,
    returns: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchOrderCounts();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderCounts = async () => {
    try {
      const response = await orderAPI.getOrders();
      if (response.data.success) {
        const orders = response.data.data;
        console.log('Profile - All orders:', orders);
        setOrderCounts({
          total: orders.length,
          toPay: orders.filter(o => o.orderStatus === 'to-pay').length,
          toShip: orders.filter(o => o.orderStatus === 'to-ship').length,
          toReceive: orders.filter(o => o.orderStatus === 'to-receive').length,
          completed: orders.filter(o => o.orderStatus === 'completed').length,
          returns: orders.filter(o => o.orderStatus === 'return').length
        });
        console.log('Profile - Order counts:', {
          total: orders.length,
          toPay: orders.filter(o => o.orderStatus === 'to-pay').length,
          toShip: orders.filter(o => o.orderStatus === 'to-ship').length,
          toReceive: orders.filter(o => o.orderStatus === 'to-receive').length,
          completed: orders.filter(o => o.orderStatus === 'completed').length,
          returns: orders.filter(o => o.orderStatus === 'return').length
        });
      }
    } catch (error) {
      console.error('Failed to fetch order counts:', error);
    }
  };

  const handleBecomeSeller = async (e) => {
    e.preventDefault();
    if (!sellerData.storeName.trim()) {
      alert('Store name is required');
      return;
    }
    
    setSellerLoading(true);
    try {
      const response = await authAPI.becomeSeller({
        storeName: sellerData.storeName.trim(),
        description: sellerData.description.trim(),
        phone: sellerData.phone.trim(),
      });
      alert(response.data.message);
      updateUser({ isSeller: true, sellerInfo: response.data.data.sellerInfo });
      setShowSellerModal(false);
      fetchProfile();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to become seller');
    } finally {
      setSellerLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }
    
    setPasswordLoading(true);
    try {
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      alert(response.data.message);
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await authAPI.deleteAccount();
      logout();
      navigate('/');
    } catch (error) {
      alert('Failed to delete account');
      setDeleteLoading(false);
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
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        {/* Top Navigation */}
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold">My Account</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="px-6 pb-8">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl font-bold text-blue-600 shadow-lg">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <button className="absolute -bottom-1 -right-1 bg-blue-500 p-2 rounded-lg shadow-md hover:bg-blue-400 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="ml-5 flex-1">
              <h2 className="text-2xl font-bold">{user?.fullName}</h2>
              <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
              <div className="flex items-center mt-3 space-x-4">
                <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                  <Shield className="w-4 h-4 mr-1 text-green-300" />
                  <span className="text-sm">Verified</span>
                </div>
                {user?.isSeller && (
                  <div className="flex items-center bg-white/10 px-3 py-1 rounded-full">
                    <Store className="w-4 h-4 mr-1 text-yellow-300" />
                    <span className="text-sm">Seller</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex mt-6 space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{orderCounts.total}</p>
              <p className="text-blue-200 text-sm">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-blue-200 text-sm">Wishlist</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-blue-200 text-sm">Reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Membership Card */}
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-lg">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <div className="ml-3">
                <p className="text-white font-bold">Premium Member</p>
                <p className="text-white/80 text-sm">Unlock exclusive benefits</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* My Orders */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 text-lg">My Orders</h3>
            <button 
              onClick={() => navigate('/orders')}
              className="flex items-center text-blue-600 text-sm font-medium"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-4">
            <button 
              onClick={() => navigate('/orders?tab=to-pay')}
              className="flex flex-col items-center group relative"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors relative">
                <CreditCard className="w-6 h-6 text-blue-600" />
                {orderCounts.toPay > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {orderCounts.toPay}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 mt-2">To Pay</span>
            </button>
            <button 
              onClick={() => navigate('/orders?tab=to-ship')}
              className="flex flex-col items-center group relative"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors relative">
                <Package className="w-6 h-6 text-indigo-600" />
                {orderCounts.toShip > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {orderCounts.toShip}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 mt-2">To Ship</span>
            </button>
            <button 
              onClick={() => navigate('/orders?tab=to-receive')}
              className="flex flex-col items-center group relative"
            >
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors relative">
                <Truck className="w-6 h-6 text-purple-600" />
                {orderCounts.toReceive > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {orderCounts.toReceive}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 mt-2">To Receive</span>
            </button>
            <button 
              onClick={() => navigate('/orders?tab=completed')}
              className="flex flex-col items-center group relative"
            >
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors relative">
                <Star className="w-6 h-6 text-green-600" />
                {orderCounts.completed > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {orderCounts.completed}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 mt-2">Completed</span>
            </button>
            <button 
              onClick={() => navigate('/orders?tab=return')}
              className="flex flex-col items-center group relative"
            >
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors relative">
                <ShoppingBag className="w-6 h-6 text-red-600" />
                {orderCounts.returns > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {orderCounts.returns}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-600 mt-2">Returns</span>
            </button>
          </div>
        </div>

        {/* Wallet & Rewards */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 text-lg mb-4">Wallet & Rewards</h3>
          <div className="grid grid-cols-3 gap-4">
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <Wallet className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">ShoePay</span>
              <span className="text-xs text-blue-600 font-semibold">$0.00</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <Gift className="w-8 h-8 text-amber-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">Points</span>
              <span className="text-xs text-amber-600 font-semibold">0 pts</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl">
              <Ticket className="w-8 h-8 text-rose-600 mb-2" />
              <span className="text-sm font-medium text-gray-800">Coupons</span>
              <span className="text-xs text-rose-600 font-semibold">0</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-4">
            <button className="flex flex-col items-center">
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-2 hover:bg-pink-100 transition-colors">
                <Heart className="w-7 h-7 text-pink-500" />
              </div>
              <span className="text-xs text-gray-600">Wishlist</span>
            </button>
            <button className="flex flex-col items-center">
              <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center mb-2 hover:bg-cyan-100 transition-colors">
                <Clock className="w-7 h-7 text-cyan-500" />
              </div>
              <span className="text-xs text-gray-600">History</span>
            </button>
            <button 
              className="flex flex-col items-center"
              onClick={() => user?.isSeller ? navigate('/seller') : setShowSellerModal(true)}
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-2 hover:bg-emerald-100 transition-colors">
                <Store className="w-7 h-7 text-emerald-500" />
              </div>
              <span className="text-xs text-gray-600">{user?.isSeller ? 'My Store' : 'Sell'}</span>
            </button>
            <button 
              className="flex flex-col items-center"
              onClick={() => setShowPasswordModal(true)}
            >
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-2 hover:bg-violet-100 transition-colors">
                <Lock className="w-7 h-7 text-violet-500" />
              </div>
              <span className="text-xs text-gray-600">Security</span>
            </button>
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-800 font-medium">Change Password</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <Tag className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-800 font-medium">My Coupons</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-red-600 font-medium">Delete Account</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </button>
        </div>

        {/* Logout Button */}
        <button 
          onClick={logout}
          className="w-full bg-white rounded-2xl shadow-sm py-4 flex items-center justify-center text-gray-600 font-medium hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </button>
      </div>

      {/* Seller Modal */}
      {showSellerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Become a Seller</h2>
                <p className="text-gray-500 text-sm mt-1">Start your own store today</p>
              </div>
              <button onClick={() => setShowSellerModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <span className="text-2xl text-gray-400">&times;</span>
              </button>
            </div>
            <form onSubmit={handleBecomeSeller} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
                <input
                  type="text"
                  value={sellerData.storeName}
                  onChange={(e) => setSellerData({ ...sellerData, storeName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your store name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={sellerData.description}
                  onChange={(e) => setSellerData({ ...sellerData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Describe your store..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  value={sellerData.phone}
                  onChange={(e) => setSellerData({ ...sellerData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <button
                type="submit"
                disabled={sellerLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-blue-500/30"
              >
                {sellerLoading ? 'Creating Store...' : 'Create My Store'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
                <p className="text-gray-500 text-sm mt-1">Keep your account secure</p>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <span className="text-2xl text-gray-400">&times;</span>
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-4 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-4 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-4 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-blue-500/30"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Delete Account?</h2>
            <p className="text-gray-500 text-center mb-6">
              This will permanently delete all your data. This action cannot be undone.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold disabled:opacity-50 shadow-lg shadow-red-500/30"
              >
                {deleteLoading ? 'Deleting...' : 'Delete My Account'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Keep My Account
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Profile;
