import supabase from '../utils/supabase';

export const getDailyBestScores = async () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .gt('created_at', oneDayAgo)
    .order('score', { ascending: true })
    .limit(5);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
