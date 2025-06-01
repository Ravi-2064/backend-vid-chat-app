import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { register as signup, login } from "../lib/api";

const SignupOverlay = ({ onClose }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    nativeLanguage: "",
    learningLanguage: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!isLogin) {
      // Signup validation
      if (!formData.fullName.trim()) {
        errors.fullName = "Full name is required";
      } else if (formData.fullName.length < 2) {
        errors.fullName = "Full name must be at least 2 characters";
      }

      if (!formData.nativeLanguage) {
        errors.nativeLanguage = "Native language is required";
      }

      if (!formData.learningLanguage) {
        errors.learningLanguage = "Learning language is required";
      }

      if (!formData.password) {
        errors.password = "Password is required";
      } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(formData.password)) {
        errors.password = "Password must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(formData.password)) {
        errors.password = "Password must contain at least one number";
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    // Common validation for both login and signup
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (isLogin && !formData.password) {
      errors.password = "Password is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      setIsLogin(true);
      setError("");
      setFormData({ fullName: "", email: "", password: "", confirmPassword: "", nativeLanguage: "", learningLanguage: "" });
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        setError("This email is already registered. Please sign in instead.");
        setIsLogin(true);
      } else {
        setError(error.response?.data?.message || "An error occurred during signup");
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      onClose();
      navigate("/");
    },
    onError: (error) => {
      setError(error.response?.data?.message || "Invalid email or password");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    if (isLogin) {
      loginMutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    } else {
      signupMutation.mutate({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        nativeLanguage: formData.nativeLanguage,
        learningLanguage: formData.learningLanguage,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">
            {isLogin ? "Welcome Back!" : "Join Our Community"}
          </h2>
          <p className="text-gray-600">
            {isLogin
              ? "Sign in to continue your language learning journey"
              : "Start your language learning journey today"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.fullName ? "border-red-500" : ""
                  }`}
                  placeholder="Enter your full name"
                />
                {validationErrors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Native Language
                </label>
                <select
                  name="nativeLanguage"
                  value={formData.nativeLanguage}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.nativeLanguage ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select your native language</option>
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                  <option value="italian">Italian</option>
                  <option value="portuguese">Portuguese</option>
                  <option value="russian">Russian</option>
                  <option value="japanese">Japanese</option>
                  <option value="chinese">Chinese</option>
                  <option value="korean">Korean</option>
                </select>
                {validationErrors.nativeLanguage && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.nativeLanguage}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language You Want to Learn
                </label>
                <select
                  name="learningLanguage"
                  value={formData.learningLanguage}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.learningLanguage ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select language to learn</option>
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                  <option value="italian">Italian</option>
                  <option value="portuguese">Portuguese</option>
                  <option value="russian">Russian</option>
                  <option value="japanese">Japanese</option>
                  <option value="chinese">Chinese</option>
                  <option value="korean">Korean</option>
                </select>
                {validationErrors.learningLanguage && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.learningLanguage}</p>
                )}
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.email ? "border-red-500" : ""
              }`}
              placeholder="Enter your email"
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.password ? "border-red-500" : ""
              }`}
              placeholder="Enter your password"
            />
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.confirmPassword ? "border-red-500" : ""
                }`}
                placeholder="Confirm your password"
              />
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {isLogin && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={signupMutation.isPending || loginMutation.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signupMutation.isPending || loginMutation.isPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? "Signing In..." : "Signing Up..."}
              </span>
            ) : (
              isLogin ? "Sign In" : "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setValidationErrors({});
                setFormData({ fullName: "", email: "", password: "", confirmPassword: "", nativeLanguage: "", learningLanguage: "" });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupOverlay; 