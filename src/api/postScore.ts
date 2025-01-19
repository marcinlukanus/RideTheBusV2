import supabase from '../utils/supabase';

export const postScore = async (score: number) => {
  const { data, error } = await supabase.from('scores').insert([
    {
      score,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
