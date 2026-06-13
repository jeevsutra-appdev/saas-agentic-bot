'use client';

if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Accessing element.ref was removed in React 19')) {
      return; // Suppress Craft.js React 19 warning
    }
    originalConsoleError(...args);
  };
}

export function SuppressWarnings() {
  return null;
}
