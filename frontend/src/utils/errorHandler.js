import { toast } from 'react-hot-toast';

export const handleError = (error, fallbackMessage = 'An unexpected error occurred') => {
  // Log the error for debugging
  console.error('Error:', error);

  // Extract error message
  const errorMessage = error?.response?.data?.message || 
                      error?.message || 
                      fallbackMessage;

  // Show toast notification
  toast.error(errorMessage);

  // Return the error message for potential use in components
  return errorMessage;
};

export const handleAuthError = (error) => {
  const message = error?.response?.data?.message || 
                 error?.message || 
                 'Authentication failed. Please try again.';
  
  toast.error(message);
  return message;
};

export const handleNetworkError = (error) => {
  const message = 'Network error. Please check your connection and try again.';
  toast.error(message);
  return message;
};

export const handleValidationError = (error) => {
  const message = error?.response?.data?.message || 
                 error?.message || 
                 'Please check your input and try again.';
  
  toast.error(message);
  return message;
}; 