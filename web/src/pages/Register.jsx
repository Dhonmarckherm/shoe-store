import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ScanFace, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import FaceRecognition from '../components/FaceRecognition';

const Register = () => {
  const { register, registerFace, logout, isAuthenticated, isRegistering, user } = useAuth();
  const [step, setStep] = useState(isAuthenticated && isRegistering ? 2 : 1); // Skip to step 2 if already authenticated but registering
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const navigate = useNavigate();

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    
    if (!validateStep1()) return;
    
    setIsLoading(true);
    
    try {
      const result = await register(formData.fullName, formData.email, formData.password);
      console.log('Registration result:', result);
      
      if (result.success) {
        console.log('Registration successful, moving to step 2');
        setStep(2);
      } else {
        console.error('Registration failed:', result.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceDetected = async (faceDescriptor) => {
    setIsLoading(true);
    
    const result = await registerFace(faceDescriptor);
    
    if (result.success) {
      setRegistrationComplete(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
    
    setIsLoading(false);
  };

  const skipFaceRegistration = () => {
    // If user skipped face registration during signup, clear the registering state
    if (isRegistering) {
      // You could logout here if you want to force face registration
      // logout();
    }
    navigate('/');
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-secondary-50 dark:bg-secondary-900">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 mb-4">
            Registration Complete!
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-8">
            Your account has been created successfully. Redirecting you to the home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-secondary-50 dark:bg-secondary-900">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            Create Account
          </h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Join us for a personalized shopping experience
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-secondary-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-secondary-200 text-secondary-600'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:block">Account</span>
          </div>
          <div className={`w-16 h-0.5 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-secondary-300'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-secondary-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-secondary-200 text-secondary-600'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:block">Face Setup</span>
          </div>
        </div>

        {/* Form */}
        <div className="card p-8">
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                error={errors.fullName}
                required
                icon={<User className="w-5 h-5" />}
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                error={errors.email}
                required
                icon={<Mail className="w-5 h-5" />}
              />

              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a password"
                error={errors.password}
                required
                icon={<Lock className="w-5 h-5" />}
              />

              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                error={errors.confirmPassword}
                required
                icon={<Lock className="w-5 h-5" />}
              />

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                  <ScanFace className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100 mb-2">
                  Set Up Face Recognition
                </h2>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Enable quick and secure login with your face. You can skip this step and set it up later.
                </p>
              </div>

              <FaceRecognition
                mode="register"
                onFaceDetected={handleFaceDetected}
                isLoading={isLoading}
              />

              <div className="mt-6 text-center">
                <button
                  onClick={skipFaceRegistration}
                  className="text-sm text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-secondary-600 dark:text-secondary-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
