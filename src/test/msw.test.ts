import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';

describe('MSW Setup', () => {
  it('should intercept fetch requests', async () => {
    // Override handler for this test
    server.use(
      http.post('*/rest/v1/rpc/get_or_create_daily_seed', () => {
        return HttpResponse.json([
          {
            seed: 99999,
            day_number: 200,
            game_date: '2025-01-30',
          },
        ]);
      }),
    );

    const response = await fetch('https://test.supabase.co/rest/v1/rpc/get_or_create_daily_seed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: 'test-key',
      },
      body: JSON.stringify({ p_target_date: '2025-01-30' }),
    });

    const data = await response.json();
    expect(data).toEqual([
      {
        seed: 99999,
        day_number: 200,
        game_date: '2025-01-30',
      },
    ]);
  });
});
