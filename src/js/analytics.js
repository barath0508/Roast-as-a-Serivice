/**
 * Vercel & Google Analytics Integration
 * Tracks page views and web vitals automatically
 */
import { inject } from '@vercel/analytics';

// Initialize Vercel Analytics
inject({
  mode: import.meta.env.MODE === 'production' ? 'production' : 'development',
  debug: import.meta.env.DEV,
});

// Initialize Google Analytics (GA4) in Production
const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

if (gaId && import.meta.env.MODE === 'production') {
  // Inject Google Tag script element
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', gaId, {
    page_path: window.location.pathname,
  });
}
