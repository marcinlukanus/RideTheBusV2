import { http, HttpResponse } from 'msw';
import { server } from './server';

/**
 * Helper to override handlers for specific test cases
 */

// Override getDailySeed response
export const mockGetDailySeed = (seed: number, dayNumber: number, gameDate: string) => {
  server.use(
    http.post('*/rest/v1/rpc/get_or_create_daily_seed', () => {
      return HttpResponse.json([
        {
          seed,
          day_number: dayNumber,
          game_date: gameDate,
        },
      ]);
    }),
  );
};

// Override saveBeerdleScore response
export const mockSaveBeerdleScore = (alreadyCompleted = false) => {
  server.use(
    http.post('*/rest/v1/rpc/save_beerdle_score', async ({ request }) => {
      const body = await request.json() as { p_score: number };
      return HttpResponse.json([
        {
          saved: true,
          final_score: body.p_score,
          already_completed: alreadyCompleted,
        },
      ]);
    }),
  );
};

// Override getUserBeerdleStats response
export const mockGetUserBeerdleStats = (stats: {
  scores?: Array<{
    id: number;
    user_id: string;
    game_date: string;
    score: number;
    created_at: string;
  }>;
  bestScore?: number;
}) => {
  const scores = stats.scores || [];
  const bestScore = stats.bestScore ?? (scores.length > 0 ? Math.min(...scores.map((s) => s.score)) : null);

  server.use(
    http.get('*/rest/v1/beerdle_scores', ({ request }) => {
      const url = new URL(request.url);
      const gameDate = url.searchParams.get('game_date');
      
      // If game_date is specified, it's getTodayBeerdleScore
      if (gameDate) {
        const todayScore = scores.find((s) => s.game_date === gameDate);
        return HttpResponse.json(todayScore ? [todayScore] : []);
      }

      // Otherwise return all scores
      return HttpResponse.json(scores);
    }),
  );
};

// Override getTodayBeerdleScore response
export const mockGetTodayBeerdleScore = (score: {
  id: number;
  user_id: string;
  game_date: string;
  score: number;
  created_at: string;
} | null) => {
  server.use(
    http.get('*/rest/v1/beerdle_scores', ({ request }) => {
      const url = new URL(request.url);
      const gameDate = url.searchParams.get('game_date');
      
      if (gameDate) {
        return HttpResponse.json(score ? [score] : []);
      }
      
      // Fallback to default handler
      return HttpResponse.json([]);
    }),
  );
};
