/**
 * Utility for handling common error scenarios in the app
 */

// Make sure callbacks are valid functions
export const safeCallback = (callback, defaultReturn = null) => {
  if (typeof callback === 'function') {
    return (...args) => {
      try {
        return callback(...args);
      } catch (error) {
        console.error('Error in callback execution:', error);
        return defaultReturn;
      }
    };
  }
  return () => defaultReturn;
};

// Safely execute async operations
export const safeAsync = async (promise, errorHandler = null) => {
  try {
    return await promise;
  } catch (error) {
    console.error('Error in async operation:', error);
    if (typeof errorHandler === 'function') {
      return errorHandler(error);
    }
    return null;
  }
};

// Set up global error handlers
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  if (global.ErrorUtils) {
    const originalGlobalHandler = global.ErrorUtils.getGlobalHandler();
    
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.log(`Global error caught (${isFatal ? 'FATAL' : 'NON-FATAL'}):`, error);
      originalGlobalHandler(error, isFatal);
    });
  }
  
  // For when ErrorUtils is not available
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Filter out specific error messages if needed
    if (args[0] && typeof args[0] === 'string' && args[0].includes('callback is not a function')) {
      console.log('Callback error detected:', args);
      // Could add additional handling here
    }
    originalConsoleError(...args);
  };
  
  return () => {
    // Cleanup function to restore original handlers if needed
    console.error = originalConsoleError;
    if (global.ErrorUtils) {
      global.ErrorUtils.setGlobalHandler(originalGlobalHandler);
    }
  };
};

export default {
  safeCallback,
  safeAsync,
  setupGlobalErrorHandlers
};
