/**
 * Vercel Web Analytics
 * Tracks page views and web vitals automatically
 */
import { inject } from '@vercel/analytics';

// Initialize Vercel Analytics
inject({
  mode: import.meta.env.MODE === 'production' ? 'production' : 'development',
  debug: import.meta.env.DEV,
});
