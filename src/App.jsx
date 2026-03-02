import React from 'react';
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from './auth';
import { Button } from './components/ui/button';
import { cn } from './lib/utils';
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

function TabLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors',
          isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        )
      }
    >
      {children}
    </NavLink>
  );
}

function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate('/auth', { replace: true });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-2xl px-4 pb-24 pt-5">
      <main>{children}</main>
      <footer className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-2xl border-t bg-background/90 px-4 pb-[calc(0.65rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <TabLink to="/">홈</TabLink>
          <TabLink to="/settings">설정</TabLink>
          <Button variant="ghost" onClick={handleLogout} className="h-11 px-3 text-xs sm:text-sm">
            로그아웃
          </Button>
        </div>
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
