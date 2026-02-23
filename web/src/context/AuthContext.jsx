import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Check for stored token and user on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Verify token is still valid
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { data } = response.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      
      toast.success('Login successful!');
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const faceLogin = async (faceDescriptor) => {
    try {
      const response = await authAPI.faceLogin({ faceDescriptor });
      const { data } = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);

      toast.success('Face login successful!');
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Face recognition failed';
      
      // Check if the error is about unregistered users or no users with face recognition
      const isUnregisteredError = message.toLowerCase().includes('not registered') || 
                                   message.toLowerCase().includes('some users have not registered') ||
                                   message.toLowerCase().includes('no users with face recognition');
      
      if (isUnregisteredError) {
        toast.error(message);
        return { success: false, error: message, redirect: 'register' };
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const response = await authAPI.register({ fullName, email, password });
      const { data } = response.data;
      
      // Store token and user but mark as "registering" until face is set up
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setIsRegistering(true); // Mark that we're in the middle of registration
      
      toast.success('Registration successful! Please set up face recognition.');
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const registerFace = async (faceDescriptor) => {
    try {
      await authAPI.registerFace({ faceDescriptor });
      
      // Update user with face registered status
      const updatedUser = { ...user, hasFaceRegistered: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsRegistering(false); // Registration complete
      
      toast.success('Face registered successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Face registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isRegistering,
    login,
    faceLogin,
    register,
    registerFace,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
