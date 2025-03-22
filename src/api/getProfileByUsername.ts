import supabase from '../utils/supabase';

export const getProfileByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
