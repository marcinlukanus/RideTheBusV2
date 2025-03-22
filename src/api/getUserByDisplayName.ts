import supabase from '../utils/supabase';

export const getUserByDisplayName = async (displayName: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', displayName)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
