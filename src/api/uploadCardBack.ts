import supabase from '../utils/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const uploadCardBack = async (file: File, userId: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    throw new Error('You can only upload your own card back');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File must be a JPEG, PNG, GIF, or WebP image');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File must be under 5 MB');
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/card-back.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('card-backs')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from('card-backs').getPublicUrl(filePath);

  return { publicUrl };
};
