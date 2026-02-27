// Global Supabase mock - this file is imported in setup.ts to ensure it's loaded first
import { vi } from 'vitest';

// Mock Supabase client before any modules import it
vi.mock('../utils/supabase', async () => {
  const { createClient } = await import('@supabase/supabase-js');
  return {
    default: createClient('https://test.supabase.co', 'test-anon-key'),
  };
});
