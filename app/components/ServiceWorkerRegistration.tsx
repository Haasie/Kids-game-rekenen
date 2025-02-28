'use client';

import { useEffect } from 'react';

interface Workbox {
  addEventListener: (event: string, callback: (event?: any) => void) => void;
  register: () => Promise<ServiceWorkerRegistration>;
}

declare global {
  interface Window {
    workbox?: Workbox;
  }
}

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;

      // Add event listeners to handle any updates
      wb.addEventListener('installed', event => {
        console.log(`Service Worker installatie succesvol: ${event.type}`);
      });

      wb.addEventListener('waiting', () => {
        console.log('Service Worker wacht op activatie');
      });

      wb.addEventListener('activated', event => {
        console.log(`Service Worker activatie succesvol: ${event.type}`);
      });

      // Register the service worker
      wb.register()
        .then(registration => {
          console.log('Service Worker registratie succesvol:', registration);
        })
        .catch(error => {
          console.error('Service Worker registratie mislukt:', error);
        });
    }
  }, []);

  return null;
}