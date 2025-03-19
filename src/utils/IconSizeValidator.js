/**
 * Icon Size Validator Utility
 * 
 * This utility ensures that icon sizes passed to icons are valid numbers.
 * It helps prevent issues with invalid icon sizes that could cause rendering problems.
 */

const validateIconSize = (size) => {
  // Check if size is undefined, null, or not a number
  if (size === undefined || size === null || isNaN(size)) {
    // Return a default size
    return 24;
  }
  
  // Check if size is extremely large or small (potential error)
  if (size > 100 || size < 5) {
    return 24; // Use a reasonable default
  }
  
  // Return the original size if it passes validation
  return size;
};

export default validateIconSize;
