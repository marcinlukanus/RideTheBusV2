import supabase from '../utils/supabase';

export type DailySeed = {
  seed: number;
  game_date: string;
  day_number: number;
};

export const getDailySeed = async (): Promise<DailySeed> => {
  const { data, error } = await supabase.rpc('get_or_create_daily_seed');

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error('Failed to get daily seed');
  }

  return data[0] as DailySeed;
};

