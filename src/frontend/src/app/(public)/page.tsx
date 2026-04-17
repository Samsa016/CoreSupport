'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, Users, Clock, Activity } from 'lucide-react';
import { tasksApi } from '@/shared/api';
import { Button } from '@/shared/ui';
import styles from './page.module.scss';

export default function GuestStatsPage() {
  const [todoCount, setTodoCount] = useState<number | null>(null);
  const [inProgressCount, setInProgressCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [todoTasks, inProgressTasks] = await Promise.all([
          tasksApi.getAll('todo'),
          tasksApi.getAll('in_progress'),
        ]);
        setTodoCount(todoTasks.length);
        setInProgressCount(inProgressTasks.length);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const teamLoad =
    todoCount !== null && inProgressCount !== null && (todoCount + inProgressCount) > 0
      ? Math.round((inProgressCount / (todoCount + inProgressCount)) * 100)
      : 0;

  return (
    <div className={styles.page}>
      {/* Background effects */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />

      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <Shield size={20} />
          </div>
          <span className={styles.logo}>CoreSupport</span>
        </div>
        <a href="/login">
          <Button variant="primary" size="sm">
            Log In <ArrowRight size={14} />
          </Button>
        </a>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Task Management Platform
          </div>

          <h1 className={styles.heroTitle}>
            Streamline your
            <br />
            <span className={styles.gradient}>team workflow</span>
          </h1>

          <p className={styles.heroSubtitle}>
            CoreSupport helps your team manage tasks efficiently with real-time
            collaboration, smart assignment, and AI-powered assistance.
          </p>

          <div className={styles.heroCta}>
            <a href="/login">
              <Button variant="primary" size="lg">
                Get Started <ArrowRight size={18} />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Clock size={24} />
            </div>
            <div className={styles.statValue}>
              {loading ? '—' : error ? '?' : todoCount}
            </div>
            <div className={styles.statLabel}>Tasks in Queue</div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
              <Users size={24} />
            </div>
            <div className={styles.statValue}>
              {loading ? '—' : error ? '?' : inProgressCount}
            </div>
            <div className={styles.statLabel}>Tasks in Progress</div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
              <Activity size={24} />
            </div>
            <div className={styles.statValue}>
              {loading ? '—' : error ? '?' : `${teamLoad}%`}
            </div>
            <div className={styles.statLabel}>Team Load</div>
          </div>
        </div>

        {error && (
          <p className={styles.statsError}>
            Stats may be unavailable for guests. Log in for full access.
          </p>
        )}
      </section>
    </div>
  );
}
