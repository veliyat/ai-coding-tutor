# Ideal Production React Scaffold Prompt

Create a production-ready React application scaffold optimized for real-world development with the following architecture:

## Tech Stack
- **Build Tool**: Vite with React SWC plugin
- **Language**: TypeScript (strict mode for better DX and fewer bugs)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (install: button, input, label, card, dialog, dropdown-menu, select, checkbox, textarea, toast, tooltip, badge, tabs, skeleton)
- **Routing**: React Router DOM v7
- **State Management**: Hooks-first (useState/useCallback), Context only when truly needed
- **Forms**: React Hook Form + Zod for validation
- **Backend**: Supabase (Auth, Postgres, Edge Functions) or adaptable to any backend
- **Testing**: Vitest (unit), Playwright (e2e), React Testing Library
- **Linting**: ESLint + Prettier

## Folder Structure

```
project-root/
├── docs/
│   ├── ARCHITECTURE.md           # Architecture decisions and patterns
│   └── TESTING.md                # Testing strategy and examples
├── e2e/                          # Playwright e2e tests
│   ├── fixtures/
│   └── *.spec.ts
├── supabase/                     # Supabase configuration (if using)
│   ├── functions/                # Edge Functions
│   └── migrations/               # Database migrations
├── src/
│   ├── modules/                  # Feature modules (self-contained)
│   │   └── [feature]/
│   │       ├── components/       # Feature UI components
│   │       ├── hooks/            # Feature hooks (state, data fetching)
│   │       ├── lib/              # Business logic, validation, services
│   │       │   ├── *.ts          # Logic files
│   │       │   └── *.test.ts     # Co-located unit tests
│   │       ├── types/            # Feature-specific types
│   │       └── index.ts          # Public API (barrel export)
│   ├── pages/                    # Route components (thin, <100 lines)
│   │   └── FeaturePage.tsx
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components (don't modify)
│   │   │   └── *.tsx             # Shared components (Layout, ErrorBoundary)
│   │   ├── hooks/                # Shared hooks (useDebounce, useLocalStorage)
│   │   ├── lib/
│   │   │   ├── supabase.ts       # Database client
│   │   │   ├── logger.ts         # Dev-only logging
│   │   │   └── utils.ts          # cn() and general utilities
│   │   └── types/
│   │       └── database.ts       # Auto-generated DB types
│   ├── test/                     # Test setup and utilities
│   │   ├── setup.ts              # Vitest global setup
│   │   └── utils/
│   │       └── render.tsx        # Custom render with providers
│   ├── App.tsx                   # Root with router and guards
│   ├── main.tsx
│   └── index.css                 # Tailwind + theme
├── .env.example
├── components.json               # shadcn/ui config
├── playwright.config.ts
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

## Core Patterns

### 1. Single Barrel Export (Critical)

Every module exposes ONLY its public API via `index.ts`:

```typescript
// src/modules/users/index.ts

// Components
export { UserForm } from './components/UserForm'
export { UserList } from './components/UserList'
export { UserGuard } from './components/UserGuard'

// Hooks
export { useUser } from './hooks/useUser'
export { useUsers } from './hooks/useUsers'

// Types
export type { User, UserFormData } from './types'
```

**Rule**: External code imports ONLY from barrel:
```typescript
// ✅ Correct
import { useUser, UserForm } from '@/modules/users'

// ❌ Wrong - breaks on refactoring
import { useUser } from '@/modules/users/hooks/useUser'
```

### 2. Hooks-First State Management

Use `useState` + `useCallback` for local state. Add Context only when state must be shared across distant components:

```typescript
// src/modules/users/hooks/useUser.ts
import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/shared/lib/supabase'
import type { User } from '../types'

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) setError(error.message)
      else setUser(data)
      setLoading(false)
    }
    fetchUser()
  }, [userId])

  const updateUser = useCallback(async (updates: Partial<User>) => {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (!error) setUser(prev => prev ? { ...prev, ...updates } : null)
    return { error }
  }, [userId])

  return { user, loading, error, updateUser }
}
```

### 3. Thin Pages, Fat Modules

Pages are routing glue (<100 lines). All logic lives in modules:

```typescript
// src/pages/UserEditPage.tsx
import { useParams, Navigate } from 'react-router-dom'
import { useUser, UserForm, UserGuard } from '@/modules/users'

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) return <Navigate to="/users" replace />

  return (
    <UserGuard userId={id}>
      <UserEditContent userId={id} />
    </UserGuard>
  )
}

