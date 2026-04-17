'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight } from 'lucide-react';
import { authApi } from '@/shared/api';
import { useAuthStore } from '@/shared/store';
import { Button } from '@/shared/ui';
import styles from './page.module.scss';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const loginRes = await authApi.login(email, password);
      localStorage.setItem('access_token', loginRes.access_token);
      const user = await authApi.getMe();
      setAuth(loginRes.access_token, user);
      router.push('/dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Wrong email or password');
      } else if (status === 422) {
        setError('Please fill in all fields');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Background effects */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logoIcon}>
              <Shield size={24} />
            </div>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Sign in to CoreSupport</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                name="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <Button
              variant="primary"
              type="submit"
              fullWidth
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          <div className={styles.footer}>
            <a href="/" className={styles.backLink}>← Back to home</a>
          </div>
        </div>
      </div>
    </div>
  );
}
