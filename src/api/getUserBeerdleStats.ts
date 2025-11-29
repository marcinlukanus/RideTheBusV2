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

/**
 * Get today's date in YYYY-MM-DD format using local timezone.
 * This ensures consistent date handling regardless of user's timezone.
 */
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a date string (YYYY-MM-DD format) and return new date string.
 * Handles date math without timezone issues.
 */
function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date at noon to avoid DST issues
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

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

  // Sort by date string descending (most recent first)
  // Since game_date is YYYY-MM-DD format, string comparison works correctly
  const sortedScores = [...scores].sort((a, b) => b.game_date.localeCompare(a.game_date));

  const todayStr = getLocalDateString();
  const yesterdayStr = addDaysToDateString(todayStr, -1);

  // Check if most recent game is today or yesterday (for current streak)
  const mostRecentDateStr = sortedScores[0].game_date;

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calculate current streak (must be consecutive from today or yesterday)
  const isStreakActive = mostRecentDateStr === todayStr || mostRecentDateStr === yesterdayStr;

  if (isStreakActive) {
    let expectedDateStr = mostRecentDateStr;

    for (const score of sortedScores) {
      if (score.game_date === expectedDateStr) {
        currentStreak++;
        expectedDateStr = addDaysToDateString(expectedDateStr, -1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  // Sort by date string ascending (oldest first)
  const sortedByDateAsc = [...scores].sort((a, b) => a.game_date.localeCompare(b.game_date));

  let prevDateStr: string | null = null;

  for (const score of sortedByDateAsc) {
    if (prevDateStr === null) {
      tempStreak = 1;
    } else {
      const expectedNextStr = addDaysToDateString(prevDateStr, 1);

      if (score.game_date === expectedNextStr) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);
    prevDateStr = score.game_date;
  }

  return { currentStreak, longestStreak };
}

export const getTodayBeerdleScore = async (userId: string): Promise<BeerdleScore | null> => {
  const today = getLocalDateString();

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