function UserEditContent({ userId }: { userId: string }) {
  const { user, loading, updateUser } = useUser(userId)

  if (loading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>

  return <UserForm user={user} onSave={updateUser} />
}
```

### 4. Guard Component Pattern

Protect routes with composable guards:

```typescript
// src/modules/auth/components/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return fallback ?? <div>Loading...</div>

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
```

Usage in router:
```typescript
<Route path="/dashboard" element={
  <AuthGuard>
    <OnboardingGuard>
      <Dashboard />
    </OnboardingGuard>
  </AuthGuard>
} />
```

### 5. Service Pattern for External APIs

Abstract external services behind interfaces for testability:

```typescript
// src/modules/ai/lib/ai-service.ts
export interface AIService {
  generateResponse(prompt: string, context: string): Promise<string>
}

export class OpenAIService implements AIService {
  async generateResponse(prompt: string, context: string): Promise<string> {
    const { data } = await supabase.functions.invoke('ai-chat', {
      body: { prompt, context }
    })
    return data.response
  }
}

export class MockAIService implements AIService {
  async generateResponse(): Promise<string> {
    return 'This is a mock response for testing'
  }
}

// Factory with environment detection
export function createAIService(): AIService {
  if (import.meta.env.VITE_USE_MOCK_AI === 'true') {
    return new MockAIService()
  }
  return new OpenAIService()
}
```

### 6. Form Handling with React Hook Form + Zod

```typescript
// src/modules/users/components/UserForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Label } from '@/shared/components/ui'

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  user?: UserFormData
  onSave: (data: UserFormData) => Promise<{ error?: Error }>
}

export function UserForm({ user, onSave }: UserFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user,
  })

  const onSubmit = async (data: UserFormData) => {
    const { error } = await onSave(data)
    if (error) console.error(error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
```

### 7. Co-located Tests

Tests live next to source files:

```
src/modules/users/lib/
├── validation.ts
├── validation.test.ts      # Unit test
├── user-service.ts
└── user-service.test.ts    # Unit test
```

```typescript
// src/modules/users/lib/validation.test.ts
import { describe, it, expect } from 'vitest'
import { validateEmail, validateName } from './validation'

describe('validateEmail', () => {
  it('returns true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true)
  })

  it('returns false for invalid email', () => {
    expect(validateEmail('not-an-email')).toBe(false)
  })
})
```

---

## Configuration Files

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/shared/components/ui/**', '**/*.d.ts', '**/index.ts'],
      thresholds: {
        lines: 60,
        branches: 50,
        functions: 70,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## Essential Shared Utilities

### src/shared/lib/supabase.ts
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
```

### src/shared/lib/utils.ts
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### src/shared/lib/logger.ts
```typescript
const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: unknown[]) => isDev && console.log('[LOG]', ...args),
  warn: (...args: unknown[]) => isDev && console.warn('[WARN]', ...args),
  error: (...args: unknown[]) => console.error('[ERROR]', ...args),
}
```

### src/test/setup.ts
```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

### src/test/utils/render.tsx
```typescript
import { render, type RenderOptions } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'

interface CustomRenderOptions extends RenderOptions {
  initialEntries?: string[]
  useMemoryRouter?: boolean
}

export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'], useMemoryRouter = false, ...options }: CustomRenderOptions = {}
) {
  const Wrapper = useMemoryRouter
    ? ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <BrowserRouter>{children}</BrowserRouter>
      )

  return render(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
```

---

## Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:headed": "playwright test --headed",
    "db:types": "supabase gen types typescript --project-id $PROJECT_ID > src/shared/types/database.ts"
  }
}
```

---

## Environment Variables (.env.example)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_USE_MOCK_AI=false
```

---

## Key Principles

1. **Modules are self-contained** - Each module owns its components, hooks, lib, types
2. **Barrel exports only** - External code imports from index.ts, never internal paths
3. **Pages are thin** - Routing and composition only, all logic in modules
4. **Hooks-first state** - useState/useCallback by default, Context when truly needed
5. **Co-located tests** - Tests live next to the code they test
6. **TypeScript strict** - Catch bugs at compile time
7. **Guard composition** - Protect routes with composable wrapper components
8. **Service abstraction** - External APIs behind interfaces for testability
9. **Form validation** - React Hook Form + Zod for type-safe forms

---

## Initial Setup Steps

1. `npm create vite@latest my-app -- --template react-swc-ts`
2. Install and configure Tailwind CSS v4
3. `npx shadcn@latest init` and install base components
4. Set up path aliases (`@/`)
5. Create folder structure as specified
6. Add shared utilities (supabase.ts, utils.ts, logger.ts)
7. Configure Vitest with test setup
8. Configure Playwright
9. Create example module following patterns (e.g., `auth` with login/signup)
10. Set up Supabase project (if using)

Generate the complete scaffold with configurations and an example `auth` module demonstrating all patterns.
