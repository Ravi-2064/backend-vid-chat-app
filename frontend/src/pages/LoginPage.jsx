import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { handleAuthError, handleValidationError } from '../utils/errorHandler';
import axios from 'axios';
import { FaGithub, FaFacebook } from 'react-icons/fa';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
        return response.data;
      } catch (error) {
        if (error.response?.status === 401) {
          throw new Error('Invalid email or password');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      login(data);
      navigate('/home');
    },
    onError: (error) => {
      handleAuthError(error);
    }
  });

  const googleLoginMutation = useMutation({
    mutationFn: async (credentialResponse) => {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/google', {
          credential: credentialResponse.credential
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      login(data);
      navigate('/home');
    },
    onError: (error) => {
      handleAuthError(error);
    }
  });

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Please enter your password';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (validateForm()) {
      setIsSubmitting(true);
      console.log('Submitting login form with:', formData);
      try {
        await loginMutation.mutateAsync(formData);
      } catch (error) {
        console.error('Login submission error:', error);
        setIsSubmitting(false);
      }
    } else {
      // Show toast for the first error
      const firstError = Object.values(errors)[0];
      handleValidationError(new Error(firstError));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLoginMutation.mutateAsync(credentialResponse);
    } catch (error) {
      // Error is already handled in mutation
    }
  };

  const handleGoogleError = () => {
    handleValidationError(new Error('Google login failed. Please try again.'));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className={`mt-1 block w-full px-4 py-3 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500" id="email-error">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password with visibility toggle */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`block w-full px-4 py-3 rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10`}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5" />
                ) : (
                  <FaEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500" id="password-error">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending || isSubmitting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loginMutation.isPending || isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_blue"
              text="signin_with"
              shape="rectangular"
              width="100%"
              type="standard"
              context="signin"
            />
          </div>

          <button
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-[#24292F] hover:bg-[#1B1F23] transition-colors"
          >
            <FaGithub className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Continue with GitHub</span>
          </button>

          <button
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-[#1877F2] hover:bg-[#0C63D4] transition-colors"
          >
            <FaFacebook className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Continue with Facebook</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
