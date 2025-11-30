import supabase from '../utils/supabase';

export type DailySeed = {
  seed: number;
  game_date: string;
  day_number: number;
};

/**
 * Get the user's local date in YYYY-MM-DD format.
 * This ensures users play the Beerdle for their local day, not UTC.
 */
function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const getDailySeed = async (): Promise<DailySeed> => {
  const localDate = getLocalDateString();

  // Pass the user's local date so they play the Beerdle for their timezone
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)('get_or_create_daily_seed', {
    p_target_date: localDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error('Failed to get daily seed');
  }

  return data[0] as DailySeed;
};
