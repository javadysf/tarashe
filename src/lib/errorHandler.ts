/**
 * Global error handler for uncaught exceptions and unhandled rejections
 * This prevents the app from crashing due to errors like /dev/lrt permission issues
 */

// Store original handlers
const originalErrorHandler = typeof window !== 'undefined' ? window.onerror : null;
const originalUnhandledRejection = typeof window !== 'undefined' ? window.onunhandledrejection : null;

/**
 * Check if an error is a known non-critical error that we can safely ignore
 */
function isNonCriticalError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString() || '';
  const errorCode = error.code || '';
  const errorPath = error.path || '';
  
  // Ignore /dev/lrt permission errors (likely logging issue)
  if (errorCode === 'EACCES' && (errorPath === '/dev/lrt' || errorPath === '//lrt')) {
    console.warn('Ignoring non-critical file system permission error:', errorPath);
    return true;
  }
  
  // Ignore NEXT_REDIRECT errors (these are expected in Next.js)
  if (errorMessage.includes('NEXT_REDIRECT') || error.digest?.toString().includes('NEXT_REDIRECT')) {
    return true;
  }
  
  // Ignore network errors that are expected
  if (errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('خطا در اتصال به اینترنت')) {
    return true;
  }
  
  return false;
}

/**
 * Global error handler for uncaught errors
 */
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;
  
  // Handle uncaught errors
  window.onerror = (message, source, lineno, colno, error) => {
    // Check if it's a non-critical error
    if (error && isNonCriticalError(error)) {
      return true; // Prevent default error handling
    }
    
    // Log the error for debugging
    if (error && !isNonCriticalError(error)) {
      console.error('Uncaught error:', {
        message,
        source,
        lineno,
        colno,
        error
      });
    }
    
    // Call original handler if it exists
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }
    
    return false;
  };
  
  // Handle unhandled promise rejections
  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const error = event.reason;
    
    // Check if it's a non-critical error
    if (isNonCriticalError(error)) {
      event.preventDefault(); // Prevent default error handling
      return;
    }
    
    // Log the error for debugging
    console.error('Unhandled promise rejection:', error);
    
    // Call original handler if it exists
    if (originalUnhandledRejection) {
      originalUnhandledRejection.call(window,event);
    }
  };
  
  // Handle process errors (Node.js environment)
  if (typeof process !== 'undefined' && process.on) {
    process.on('uncaughtException', (error: Error) => {
      if (isNonCriticalError(error)) {
        return; // Ignore non-critical errors
      }
      console.error('Uncaught exception:', error);
    });
    
    process.on('unhandledRejection', (reason: any) => {
      if (isNonCriticalError(reason)) {
        return; // Ignore non-critical errors
      }
      console.error('Unhandled rejection:', reason);
    });
  }
}

/**
 * Safe number formatting helper that never throws
 */
export function safeFormatNumber(value: any, locale: string = 'fa-IR'): string {
  try {
    if (value === null || value === undefined || value === '') {
      return '0';
    }
    
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    
    if (isNaN(num) || !isFinite(num)) {
      return '0';
    }
    
    try {
      return new Intl.NumberFormat(locale).format(num);
    } catch (localeError) {
      // Fallback to English if locale fails
      return num.toLocaleString('en-US');
    }
  } catch (error) {
    console.warn('safeFormatNumber error:', error);
    return '0';
  }
}

/**
 * Safe property access helper
 */
export function safeGet(obj: any, path: string, defaultValue: any = null): any {
  try {
    if (!obj || typeof obj !== 'object') {
      return defaultValue;
    }
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return defaultValue;
      }
      current = current[key];
    }
    
    return current !== undefined ? current : defaultValue;
  } catch (error) {
    console.warn('safeGet error:', error, 'path:', path);
    return defaultValue;
  }
}

