import { vi } from 'vitest'

// Mock Supabase client for testing
export const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    updateUser: vi.fn(),
  },
  functions: {
    invoke: vi.fn(),
  },
}

// Reset all mocks
export function resetSupabaseMocks() {
  vi.clearAllMocks()
  mockSupabaseClient.from.mockReturnThis()
  mockSupabaseClient.select.mockReturnThis()
  mockSupabaseClient.insert.mockReturnThis()
  mockSupabaseClient.update.mockReturnThis()
  mockSupabaseClient.upsert.mockReturnThis()
  mockSupabaseClient.delete.mockReturnThis()
  mockSupabaseClient.eq.mockReturnThis()
  mockSupabaseClient.single.mockReturnThis()
}

// Helper to mock successful select query
export function mockSelectSuccess<T>(data: T) {
  mockSupabaseClient.select.mockResolvedValueOnce({ data, error: null })
}

// Helper to mock select error
export function mockSelectError(message: string) {
  mockSupabaseClient.select.mockResolvedValueOnce({
    data: null,
    error: { message },
  })
}

// Helper to mock successful insert
export function mockInsertSuccess<T>(data: T) {
  mockSupabaseClient.insert.mockResolvedValueOnce({ data, error: null })
}

// Helper to mock successful upsert
export function mockUpsertSuccess() {
  mockSupabaseClient.upsert.mockResolvedValueOnce({ data: null, error: null })
}
