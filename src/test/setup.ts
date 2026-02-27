import '@testing-library/jest-dom';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Mock Supabase client globally - must be here before any imports that use it
// Vitest hoists mocks, so this will be applied before any module imports
vi.mock('../utils/supabase', async () => {
  const { createClient } = await import('@supabase/supabase-js');
  return {
    default: createClient('https://test.supabase.co', 'test-anon-key'),
  };
});

// Establish API mocking before all tests
// Must be synchronous and happen before any imports that make requests
beforeAll(async () => {
  server.listen({ 
    onUnhandledRequest: (req) => {
      // Log unhandled requests for debugging
      if (req.url.includes('supabase') || req.url.includes('rest/v1') || req.url.includes('auth/v1')) {
        console.warn('[MSW] Unhandled request:', req.method, req.url);
      }
    },
  });
  // Give MSW a moment to set up
  await new Promise(resolve => setTimeout(resolve, 10));
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after the tests are finished
afterAll(() => {
  server.close();
});
