# MSW Mock Setup for Tests

This directory contains Mock Service Worker (MSW) setup for mocking Supabase API calls in tests.

## Files

- `handlers.ts` - MSW request handlers for Supabase endpoints
- `server.ts` - MSW server setup
- `utils.ts` - Helper functions for overriding handlers in tests

## Usage in Tests

MSW is automatically set up in `src/test/setup.ts`. To override handlers in specific tests:

```typescript
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';

// Override a handler for a specific test
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
```

## Mocking Supabase Client

To ensure MSW intercepts requests, mock the Supabase client to use a test URL:

```typescript
vi.mock('../../utils/supabase', async () => {
  const { createClient } = await import('@supabase/supabase-js');
  return {
    default: createClient('https://test.supabase.co', 'test-anon-key'),
  };
});
```

## Available Handlers

- `POST */rest/v1/rpc/get_or_create_daily_seed` - Get daily seed
- `POST */rest/v1/rpc/save_beerdle_score` - Save Beerdle score
- `GET */rest/v1/beerdle_scores` - Get Beerdle scores/stats
- `GET */auth/v1/user` - Get current user
- `POST */auth/v1/token` - Auth token
