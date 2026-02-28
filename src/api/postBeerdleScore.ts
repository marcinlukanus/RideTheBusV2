import supabase from '../utils/supabase';

export type SaveBeerdleScoreResult = {
  saved: boolean;
  final_score: number;
  already_completed: boolean;
};

export const postBeerdleScore = async (
  userId: string,
  gameDate: string,
  score: number,
): Promise<SaveBeerdleScoreResult> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    throw new Error('You can only submit scores for your own account');
  }

  const { data, error } = await supabase.rpc('save_beerdle_score', {
    p_user_id: userId,
    p_game_date: gameDate,
    p_score: score,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error('Failed to save beerdle score');
  }

  const result = data[0] as SaveBeerdleScoreResult;

  // If user has already completed today's Beerdle, throw an error
  if (result.already_completed) {
    throw new Error("You have already completed today's Beerdle!");
  }

  return result;
};
