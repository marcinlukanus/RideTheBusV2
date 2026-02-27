import { http, HttpResponse } from 'msw';

// Use wildcard patterns to match any Supabase URL
// MSW pattern: */path matches any origin
export const handlers = [
  // RPC: get_or_create_daily_seed
  // Match any URL pattern that includes this path
  // Use a more permissive pattern to catch all variations
  http.post(
    'https://test.supabase.co/rest/v1/rpc/get_or_create_daily_seed',
    async ({ request }) => {
      try {
        const body = (await request.json()) as { p_target_date?: string };

        return HttpResponse.json([
          {
            seed: 12345,
            day_number: 100,
            game_date: body?.p_target_date || '2025-01-29',
          },
        ]);
      } catch (error) {
        // Fallback if body parsing fails
        return HttpResponse.json([
          {
            seed: 12345,
            day_number: 100,
            game_date: '2025-01-29',
          },
        ]);
      }
    },
  ),
  // Also match wildcard pattern as fallback
  http.post('*/rest/v1/rpc/get_or_create_daily_seed', async ({ request }) => {
    try {
      const body = (await request.json()) as { p_target_date?: string };

      return HttpResponse.json([
        {
          seed: 12345,
          day_number: 100,
          game_date: body?.p_target_date || '2025-01-29',
        },
      ]);
    } catch (error) {
      return HttpResponse.json([
        {
          seed: 12345,
          day_number: 100,
          game_date: '2025-01-29',
        },
      ]);
    }
  }),

  // RPC: save_beerdle_score
  http.post('*/rest/v1/rpc/save_beerdle_score', async ({ request }) => {
    const body = (await request.json()) as {
      p_user_id: string;
      p_game_date: string;
      p_score: number;
    };

    return HttpResponse.json([
      {
        saved: true,
        final_score: body.p_score,
        already_completed: false,
      },
    ]);
  }),

  // GET: beerdle_scores table queries
  http.get('*/rest/v1/beerdle_scores', async ({ request }) => {
    const url = new URL(request.url);
    const gameDate = url.searchParams.get('game_date');
    const userId = url.searchParams.get('user_id');

    // If game_date is specified, it's getTodayBeerdleScore
    if (gameDate) {
      // Default: no score found (empty array for .single() to return null)
      return HttpResponse.json([]);
    }

    // Otherwise it's getUserBeerdleStats - return empty array
    return HttpResponse.json([]);
  }),

  // Auth endpoints
  http.get('*/auth/v1/user', async () => {
    return HttpResponse.json(null, { status: 200 });
  }),

  http.post('*/auth/v1/token', async () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
      },
    });
  }),

  // Catch-all handler for any Supabase requests that don't match above
  // This prevents real network requests and provides helpful error messages
  http.all('*', async ({ request }) => {
    const url = new URL(request.url);
    // Only handle Supabase-related requests
    if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/')) {
      console.warn(`[MSW] Unhandled Supabase request: ${request.method} ${request.url}`);
      // Return a generic error response
      return HttpResponse.json(
        {
          error: 'Unhandled request in test',
          message: `No handler for ${request.method} ${url.pathname}`,
        },
        { status: 404 },
      );
    }
    // For non-Supabase requests, let them through (or return 404)
    return HttpResponse.json({ error: 'Not a Supabase request' }, { status: 404 });
  }),
];
