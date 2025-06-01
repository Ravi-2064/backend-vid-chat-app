import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatRoom from './pages/ChatRoom';
import TextChatRoom from './pages/TextChatRoom';
import VideoChatRoom from './pages/VideoChatRoom';
import FriendsPage from './pages/FriendsPage';
import UserSettings from './pages/UserSettings';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const GOOGLE_CLIENT_ID = '334465248552-i68au3j1u1tapcs9qt8sqfmfrpqo7ppi.apps.googleusercontent.com';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#333',
                      color: '#fff',
                    },
                  }}
                />
                <Routes>
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <HomePage />
                        </ErrorBoundary>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <ErrorBoundary>
                        <LoginPage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <ErrorBoundary>
                        <RegisterPage />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/chat/:roomId?"
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <TextChatRoom />
                        </ErrorBoundary>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/video-chat/:roomId?"
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <VideoChatRoom />
                        </ErrorBoundary>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/friends"
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <FriendsPage />
                        </ErrorBoundary>
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <UserSettings />
                        </ErrorBoundary>
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </div>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
