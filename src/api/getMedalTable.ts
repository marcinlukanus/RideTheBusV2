import supabase from '../utils/supabase';

export interface MedalTableEntry {
  country: string;
  wins: number;
  avg_drinks: number;
}

export const getMedalTable = async (): Promise<MedalTableEntry[]> => {
  const { data, error } = await supabase.rpc('get_country_medal_table');

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
