# AI Programming Tutor - Project Context

## What This Is
An adaptive AI programming tutor that teaches JavaScript step-by-step. Curriculum-driven, not free-form chat. Feels like a patient human mentor.

## Tech Stack
- **Frontend**: React (Vite), TypeScript, shadcn/ui, Monaco Editor
- **Backend**: Supabase (Auth, Postgres, RLS), Cloudflare Workers (AI orchestration)
- **AI**: LLM-based tutor with prompt-driven behavior

## Project Structure (Module-Based)
```
src/
├── modules/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── lib/
│   │       └── auth.ts
│   │
│   ├── lesson/
│   │   ├── components/
│   │   │   ├── LessonContent.tsx
│   │   │   ├── ExercisePrompt.tsx
│   │   │   └── KeyPoints.tsx
│   │   ├── hooks/
│   │   │   ├── useLesson.ts
│   │   │   └── useProgress.ts
│   │   ├── lib/
│   │   │   └── curriculum.ts
│   │   └── types/
│   │       └── lesson.ts
│   │
│   ├── editor/
│   │   ├── components/
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── OutputPanel.tsx
│   │   │   └── EditorActions.tsx
│   │   ├── hooks/
│   │   │   └── useCodeExecution.ts
│   │   └── lib/
│   │       └── sandbox.ts
│   │
│   ├── tutor/
│   │   ├── components/
│   │   │   ├── TutorChat.tsx
│   │   │   ├── TutorMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── hooks/
│   │   │   └── useTutor.ts
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── types/
│   │       └── tutor.ts
│   │
│   └── layout/
│       └── components/
│           ├── Header.tsx
│           ├── LessonLayout.tsx
│           └── ProgressBar.tsx
│
├── pages/                    # Thin wrappers for routing
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Onboarding.tsx
│   ├── Dashboard.tsx
│   ├── Lesson.tsx
│   └── Profile.tsx
│
├── shared/                   # Cross-module utilities
│   ├── components/
│   │   └── ui/              # shadcn/ui components
│   ├── lib/
│   │   └── supabase.ts      # Supabase client
│   └── types/
│       └── database.ts      # Supabase generated types
│
├── App.tsx
├── main.tsx
└── index.css
```

## Architecture Rules
1. **Pages are thin** — Only routing, layout composition, and passing props down
2. **Modules are self-contained** — Each module owns its components, hooks, libs, types
3. **Shared is global** — Only truly cross-cutting concerns (supabase client, ui components)
4. **No cross-module imports of internal files** — Export from module index if needed

## Key Design Principles
1. **Curriculum controls AI** — Lessons define what tutor can teach
2. **Data drives adaptation** — Track attempts, errors, time to adjust difficulty
3. **One concept at a time** — No knowledge dumping
4. **Ask before advancing** — Verify understanding with check questions
5. **Hints, not answers** — Unless explicitly requested

## Commands
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Environment Variables
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Coding Conventions
- Use TypeScript strict mode
- Prefer named exports
- Use shadcn/ui components from `@/shared/components/ui`
- Path alias: `@/` maps to `src/`
- Each module can have an `index.ts` to expose public API
- Keep page components under 50 lines
- Business logic lives in module hooks/libs, not components

## MVP Constraints
- JavaScript only (no other languages)
- Linear lesson flow (no branching)
- Desktop-first (no mobile optimization)
- No gamification, social features, or user-generated content
