import React, { useState, useRef, useEffect } from 'react';
import { Shield, Cloud, LogOut, Sun, Moon, ShieldCheck, Lock, User, KeyRound, TrendingUp } from 'lucide-react';
import { COMPANY_BRAND } from '../config/branding';

interface NavbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout: () => void;
  adminEmail?: string;
  currentPage?: 'licenses' | 'finance';
  onNavigate?: (page: 'licenses' | 'finance') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  onLogout,
  adminEmail = COMPANY_BRAND.defaultAdminEmail,
  currentPage = 'licenses',
  onNavigate,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-inner">
        {/* Left: Brand Identity */}
        <div
          className="nav-left"
          onClick={() => onNavigate && onNavigate('licenses')}
          style={{ cursor: onNavigate ? 'pointer' : 'default' }}
          title={onNavigate ? 'Go to License Dashboard' : undefined}
        >
          <div className="nav-logo-box">
            <Shield size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="nav-title">{COMPANY_BRAND.name}</h1>
              <span className="nav-badge-cloud">{COMPANY_BRAND.consoleBadge}</span>
            </div>
            <p className="nav-sub">{COMPANY_BRAND.tagline}</p>
          </div>
        </div>

        {/* Right: Only Theme Toggle and Circular Profile */}
        <div className="nav-right">
          {/* 1. Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="nav-icon-btn"
            title="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* 2. Circular Profile with Dropdown */}
          <div className="profile-wrapper" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="circular-avatar-btn"
              title="Administrator Profile & Security"
              aria-expanded={profileOpen}
            >
              <div className="avatar-circle">
                <User size={18} color="#ffffff" />
              </div>
              <span className="avatar-online-dot" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="profile-dropdown">
                {/* User Info Header */}
                <div className="dropdown-user-header">
                  <div className="dropdown-avatar-circle">
                    <ShieldCheck size={18} color="#ffffff" />
                  </div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-user-role">Master Administrator</span>
                    <span className="dropdown-user-email">{adminEmail}</span>
                  </div>
                </div>

                <div className="dropdown-divider" />

                {/* The 2 Badges: JWT Secured & Cloud Live */}
                <div className="dropdown-badges-box">
                  <div className="dropdown-badge-pill jwt">
                    <Lock size={12} color="#38bdf8" />
                    <span>JWT Secured</span>
                  </div>

                  <div className="dropdown-badge-pill cloud">
                    <Cloud size={12} color="#10b981" />
                    <span>Cloud Live</span>
                  </div>
                </div>

                <div className="dropdown-divider" />

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="dropdown-logout-btn"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scoped CSS with Perfect Container Alignment & Circular Profile */}
      <style>{`
        .admin-navbar {
          height: 64px;
          border-bottom: 1px solid var(--color-border);
          background-color: var(--color-surface);
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
          display: flex;
          align-items: center;
        }

        /* Matches below container max-width and corner padding */
        .admin-navbar-inner {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-logo-box {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb 0%, #0284c7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.35);
          flex-shrink: 0;
        }

        .nav-title {
          font-size: 1.08rem;
          font-weight: 800;
          color: var(--color-heading);
          margin: 0;
          letter-spacing: -0.01em;
        }

        .nav-badge-cloud {
          font-size: 0.62rem;
          font-weight: 700;
          color: var(--color-primary);
          background-color: var(--color-primary-soft);
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 2px 7px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .nav-sub {
          font-size: 0.70rem;
          color: var(--color-text-muted);
          margin: 0;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .nav-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface-secondary);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .nav-icon-btn:hover {
          color: var(--color-heading);
          border-color: var(--color-primary);
        }

        /* Circular Profile Button */
        .profile-wrapper {
          position: relative;
        }

        .circular-avatar-btn {
          position: relative;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--color-surface);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .circular-avatar-btn:hover .avatar-circle {
          transform: scale(1.05);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.5);
        }

        .avatar-online-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #10b981;
          border: 2px solid var(--color-surface);
        }

        /* Profile Dropdown Popover */
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 260px;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: dropFade 0.15s ease;
        }

        @keyframes dropFade {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-user-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dropdown-avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dropdown-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .dropdown-user-role {
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--color-heading);
        }

        .dropdown-user-email {
          font-size: 0.70rem;
          color: var(--color-text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-divider {
          height: 1px;
          background-color: var(--color-border);
          margin: 2px 0;
        }

        .dropdown-badges-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dropdown-badge-pill {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.68rem;
          font-weight: 700;
        }

        .dropdown-badge-pill.jwt {
          border: 1px solid rgba(56, 189, 248, 0.3);
          background-color: rgba(56, 189, 248, 0.08);
          color: #38bdf8;
        }

        .dropdown-badge-pill.cloud {
          border: 1px solid rgba(16, 185, 129, 0.3);
          background-color: rgba(16, 185, 129, 0.08);
          color: #10b981;
        }

        .dropdown-logout-btn {
          width: 100%;
          height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          background-color: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.15s ease;
        }

        .dropdown-logout-btn:hover {
          background-color: #ef4444;
          color: #ffffff;
        }

        /* Responsive Breakpoints matching below layout */
        @media (max-width: 900px) {
          .admin-navbar-inner {
            padding: 0 24px;
          }
        }

        @media (max-width: 640px) {
          .admin-navbar-inner {
            padding: 0 16px;
          }
          .nav-sub {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
