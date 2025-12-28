export async function register() {
  // Setup global error handlers for server-side
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error: Error) => {
      // Ignore non-critical errors like /dev/lrt permission issues
      const errorCode = (error as any).code || '';
      const errorPath = (error as any).path || '';
      
      if (errorCode === 'EACCES' && (errorPath === '/dev/lrt' || errorPath === '//lrt')) {
        console.warn('Ignoring non-critical file system permission error:', errorPath);
        return;
      }
      
      // Log other errors
      console.error('Uncaught exception:', error);
    });
    
    process.on('unhandledRejection', (reason: any) => {
      // Ignore non-critical errors
      if (reason && typeof reason === 'object') {
        const errorCode = reason.code || '';
        const errorPath = reason.path || '';
        
        if (errorCode === 'EACCES' && (errorPath === '/dev/lrt' || errorPath === '//lrt')) {
          console.warn('Ignoring non-critical file system permission error:', errorPath);
          return;
        }
      }
      
      console.error('Unhandled rejection:', reason);
    });
  }

  // Only load Sentry configs if DSN is provided
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config');
    }
  } catch (error) {
    console.warn('Failed to load Sentry instrumentation:', error);
  }
}

