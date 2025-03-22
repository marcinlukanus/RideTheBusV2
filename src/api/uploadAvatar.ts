import supabase from '../utils/supabase';

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
