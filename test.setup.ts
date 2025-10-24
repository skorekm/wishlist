import { mock } from 'bun:test';

// Set up mock environment variables for tests to prevent supabaseClient from throwing errors
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'mock-anon-key-for-testing';

// Mock supabaseClient globally before any test files load
mock.module('@/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: mock(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
      signInWithPassword: mock(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signOut: mock(() => Promise.resolve({ error: null })),
    },
    from: mock(() => ({
      select: mock(() => ({})),
      insert: mock(() => ({})),
      update: mock(() => ({})),
      delete: mock(() => ({})),
    })),
  },
}));

