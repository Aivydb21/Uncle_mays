/// <reference types="vite/client" />

// Facebook Pixel TypeScript declarations
interface Window {
  fbq: (
    action: 'init' | 'track' | 'trackCustom',
    eventName: string,
    params?: Record<string, any>
  ) => void;
  _fbq?: typeof window.fbq;
}