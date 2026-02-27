import { describe, it, expect } from 'vitest';
import supabase from '../utils/supabase';

describe('Supabase Mock', () => {
  it('should use test URL', () => {
    // Check that Supabase client is using the test URL
    // @ts-expect-error - accessing internal property for testing
    const url = supabase.supabaseUrl;
    expect(url).toBe('https://test.supabase.co');
  });
});
