import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { setUnauthorizedHandler } from './services/api.js';
import { ToastStack } from './components/ToastStack.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AppShell } from './components/layout/AppShell.jsx';

import Landing         from './pages/Landing.jsx';
import Login           from './pages/Login.jsx';
import Signup          from './pages/Signup.jsx';
import Dashboard       from './pages/Dashboard.jsx';
import CreateUrl       from './pages/CreateUrl.jsx';
import Urls            from './pages/Urls.jsx';
import { Collections }      from './pages/Collections.jsx';
import CollectionDetail     from './pages/CollectionDetail.jsx';
import UrlAnalytics    from './pages/UrlAnalytics.jsx';

function SessionBridge() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      navigate('/login', { replace: true });
    });
    return () => setUnauthorizedHandler(() => {});
  }, [logout, navigate]);

  return null;
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <SessionBridge />
      <ToastStack />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="dashboard"              element={<Dashboard />} />
            <Route path="create"                 element={<CreateUrl />} />
            <Route path="urls"                   element={<Urls />} />
            <Route path="urls/:id/analytics"     element={<UrlAnalytics />} />
            <Route path="collections"            element={<Collections />} />
            <Route path="collections/:id"        element={<CollectionDetail />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
