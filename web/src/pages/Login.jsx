import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ScanFace, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import FaceRecognition from '../components/FaceRecognition';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const { login, faceLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleFaceDetected = async (faceDescriptor) => {
    setIsLoading(true);
    setAlert(null);

    // Validate face descriptor before sending
    if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      setAlert({ 
        type: 'error', 
        message: 'Invalid face data. Please try again and ensure your face is clearly visible.' 
      });
      setIsLoading(false);
      return;
    }

    console.log('Attempting face login with descriptor length:', faceDescriptor.length);

    const result = await faceLogin(faceDescriptor);

    console.log('Face login result:', result);

    if (result.success) {
      navigate('/');
    } else if (result.redirect) {
      // Show alert and redirect to registration
      setAlert({ type: 'error', message: result.error });
      setTimeout(() => {
        navigate(`/${result.redirect}`);
      }, 2500);
    } else {
      // Show error but stay on login page
      setAlert({ type: 'error', message: result.error });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-secondary-50 dark:bg-secondary-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <ScanFace className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            Welcome Back
          </h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          {/* Alert Banner */}
          {alert && (
            <div className={`mb-6 p-4 rounded-lg ${
              alert.type === 'error' 
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {alert.type === 'error' ? (
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${
                    alert.type === 'error' ? 'text-red-800 dark:text-red-200' : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {showFaceLogin ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">
                  Face Login
                </h2>
                <button
                  onClick={() => setShowFaceLogin(false)}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Use Email Instead
                </button>
              </div>
              
              <FaceRecognition
                mode="login"
                onFaceDetected={handleFaceDetected}
                onNoFaceDetected={() => {
                  setAlert({ 
                    type: 'error', 
                    message: 'No face detected. Please position your face clearly in the camera frame.' 
                  });
                }}
                onCancel={() => setShowFaceLogin(false)}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                icon={<Mail className="w-5 h-5" />}
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                icon={<Lock className="w-5 h-5" />}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-600 dark:text-secondary-400">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-300 dark:border-secondary-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Face Login Button */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setShowFaceLogin(true)}
              >
                <ScanFace className="w-5 h-5 mr-2" />
                Login with Face Recognition
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-secondary-600 dark:text-secondary-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
