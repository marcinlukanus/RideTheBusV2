import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types.ts';

const supabaseUrl = import.meta.env.VITE_SUPABASE_DATABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const uploadAvatar = async (file: File, userId: string) => {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    // Upload the file to Supabase storage
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
      upsert: true,
    });

    if (uploadError) throw uploadError;

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath);

    return { publicUrl };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

export default supabase;
