import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { authService, AdminUser } from '../services/authService';
import { COMPANY_BRAND } from '../config/branding';

interface LoginPageProps {
  onLoginSuccess: (user: AdminUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await authService.login(email, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-canvas">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-icon-box">
            <Shield size={28} color="#ffffff" />
          </div>
          <div>
            <h1 className="login-brand-title">{COMPANY_BRAND.name}</h1>
            <p className="login-brand-sub">{COMPANY_BRAND.tagline}</p>
          </div>
        </div>

        {error && (
          <div className="login-error-alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label className="login-label">Administrator Email</label>
            <div className="login-input-box">
              <Mail size={16} color="var(--color-text-muted)" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder={COMPANY_BRAND.defaultAdminEmail}
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="login-label">Master Password</label>
            <div className="login-input-box">
              <Lock size={16} color="var(--color-text-muted)" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-submit-btn">
            {loading ? (
              <>
                <Loader2 size={16} className="login-spinner" />
                <span>Authenticating with Firebase...</span>
              </>
            ) : (
              <>
                <span>Sign In to Cloud Command Center</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <span>Protected by Firebase Authentication & Cryptographic Signature Verification</span>
        </div>
      </div>

      <style>{`
        .login-canvas {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.12) 0%, var(--color-background) 70%);
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 32px 28px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .login-brand-header {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .login-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--color-primary) 0%, #0d9488 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
        }

        .login-brand-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--color-heading);
          margin: 0;
        }

        .login-brand-sub {
          font-size: 0.72rem;
          color: var(--color-text-muted);
          margin: 2px 0 0 0;
        }

        .login-error-alert {
          padding: 10px 12px;
          border-radius: 8px;
          background-color: var(--color-danger-soft);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .login-label {
          display: block;
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--color-heading);
          margin-bottom: 6px;
        }

        .login-input-box {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 44px;
          padding: 0 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
          background-color: var(--color-input-background);
          transition: border-color 0.15s ease;
        }

        .login-input-box:focus-within {
          border-color: var(--color-primary);
        }

        .login-input {
          flex: 1;
          height: 100%;
          border: none;
          background: transparent;
          color: var(--color-heading);
          font-size: 0.86rem;
          outline: none;
        }

        .login-submit-btn {
          height: 46px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
          color: #ffffff;
          font-size: 0.88rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 6px;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
          transition: all 0.15s ease;
        }

        .login-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          opacity: 0.95;
        }

        .login-spinner {
          animation: spin 1s linear infinite;
        }

        .login-footer {
          text-align: center;
          font-size: 0.68rem;
          color: var(--color-text-muted);
          padding-top: 10px;
          border-top: 1px solid var(--color-border);
        }
      `}</style>
    </div>
  );
};
