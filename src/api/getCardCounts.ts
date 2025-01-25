import supabase from '../utils/supabase';

export const getCardCounts = async () => {
  const { data, error } = await supabase.from('card_counts').select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
