// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// Only initialize if DSN is provided
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const Sentry = require("@sentry/nextjs");

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: process.env.NODE_ENV === 'development',
      
      // Filter out sensitive data
      beforeSend(event: any, hint: any) {
        // Don't send events in development unless explicitly enabled
        if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SENTRY_DEBUG) {
          return null;
        }
        
        // Remove sensitive data from request
        if (event.request) {
          // Remove authorization headers
          if (event.request.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
          }
          
          // Remove sensitive query params
          if (event.request.query_string) {
            const params = new URLSearchParams(event.request.query_string);
            params.delete('token');
            params.delete('password');
            event.request.query_string = params.toString();
          }
        }
        
        return event;
      },
      
      // Set environment
      environment: process.env.NODE_ENV || 'development',
      
      // Release tracking
      release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
    });
  } catch (error) {
    console.warn('Failed to initialize Sentry server:', error);
  }
}

// Export empty object to make this file a valid module
export {};

