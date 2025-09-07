// Environment configuration
export const config = {
  // API base URL - will be different for development vs production
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  
  // Other environment variables you might need
  gaTrackingId: import.meta.env.VITE_GA_MEASUREMENT_ID,
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
