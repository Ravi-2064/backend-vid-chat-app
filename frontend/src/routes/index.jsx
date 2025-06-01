import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ChatRoom from '../pages/ChatRoom';
import FriendsPage from '../pages/FriendsPage';
import UserSettings from '../pages/UserSettings';
import PrivateRoute from '../components/PrivateRoute';
import ErrorBoundary from '../components/ErrorBoundary';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoute><HomePage /></PrivateRoute>,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/register',
    element: <RegisterPage />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/chat/:roomId',
    element: <PrivateRoute><ChatRoom /></PrivateRoute>,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/friends',
    element: <PrivateRoute><FriendsPage /></PrivateRoute>,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/settings',
    element: <PrivateRoute><UserSettings /></PrivateRoute>,
    errorElement: <ErrorBoundary />
  }
]);

export default router; 