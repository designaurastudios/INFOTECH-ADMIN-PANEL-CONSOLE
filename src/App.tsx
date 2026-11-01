import React, { useState, useEffect } from 'react';
import { authService, AdminUser } from './services/authService';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FinanceTrackerPage } from './pages/FinanceTrackerPage';
import { Navbar } from './components/Navbar';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentPage, setCurrentPage] = useState<'licenses' | 'finance'>(() => {
    return window.location.hash === '#finance' ? 'finance' : 'licenses';
  });

  useEffect(() => {
    // Check saved theme
    const savedTheme = (localStorage.getItem('dental_admin_theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Sync with browser hash changes
    const handleHashChange = () => {
      if (window.location.hash === '#finance') {
        setCurrentPage('finance');
      } else {
        setCurrentPage('licenses');
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    // Check auth with Firebase
    const unsubscribe = authService.checkAuth((adminUser) => {
      setUser(adminUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleNavigate = (page: 'licenses' | 'finance') => {
    setCurrentPage(page);
    window.location.hash = page === 'finance' ? '#finance' : '#licenses';
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('dental_admin_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-background)' }}>
        <Loader2 size={36} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={(adminUser) => setUser(adminUser)} />;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <Navbar
        adminEmail={user.email}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      <main>
        {currentPage === 'licenses' ? (
          <DashboardPage onNavigateToFinance={() => handleNavigate('finance')} />
        ) : (
          <FinanceTrackerPage onBackToLicenses={() => handleNavigate('licenses')} />
        )}
      </main>
    </div>
  );
};

export default App;
