// Mock Supabase client for testing
// This ensures MSW can intercept requests before Supabase client is created
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

// Use test URLs that MSW can intercept
const supabaseUrl = 'https://test.supabase.co';
const supabaseKey = 'test-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase;
