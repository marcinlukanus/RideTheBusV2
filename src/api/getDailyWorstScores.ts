import supabase from '../utils/supabase';

export interface LeaderboardEntry {
  score: number;
  country: string | null;
}

export const getDailyWorstScores = async (): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase.rpc('get_longest_rides');

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
