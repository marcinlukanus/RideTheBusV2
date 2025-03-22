import supabase from '../utils/supabase';

export const postScore = async (score: number, userId?: string) => {
  const { data, error } = await supabase.from('scores').insert([
    {
      score,
      user_id: userId,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
