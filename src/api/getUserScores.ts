import supabase from '../utils/supabase';

export const getUserScores = async (userId: string) => {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
