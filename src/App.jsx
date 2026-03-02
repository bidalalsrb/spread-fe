import React from 'react';
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from './auth';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="app-shell">
      <main className="content">{children}</main>
      <footer className="tabbar">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
          홈
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
          설정
        </NavLink>
        <button className="tab logout" onClick={handleLogout} type="button">
          로그아웃
        </button>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
