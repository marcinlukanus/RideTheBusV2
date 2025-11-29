import supabase from '../utils/supabase';

export type BeerdleScore = {
  id: number;
  user_id: string;
  game_date: string;
  score: number;
  created_at: string;
};

export type BeerdleStats = {
  scores: BeerdleScore[];
  totalGames: number;
  bestScore: number | null;
  averageScore: number | null;
  currentStreak: number;
  longestStreak: number;
};

export const getUserBeerdleStats = async (userId: string): Promise<BeerdleStats> => {
  const { data, error } = await supabase
    .from('beerdle_scores')
    .select('*')
    .eq('user_id', userId)
    .order('game_date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const scores = (data || []) as BeerdleScore[];

  if (scores.length === 0) {
    return {
      scores: [],
      totalGames: 0,
      bestScore: null,
      averageScore: null,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  // Calculate stats
  const totalGames = scores.length;
  const bestScore = Math.min(...scores.map((s) => s.score));
  const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / totalGames;

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(scores);

  return {
    scores,
    totalGames,
    bestScore,
    averageScore: Math.round(averageScore * 10) / 10,
    currentStreak,
    longestStreak,
  };
};

function calculateStreaks(scores: BeerdleScore[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (scores.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort by date descending (most recent first)
  const sortedScores = [...scores].sort(
    (a, b) => new Date(b.game_date).getTime() - new Date(a.game_date).getTime(),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if most recent game is today or yesterday (for current streak)
  const mostRecentDate = new Date(sortedScores[0].game_date);
  mostRecentDate.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate current streak (must be consecutive from today or yesterday)
  const isStreakActive =
    mostRecentDate.getTime() === today.getTime() ||
    mostRecentDate.getTime() === yesterday.getTime();

  if (isStreakActive) {
    let expectedDate = mostRecentDate;

    for (const score of sortedScores) {
      const scoreDate = new Date(score.game_date);
      scoreDate.setHours(0, 0, 0, 0);

      if (scoreDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
        expectedDate = new Date(expectedDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  const sortedByDateAsc = [...scores].sort(
    (a, b) => new Date(a.game_date).getTime() - new Date(b.game_date).getTime(),
  );

  let prevDate: Date | null = null;

  for (const score of sortedByDateAsc) {
    const scoreDate = new Date(score.game_date);
    scoreDate.setHours(0, 0, 0, 0);

    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const expectedNext = new Date(prevDate);
      expectedNext.setDate(expectedNext.getDate() + 1);

      if (scoreDate.getTime() === expectedNext.getTime()) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    prevDate = scoreDate;
  }

  return { currentStreak, longestStreak };
}

export const getTodayBeerdleScore = async (userId: string): Promise<BeerdleScore | null> => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('beerdle_scores')
    .select('*')
    .eq('user_id', userId)
    .eq('game_date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found
    throw new Error(error.message);
  }

  return data as BeerdleScore | null;
};

