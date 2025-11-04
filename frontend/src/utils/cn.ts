import clsx, { ClassValue } from 'clsx';

/**
 * Utility function to conditionally combine classNames
 * Uses clsx for combining class values
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
