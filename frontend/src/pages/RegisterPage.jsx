import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { register } from '../lib/api';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    nativeLanguage: '',
    learningLanguage: ''
  });

  const [errors, setErrors] = useState({});

  const { mutate: registerMutation, isPending } = useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success('Registration successful!');
      navigate('/home');
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed');
    }
  });

  const { mutate: googleRegisterMutation } = useMutation({
    mutationFn: async (credentialResponse) => {
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });
      if (!response.ok) {
        throw new Error('Google authentication failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Google login successful!');
      navigate('/');
    },
    onError: (error) => {
      toast.error(error.message || 'Google authentication failed');
    },
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.nativeLanguage) {
      newErrors.nativeLanguage = 'Native language is required';
    }

    if (!formData.learningLanguage) {
      newErrors.learningLanguage = 'Learning language is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      registerMutation({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        nativeLanguage: formData.nativeLanguage,
        learningLanguage: formData.learningLanguage
      });
    } else {
      toast.error('Please fill in all required fields correctly');
    }
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

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'italian', label: 'Italian' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'russian', label: 'Russian' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'korean', label: 'Korean' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-600 mt-2">Join our video chat community</p>
        </div>

        {/* Google Sign In Button */}
        <div className="mb-6">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              googleRegisterMutation(credentialResponse);
            }}
            onError={() => {
              toast.error('Google Sign In was unsuccessful');
            }}
            useOneTap
            theme="filled_blue"
            text="signup_with"
            shape="rectangular"
            width="100%"
          />
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`mt-1 block w-full px-4 py-3 rounded-lg border ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

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
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`mt-1 block w-full px-4 py-3 rounded-lg border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`mt-1 block w-full px-4 py-3 rounded-lg border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Native Language */}
          <div>
            <label htmlFor="nativeLanguage" className="block text-sm font-medium text-gray-700">
              Native Language <span className="text-red-500">*</span>
            </label>
            <select
              id="nativeLanguage"
              name="nativeLanguage"
              value={formData.nativeLanguage}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-3 rounded-lg border ${
                errors.nativeLanguage ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            >
              <option value="">Select your native language</option>
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            {errors.nativeLanguage && (
              <p className="mt-1 text-sm text-red-500">{errors.nativeLanguage}</p>
            )}
          </div>

          {/* Learning Language */}
          <div>
            <label htmlFor="learningLanguage" className="block text-sm font-medium text-gray-700">
              Learning Language <span className="text-red-500">*</span>
            </label>
            <select
              id="learningLanguage"
              name="learningLanguage"
              value={formData.learningLanguage}
              onChange={handleChange}
              className={`mt-1 block w-full px-4 py-3 rounded-lg border ${
                errors.learningLanguage ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            >
              <option value="">Select language you want to learn</option>
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            {errors.learningLanguage && (
              <p className="mt-1 text-sm text-red-500">{errors.learningLanguage}</p>
            )}
          </div>

          <div className="text-sm text-gray-600">
            <p><span className="text-red-500">*</span> Required fields</p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              Google
            </button>
            <button className="w-full py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              GitHub
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 