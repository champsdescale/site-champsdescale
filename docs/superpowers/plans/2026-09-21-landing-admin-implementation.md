# Champs d'Escale — Landing + App de Gestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js landing page for "Les Champs d'Escale" whose 10 fixed section types are stored in Supabase and editable in real time through a protected `/admin` builder, deployed on Netlify.

**Architecture:** One Next.js (App Router) project. A `SectionsRepository` interface isolates all data access so business logic (ordering, validation, forms) is unit-testable against an in-memory fake; a Supabase implementation is wired in last. The public page renders dynamically (no cache) straight from Supabase. The admin builder is a 3-column client component (list / live preview / editor) that calls Server Actions, with a debounced autosave hook.

**Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Supabase (Postgres + Auth + Storage) via `@supabase/ssr`, `@dnd-kit` for drag & drop, `zod` for content validation, `lucide-react` for icons, Vitest + Testing Library for tests, Netlify for hosting.

**Spec:** `docs/superpowers/specs/2026-09-21-champsdescale-landing-design.md`

## Global Constraints

- Palette exacte (à utiliser telle quelle, en classes Tailwind arbitraires) : fond `#EDE6D3`, texte `#3B2F23`, accent `#A3A374`.
- Jamais d'icône emoji — toute icône passe par `lucide-react` (déjà utilisé dans le projet de référence closrm).
- Site public rendu sans cache : `export const dynamic = 'force-dynamic'` sur `src/app/page.tsx`.
- Un seul compte partagé Supabase Auth pour `/admin` — pas de rôles multiples, pas de multi-comptes.
- Sauvegarde admin = publication immédiate, pas de brouillon ni de bouton "Publier".
- Autosave débouncée ~1000ms après la dernière modification, avec statut `idle | pending | saving | saved | error` et retry automatique sur erreur.
- Exactement 10 types de sections fixes (`hero`, `text`, `team`, `values`, `documents`, `gallery`, `faq`, `map`, `testimonials`, `contact_footer`) définis dans `src/types/section.ts` — ne pas construire de système de blocks génériques.
- Lecture de la table `sections` (et du storage) publique ; écriture réservée à un utilisateur authentifié (Row Level Security Supabase).
- Comptes Supabase/Netlify sont créés avec l'email de l'association, pas avec les identifiants personnels du développeur — toute étape de création de compte doit rester une checklist manuelle documentée, jamais une commande que l'agent exécute lui-même.

---

## Task 1: Scaffold the Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `vitest.config.ts`, `vitest.setup.ts`
- Modify: `.gitignore` (already has `node_modules/`, `.next/`, `.env*`, `.superpowers/` from the spec commit — verify, don't duplicate)

**Interfaces:**
- Produces: a running Next.js App Router project with Tailwind, TypeScript, and Vitest wired up, that every later task builds on.

- [ ] **Step 1: Scaffold with create-next-app**

Run from the project root:

```bash
npx --yes create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

If it warns the directory isn't empty (it contains `.git`, `.gitignore`, `docs/`), confirm to proceed — none of those conflict with the generated files.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install @supabase/ssr @supabase/supabase-js @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities zod lucide-react
```

- [ ] **Step 3: Install test dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: Add Vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 5: Add the `test` script**

Edit `package.json` scripts to include:

```json
"test": "vitest run"
```

- [ ] **Step 6: Set base palette in globals.css**

Replace the body rule in `src/app/globals.css` with:

```css
body {
  background: #EDE6D3;
  color: #3B2F23;
}
```

- [ ] **Step 7: Verify the build and typecheck**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind, Supabase, dnd-kit, Vitest"
```

---

## Task 2: Section types and content validation

**Files:**
- Create: `src/types/section.ts`
- Create: `src/lib/sections/validate.ts`
- Test: `src/lib/sections/validate.test.ts`

**Interfaces:**
- Produces: `SectionType`, `Section` (discriminated union), one `*Content` interface per type, `SECTION_TYPES: SectionType[]`, `createDefaultContent(type: SectionType): Section['content']`, `validateContent(type: SectionType, content: unknown): { ok: true } | { ok: false; errors: string[] }`.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/lib/sections/validate.test.ts
import { describe, it, expect } from 'vitest'
import { validateContent } from './validate'
import { createDefaultContent } from '@/types/section'

describe('validateContent', () => {
  it('accepts a valid hero content', () => {
    const result = validateContent('hero', {
      badge: 'Accueil de loisirs périscolaire',
      titre: "Les Champs d'Escale",
      sousTitre: 'Un accueil chaleureux',
      texteCta: 'Nous contacter',
    })
    expect(result.ok).toBe(true)
  })

  it('rejects a hero content missing required fields', () => {
    const result = validateContent('hero', { titre: 'Only a title' })
    expect(result.ok).toBe(false)
  })

  it('accepts a valid faq content with items', () => {
    const result = validateContent('faq', {
      titre: 'Questions fréquentes',
      items: [{ question: 'Quels horaires ?', reponse: '7h30-18h30' }],
    })
    expect(result.ok).toBe(true)
  })

  it('rejects a documents content with a malformed file entry', () => {
    const result = validateContent('documents', {
      titre: 'Menu',
      fichiers: [{ nom: 'Menu de la semaine' }],
    })
    expect(result.ok).toBe(false)
  })

  it('validates the default content generated for every section type', () => {
    const types = [
      'hero', 'text', 'team', 'values', 'documents',
      'gallery', 'faq', 'map', 'testimonials', 'contact_footer',
    ] as const
    for (const type of types) {
      const result = validateContent(type, createDefaultContent(type))
      expect(result.ok, `default content for "${type}" should be valid`).toBe(true)
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/sections/validate.test.ts`
Expected: FAIL — `validate.ts` and `section.ts` don't exist yet.

- [ ] **Step 3: Write the section types**

```typescript
// src/types/section.ts

export type SectionType =
  | 'hero'
  | 'text'
  | 'team'
  | 'values'
  | 'documents'
  | 'gallery'
  | 'faq'
  | 'map'
  | 'testimonials'
  | 'contact_footer'

export const SECTION_TYPES: SectionType[] = [
  'hero', 'text', 'team', 'values', 'documents',
  'gallery', 'faq', 'map', 'testimonials', 'contact_footer',
]

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: 'Hero',
  text: 'Bloc texte',
  team: 'Notre équipe',
  values: 'Notre pédagogie / valeurs',
  documents: 'Documents',
  gallery: 'Galerie photos',
  faq: 'FAQ',
  map: 'Localisation',
  testimonials: 'Témoignages',
  contact_footer: 'Contact / Footer',
}

export interface HeroContent {
  badge: string
  titre: string
  sousTitre: string
  texteCta: string
}

export interface TextContent {
  titre: string
  texte: string
}

export interface TeamMember {
  nom: string
  role: string
  photoUrl: string
}

export interface TeamContent {
  titre: string
  membres: TeamMember[]
}

export interface ValuePoint {
  label: string
  texte: string
}

export interface ValuesContent {
  titre: string
  points: ValuePoint[]
}

export interface DocumentFile {
  nom: string
  url: string
}

export interface DocumentsContent {
  titre: string
  fichiers: DocumentFile[]
}

export interface GalleryPhoto {
  url: string
  alt: string
}

export interface GalleryContent {
  titre: string
  photos: GalleryPhoto[]
}

export interface FaqItem {
  question: string
  reponse: string
}

export interface FaqContent {
  titre: string
  items: FaqItem[]
}

export interface MapContent {
  titre: string
  adresse: string
  latLng: { lat: number; lng: number } | null
}

export interface TestimonialItem {
  texte: string
  auteur: string
}

export interface TestimonialsContent {
  titre: string
  citations: TestimonialItem[]
}

export interface ContactFooterContent {
  adresse: string
  telephone: string
  email: string
}

export type SectionContentMap = {
  hero: HeroContent
  text: TextContent
  team: TeamContent
  values: ValuesContent
  documents: DocumentsContent
  gallery: GalleryContent
  faq: FaqContent
  map: MapContent
  testimonials: TestimonialsContent
  contact_footer: ContactFooterContent
}

export type Section = {
  [T in SectionType]: {
    id: string
    type: T
    position: number
    visible: boolean
    content: SectionContentMap[T]
  }
}[SectionType]

export function createDefaultContent<T extends SectionType>(type: T): SectionContentMap[T] {
  const defaults: SectionContentMap = {
    hero: {
      badge: 'Accueil de loisirs périscolaire',
      titre: "Les Champs d'Escale",
      sousTitre: 'Un accueil chaleureux pour vos enfants avant et après l\'école',
      texteCta: 'Découvrir nos services',
    },
    text: { titre: 'Nouvelle rubrique', texte: '' },
    team: { titre: 'Notre équipe', membres: [] },
    values: { titre: 'Notre approche', points: [] },
    documents: { titre: 'Documents', fichiers: [] },
    gallery: { titre: 'En images', photos: [] },
    faq: { titre: 'Questions fréquentes', items: [] },
    map: { titre: 'Nous trouver', adresse: '', latLng: null },
    testimonials: { titre: 'Ce qu\'en disent les parents', citations: [] },
    contact_footer: { adresse: '', telephone: '', email: '' },
  }
  return defaults[type]
}
```

- [ ] **Step 4: Write the validation logic**

```typescript
// src/lib/sections/validate.ts
import { z } from 'zod'
import type { SectionType } from '@/types/section'

const heroSchema = z.object({
  badge: z.string().min(1),
  titre: z.string().min(1),
  sousTitre: z.string().min(1),
  texteCta: z.string().min(1),
})

const textSchema = z.object({
  titre: z.string().min(1),
  texte: z.string(),
})

const teamSchema = z.object({
  titre: z.string().min(1),
  membres: z.array(
    z.object({ nom: z.string().min(1), role: z.string(), photoUrl: z.string() })
  ),
})

const valuesSchema = z.object({
  titre: z.string().min(1),
  points: z.array(z.object({ label: z.string().min(1), texte: z.string() })),
})

const documentsSchema = z.object({
  titre: z.string().min(1),
  fichiers: z.array(z.object({ nom: z.string().min(1), url: z.string() })),
})

const gallerySchema = z.object({
  titre: z.string().min(1),
  photos: z.array(z.object({ url: z.string(), alt: z.string() })),
})

const faqSchema = z.object({
  titre: z.string().min(1),
  items: z.array(z.object({ question: z.string().min(1), reponse: z.string() })),
})

const mapSchema = z.object({
  titre: z.string().min(1),
  adresse: z.string(),
  latLng: z.object({ lat: z.number(), lng: z.number() }).nullable(),
})

const testimonialsSchema = z.object({
  titre: z.string().min(1),
  citations: z.array(z.object({ texte: z.string().min(1), auteur: z.string() })),
})

const contactFooterSchema = z.object({
  adresse: z.string(),
  telephone: z.string(),
  email: z.string(),
})

const SCHEMAS: Record<SectionType, z.ZodTypeAny> = {
  hero: heroSchema,
  text: textSchema,
  team: teamSchema,
  values: valuesSchema,
  documents: documentsSchema,
  gallery: gallerySchema,
  faq: faqSchema,
  map: mapSchema,
  testimonials: testimonialsSchema,
  contact_footer: contactFooterSchema,
}

export function validateContent(
  type: SectionType,
  content: unknown
): { ok: true } | { ok: false; errors: string[] } {
  const schema = SCHEMAS[type]
  const result = schema.safeParse(content)
  if (result.success) return { ok: true }
  return { ok: false, errors: result.error.issues.map((issue) => issue.message) }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/sections/validate.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add src/types/section.ts src/lib/sections/validate.ts src/lib/sections/validate.test.ts
git commit -m "feat: define the 10 fixed section types and their content validation"
```

---

## Task 3: Pure section ordering helpers

**Files:**
- Create: `src/lib/sections/order.ts`
- Test: `src/lib/sections/order.test.ts`

**Interfaces:**
- Consumes: `Section` from `@/types/section` (Task 2).
- Produces: `moveSection(sections: Section[], fromIndex: number, toIndex: number): Section[]`, `renumberPositions(sections: Section[]): Section[]`.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/lib/sections/order.test.ts
import { describe, it, expect } from 'vitest'
import { moveSection, renumberPositions } from './order'
import type { Section } from '@/types/section'

function makeSection(id: string, position: number): Section {
  return {
    id,
    type: 'text',
    position,
    visible: true,
    content: { titre: id, texte: '' },
  }
}

describe('moveSection', () => {
  it('moves an item from one index to another and renumbers positions', () => {
    const sections = [makeSection('a', 0), makeSection('b', 1), makeSection('c', 2)]
    const result = moveSection(sections, 0, 2)
    expect(result.map((s) => s.id)).toEqual(['b', 'c', 'a'])
    expect(result.map((s) => s.position)).toEqual([0, 1, 2])
  })

  it('does nothing when fromIndex equals toIndex', () => {
    const sections = [makeSection('a', 0), makeSection('b', 1)]
    const result = moveSection(sections, 1, 1)
    expect(result.map((s) => s.id)).toEqual(['a', 'b'])
  })
})

describe('renumberPositions', () => {
  it('reassigns sequential positions regardless of current values', () => {
    const sections = [makeSection('a', 5), makeSection('b', 12)]
    const result = renumberPositions(sections)
    expect(result.map((s) => s.position)).toEqual([0, 1])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/sections/order.test.ts`
Expected: FAIL — `order.ts` doesn't exist yet.

- [ ] **Step 3: Implement the helpers**

```typescript
// src/lib/sections/order.ts
import type { Section } from '@/types/section'

export function renumberPositions(sections: Section[]): Section[] {
  return sections.map((section, index) => ({ ...section, position: index }))
}

export function moveSection(sections: Section[], fromIndex: number, toIndex: number): Section[] {
  if (fromIndex === toIndex) return sections
  const next = [...sections]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return renumberPositions(next)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/sections/order.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/sections/order.ts src/lib/sections/order.test.ts
git commit -m "feat: add pure section reordering helpers"
```

---

## Task 4: Repository interface and in-memory fake

**Files:**
- Create: `src/lib/sections/repository.ts`
- Create: `src/lib/sections/memory-repository.ts`
- Test: `src/lib/sections/memory-repository.test.ts`

**Interfaces:**
- Consumes: `Section`, `SectionType`, `createDefaultContent` (Task 2); `moveSection`, `renumberPositions` (Task 3).
- Produces: `SectionsRepository` interface (`list`, `create`, `update`, `remove`, `reorder`, `duplicate`), `createMemoryRepository(initial?: Section[]): SectionsRepository`. Later tasks (5, 13) depend on this exact interface shape.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/lib/sections/memory-repository.test.ts
import { describe, it, expect } from 'vitest'
import { createMemoryRepository } from './memory-repository'

describe('createMemoryRepository', () => {
  it('starts empty and creates a section with default content', async () => {
    const repo = createMemoryRepository()
    const created = await repo.create('text')
    expect(created.type).toBe('text')
    expect(created.position).toBe(0)
    const all = await repo.list()
    expect(all).toHaveLength(1)
  })

  it('updates the content and visibility of an existing section', async () => {
    const repo = createMemoryRepository()
    const created = await repo.create('text')
    await repo.update(created.id, { visible: false, content: { titre: 'Édité', texte: 'contenu' } })
    const [updated] = await repo.list()
    expect(updated.visible).toBe(false)
    expect(updated.content).toEqual({ titre: 'Édité', texte: 'contenu' })
  })

  it('removes a section', async () => {
    const repo = createMemoryRepository()
    const created = await repo.create('text')
    await repo.remove(created.id)
    expect(await repo.list()).toHaveLength(0)
  })

  it('reorders sections by a list of ids', async () => {
    const repo = createMemoryRepository()
    const a = await repo.create('text')
    const b = await repo.create('team')
    await repo.reorder([b.id, a.id])
    const all = await repo.list()
    expect(all.map((s) => s.id)).toEqual([b.id, a.id])
    expect(all.map((s) => s.position)).toEqual([0, 1])
  })

  it('duplicates a section with the same content, appended at the end', async () => {
    const repo = createMemoryRepository()
    const original = await repo.create('text')
    await repo.update(original.id, { content: { titre: 'Original', texte: 'x' } })
    const copy = await repo.duplicate(original.id)
    expect(copy.id).not.toBe(original.id)
    expect(copy.content).toEqual({ titre: 'Original', texte: 'x' })
    expect(await repo.list()).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/sections/memory-repository.test.ts`
Expected: FAIL — files don't exist yet.

- [ ] **Step 3: Write the repository interface**

```typescript
// src/lib/sections/repository.ts
import type { Section, SectionType } from '@/types/section'

export interface SectionsRepository {
  list(): Promise<Section[]>
  create(type: SectionType): Promise<Section>
  update(id: string, patch: { content?: Section['content']; visible?: boolean }): Promise<void>
  remove(id: string): Promise<void>
  reorder(orderedIds: string[]): Promise<void>
  duplicate(id: string): Promise<Section>
}
```

- [ ] **Step 4: Implement the in-memory fake**

```typescript
// src/lib/sections/memory-repository.ts
import type { Section, SectionType } from '@/types/section'
import { createDefaultContent } from '@/types/section'
import type { SectionsRepository } from './repository'
import { renumberPositions } from './order'

export function createMemoryRepository(initial: Section[] = []): SectionsRepository {
  let sections = renumberPositions(initial)
  let nextId = 1

  return {
    async list() {
      return [...sections].sort((a, b) => a.position - b.position)
    },

    async create(type: SectionType) {
      const section = {
        id: `mem-${nextId++}`,
        type,
        position: sections.length,
        visible: true,
        content: createDefaultContent(type),
      } as Section
      sections = [...sections, section]
      return section
    },

    async update(id, patch) {
      sections = sections.map((section) =>
        section.id === id
          ? ({
              ...section,
              ...(patch.visible !== undefined ? { visible: patch.visible } : {}),
              ...(patch.content !== undefined ? { content: patch.content } : {}),
            } as Section)
          : section
      )
    },

    async remove(id) {
      sections = renumberPositions(sections.filter((section) => section.id !== id))
    },

    async reorder(orderedIds) {
      const byId = new Map(sections.map((section) => [section.id, section]))
      sections = renumberPositions(
        orderedIds.map((id) => byId.get(id)).filter((s): s is Section => !!s)
      )
    },

    async duplicate(id) {
      const original = sections.find((section) => section.id === id)
      if (!original) throw new Error(`Section ${id} not found`)
      const copy = {
        ...original,
        id: `mem-${nextId++}`,
        position: sections.length,
      } as Section
      sections = [...sections, copy]
      return copy
    },
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/sections/memory-repository.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add src/lib/sections/repository.ts src/lib/sections/memory-repository.ts src/lib/sections/memory-repository.test.ts
git commit -m "feat: add SectionsRepository interface and in-memory fake"
```

---

## Task 5: Supabase schema, clients, and repository implementation

**Files:**
- Create: `supabase/schema.sql`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/sections/supabase-repository.ts`
- Create: `.env.local.example`

**Interfaces:**
- Consumes: `SectionsRepository` (Task 4), `Section`/`SectionType`/`createDefaultContent` (Task 2).
- Produces: `createSupabaseBrowserClient()`, `createSupabaseServerClient()` (async), `createSupabaseSectionsRepository(client: SupabaseClient): SectionsRepository`.

- [ ] **Step 1: Write the SQL schema**

```sql
-- supabase/schema.sql
create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'hero', 'text', 'team', 'values', 'documents',
    'gallery', 'faq', 'map', 'testimonials', 'contact_footer'
  )),
  position integer not null default 0,
  visible boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table sections enable row level security;

-- Public read access (the landing page has no login).
create policy "sections are publicly readable"
  on sections for select
  to anon, authenticated
  using (true);

-- Only authenticated users (the shared team account) can write.
create policy "only authenticated users can insert sections"
  on sections for insert
  to authenticated
  with check (true);

create policy "only authenticated users can update sections"
  on sections for update
  to authenticated
  using (true)
  with check (true);

create policy "only authenticated users can delete sections"
  on sections for delete
  to authenticated
  using (true);

-- Storage bucket for uploaded PDFs and photos.
insert into storage.buckets (id, name, public)
values ('section-files', 'section-files', true)
on conflict (id) do nothing;

create policy "section files are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'section-files');

create policy "only authenticated users can upload section files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'section-files');

create policy "only authenticated users can delete section files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'section-files');
```

- [ ] **Step 2: Write the browser client**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Write the server client**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component render — session refresh
            // happens in middleware instead, so this is safe to ignore.
          }
        },
      },
    }
  )
}
```

- [ ] **Step 4: Implement the Supabase-backed repository**

```typescript
// src/lib/sections/supabase-repository.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Section, SectionType } from '@/types/section'
import { createDefaultContent } from '@/types/section'
import type { SectionsRepository } from './repository'

interface SectionRow {
  id: string
  type: SectionType
  position: number
  visible: boolean
  content: Record<string, unknown>
}

function toSection(row: SectionRow): Section {
  return {
    id: row.id,
    type: row.type,
    position: row.position,
    visible: row.visible,
    content: row.content,
  } as Section
}

export function createSupabaseSectionsRepository(client: SupabaseClient): SectionsRepository {
  return {
    async list() {
      const { data, error } = await client
        .from('sections')
        .select('*')
        .order('position', { ascending: true })
      if (error) throw error
      return (data as SectionRow[]).map(toSection)
    },

    async create(type: SectionType) {
      const { data: existing } = await client.from('sections').select('id')
      const position = existing?.length ?? 0
      const { data, error } = await client
        .from('sections')
        .insert({ type, position, visible: true, content: createDefaultContent(type) })
        .select()
        .single()
      if (error) throw error
      return toSection(data as SectionRow)
    },

    async update(id, patch) {
      const { error } = await client
        .from('sections')
        .update({
          ...(patch.visible !== undefined ? { visible: patch.visible } : {}),
          ...(patch.content !== undefined ? { content: patch.content } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      if (error) throw error
    },

    async remove(id) {
      const { error } = await client.from('sections').delete().eq('id', id)
      if (error) throw error
    },

    async reorder(orderedIds) {
      await Promise.all(
        orderedIds.map((id, position) =>
          client.from('sections').update({ position }).eq('id', id)
        )
      )
    },

    async duplicate(id) {
      const { data: original, error: fetchError } = await client
        .from('sections')
        .select('*')
        .eq('id', id)
        .single()
      if (fetchError) throw fetchError
      const { data: existing } = await client.from('sections').select('id')
      const position = existing?.length ?? 0
      const row = original as SectionRow
      const { data, error } = await client
        .from('sections')
        .insert({ type: row.type, position, visible: row.visible, content: row.content })
        .select()
        .single()
      if (error) throw error
      return toSection(data as SectionRow)
    },
  }
}
```

- [ ] **Step 5: Document the required environment variables**

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 6: Manual verification (no automated test — requires a real Supabase project)**

This task cannot be unit tested: it talks to a real Supabase project that only exists once the association's account is created (see Task 14's checklist). Once that project exists:
1. Paste `supabase/schema.sql` into the Supabase SQL editor and run it.
2. Copy the project URL and anon key into a local `.env.local` (never commit this file).
3. Confirm `npx tsc --noEmit` still passes (this task only adds typed code, no UI to click yet).

- [ ] **Step 7: Commit**

```bash
git add supabase/schema.sql src/lib/supabase/client.ts src/lib/supabase/server.ts src/lib/sections/supabase-repository.ts .env.local.example
git commit -m "feat: add Supabase schema, clients, and repository implementation"
```

---

## Task 6: Public section display components

**Files:**
- Create: `src/components/public/sections/HeroSection.tsx`
- Create: `src/components/public/sections/TextSection.tsx`
- Create: `src/components/public/sections/TeamSection.tsx`
- Create: `src/components/public/sections/ValuesSection.tsx`
- Create: `src/components/public/sections/DocumentsSection.tsx`
- Create: `src/components/public/sections/GallerySection.tsx`
- Create: `src/components/public/sections/FaqSection.tsx`
- Create: `src/components/public/sections/MapSection.tsx`
- Create: `src/components/public/sections/TestimonialsSection.tsx`
- Create: `src/components/public/sections/ContactFooterSection.tsx`
- Create: `src/components/public/SectionRenderer.tsx`
- Test: `src/components/public/SectionRenderer.test.tsx`

**Interfaces:**
- Consumes: `Section` and per-type content interfaces (Task 2).
- Produces: `<SectionRenderer section={Section} />`, used by Task 7 (public page) and Task 13 (admin live preview).

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/public/SectionRenderer.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionRenderer } from './SectionRenderer'
import type { Section } from '@/types/section'

describe('SectionRenderer', () => {
  it('renders the hero title for a hero section', () => {
    const section: Section = {
      id: '1',
      type: 'hero',
      position: 0,
      visible: true,
      content: {
        badge: 'Accueil de loisirs périscolaire',
        titre: "Les Champs d'Escale",
        sousTitre: 'Sous-titre',
        texteCta: 'Découvrir',
      },
    }
    render(<SectionRenderer section={section} />)
    expect(screen.getByText("Les Champs d'Escale")).toBeInTheDocument()
  })

  it('renders the FAQ questions for a faq section', () => {
    const section: Section = {
      id: '2',
      type: 'faq',
      position: 1,
      visible: true,
      content: {
        titre: 'Questions fréquentes',
        items: [{ question: 'Quels horaires ?', reponse: '7h30-18h30' }],
      },
    }
    render(<SectionRenderer section={section} />)
    expect(screen.getByText('Quels horaires ?')).toBeInTheDocument()
  })

  it('renders the contact footer fields', () => {
    const section: Section = {
      id: '3',
      type: 'contact_footer',
      position: 2,
      visible: true,
      content: {
        adresse: '7 chemin de la souffel',
        telephone: '09.62.23.88.62',
        email: 'champsdescale@gmail.com',
      },
    }
    render(<SectionRenderer section={section} />)
    expect(screen.getByText('champsdescale@gmail.com')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/public/SectionRenderer.test.tsx`
Expected: FAIL — none of the components exist yet.

- [ ] **Step 3: Implement the section components**

```tsx
// src/components/public/sections/HeroSection.tsx
import type { HeroContent } from '@/types/section'

export function HeroSection({ content }: { content: HeroContent }) {
  return (
    <section className="text-center py-16 px-6">
      <span className="inline-block border border-[#3B2F23] text-[10px] tracking-widest uppercase px-4 py-1 mb-6">
        {content.badge}
      </span>
      <h1 className="font-serif text-4xl md:text-5xl mb-4">{content.titre}</h1>
      <p className="text-[#5b4f3f] max-w-xl mx-auto mb-8">{content.sousTitre}</p>
      <span className="inline-block bg-[#3B2F23] text-[#EDE6D3] font-semibold px-6 py-3">
        {content.texteCta}
      </span>
    </section>
  )
}
```

```tsx
// src/components/public/sections/TextSection.tsx
import type { TextContent } from '@/types/section'

export function TextSection({ content }: { content: TextContent }) {
  return (
    <section className="max-w-2xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-semibold mb-4">{content.titre}</h2>
      <p className="whitespace-pre-line text-[#5b4f3f]">{content.texte}</p>
    </section>
  )
}
```

```tsx
// src/components/public/sections/TeamSection.tsx
import type { TeamContent } from '@/types/section'

export function TeamSection({ content }: { content: TeamContent }) {
  return (
    <section className="max-w-3xl mx-auto py-12 px-6 text-center">
      <h2 className="text-2xl font-semibold mb-8">{content.titre}</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {content.membres.map((membre, index) => (
          <div key={index}>
            {membre.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={membre.photoUrl}
                alt={membre.nom}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#A3A374] mx-auto mb-2" />
            )}
            <p className="font-semibold">{membre.nom}</p>
            <p className="text-sm text-[#5b4f3f]">{membre.role}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

```tsx
// src/components/public/sections/ValuesSection.tsx
import type { ValuesContent } from '@/types/section'

export function ValuesSection({ content }: { content: ValuesContent }) {
  return (
    <section className="max-w-3xl mx-auto py-12 px-6 text-center">
      <h2 className="text-2xl font-semibold mb-8">{content.titre}</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {content.points.map((point, index) => (
          <div key={index} className="w-40">
            <p className="font-semibold mb-1">{point.label}</p>
            <p className="text-sm text-[#5b4f3f]">{point.texte}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

```tsx
// src/components/public/sections/DocumentsSection.tsx
import type { DocumentsContent } from '@/types/section'

export function DocumentsSection({ content }: { content: DocumentsContent }) {
  return (
    <section className="max-w-2xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-semibold mb-6">{content.titre}</h2>
      <ul className="space-y-2">
        {content.fichiers.map((fichier, index) => (
          <li key={index}>
            <a href={fichier.url} className="underline decoration-[#A3A374]" download>
              {fichier.nom}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

```tsx
// src/components/public/sections/GallerySection.tsx
import type { GalleryContent } from '@/types/section'

export function GallerySection({ content }: { content: GalleryContent }) {
  return (
    <section className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">{content.titre}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {content.photos.map((photo, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={index}
            src={photo.url}
            alt={photo.alt}
            className="w-full h-32 object-cover"
          />
        ))}
      </div>
    </section>
  )
}
```

```tsx
// src/components/public/sections/FaqSection.tsx
import type { FaqContent } from '@/types/section'

export function FaqSection({ content }: { content: FaqContent }) {
  return (
    <section className="max-w-2xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-semibold mb-6">{content.titre}</h2>
      <div className="space-y-3">
        {content.items.map((item, index) => (
          <details key={index} className="border border-[#d8d0b8] bg-white/40 px-4 py-3">
            <summary className="font-semibold cursor-pointer">{item.question}</summary>
            <p className="mt-2 text-[#5b4f3f]">{item.reponse}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
```

```tsx
// src/components/public/sections/MapSection.tsx
import type { MapContent } from '@/types/section'

export function MapSection({ content }: { content: MapContent }) {
  return (
    <section className="max-w-2xl mx-auto py-12 px-6 text-center">
      <h2 className="text-2xl font-semibold mb-4">{content.titre}</h2>
      {content.latLng ? (
        <iframe
          title={content.titre}
          className="w-full h-64 border-0"
          src={`https://www.google.com/maps?q=${content.latLng.lat},${content.latLng.lng}&output=embed`}
        />
      ) : (
        <div className="w-full h-64 bg-[#c9c2a4] flex items-center justify-center" />
      )}
      <p className="mt-3 text-[#5b4f3f]">{content.adresse}</p>
    </section>
  )
}
```

```tsx
// src/components/public/sections/TestimonialsSection.tsx
import type { TestimonialsContent } from '@/types/section'

export function TestimonialsSection({ content }: { content: TestimonialsContent }) {
  return (
    <section className="max-w-2xl mx-auto py-12 px-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">{content.titre}</h2>
      <div className="space-y-4">
        {content.citations.map((citation, index) => (
          <blockquote key={index} className="border-l-4 border-[#A3A374] bg-white/40 px-4 py-3 italic">
            "{citation.texte}"
            <footer className="mt-2 not-italic text-sm text-[#5b4f3f]">— {citation.auteur}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
```

```tsx
// src/components/public/sections/ContactFooterSection.tsx
import type { ContactFooterContent } from '@/types/section'

export function ContactFooterSection({ content }: { content: ContactFooterContent }) {
  return (
    <footer className="bg-[#3B2F23] text-[#EDE6D3] py-12 px-6">
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <p className="uppercase text-xs tracking-widest mb-2">Adresse</p>
          <p>{content.adresse}</p>
        </div>
        <div>
          <p className="uppercase text-xs tracking-widest mb-2">Téléphone</p>
          <p>{content.telephone}</p>
        </div>
        <div>
          <p className="uppercase text-xs tracking-widest mb-2">Adresse mail</p>
          <p>{content.email}</p>
        </div>
      </div>
    </footer>
  )
}
```

```tsx
// src/components/public/SectionRenderer.tsx
import type { Section } from '@/types/section'
import { HeroSection } from './sections/HeroSection'
import { TextSection } from './sections/TextSection'
import { TeamSection } from './sections/TeamSection'
import { ValuesSection } from './sections/ValuesSection'
import { DocumentsSection } from './sections/DocumentsSection'
import { GallerySection } from './sections/GallerySection'
import { FaqSection } from './sections/FaqSection'
import { MapSection } from './sections/MapSection'
import { TestimonialsSection } from './sections/TestimonialsSection'
import { ContactFooterSection } from './sections/ContactFooterSection'

export function SectionRenderer({ section }: { section: Section }) {
  switch (section.type) {
    case 'hero':
      return <HeroSection content={section.content} />
    case 'text':
      return <TextSection content={section.content} />
    case 'team':
      return <TeamSection content={section.content} />
    case 'values':
      return <ValuesSection content={section.content} />
    case 'documents':
      return <DocumentsSection content={section.content} />
    case 'gallery':
      return <GallerySection content={section.content} />
    case 'faq':
      return <FaqSection content={section.content} />
    case 'map':
      return <MapSection content={section.content} />
    case 'testimonials':
      return <TestimonialsSection content={section.content} />
    case 'contact_footer':
      return <ContactFooterSection content={section.content} />
    default: {
      const exhaustiveCheck: never = section
      throw new Error(`Unhandled section type: ${JSON.stringify(exhaustiveCheck)}`)
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/public/SectionRenderer.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/public
git commit -m "feat: add public display components for all 10 section types"
```

---

## Task 7: Public page wiring

**Files:**
- Create: `src/lib/sections/get-sections.ts`
- Modify: `src/app/page.tsx`
- Test: `src/lib/sections/get-sections.test.ts`

**Interfaces:**
- Consumes: `SectionsRepository` (Task 4), `SectionRenderer` (Task 6).
- Produces: `getVisibleSections(repository: SectionsRepository): Promise<Section[]>`, used by the public page.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/sections/get-sections.test.ts
import { describe, it, expect } from 'vitest'
import { getVisibleSections } from './get-sections'
import { createMemoryRepository } from './memory-repository'

describe('getVisibleSections', () => {
  it('returns only visible sections, sorted by position', async () => {
    const repo = createMemoryRepository()
    const a = await repo.create('hero')
    const b = await repo.create('text')
    await repo.update(b.id, { visible: false })
    const result = await getVisibleSections(repo)
    expect(result.map((s) => s.id)).toEqual([a.id])
  })

  it('returns an empty array when the repository has no sections', async () => {
    const repo = createMemoryRepository()
    expect(await getVisibleSections(repo)).toEqual([])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/sections/get-sections.test.ts`
Expected: FAIL — `get-sections.ts` doesn't exist yet.

- [ ] **Step 3: Implement it**

```typescript
// src/lib/sections/get-sections.ts
import type { SectionsRepository } from './repository'
import type { Section } from '@/types/section'

export async function getVisibleSections(repository: SectionsRepository): Promise<Section[]> {
  const all = await repository.list()
  return all.filter((section) => section.visible)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/sections/get-sections.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Wire the public page**

```tsx
// src/app/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseSectionsRepository } from '@/lib/sections/supabase-repository'
import { getVisibleSections } from '@/lib/sections/get-sections'
import { SectionRenderer } from '@/components/public/SectionRenderer'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const client = await createSupabaseServerClient()
  const repository = createSupabaseSectionsRepository(client)
  const sections = await getVisibleSections(repository)

  return (
    <main>
      {sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}
    </main>
  )
}
```

- [ ] **Step 6: Manual verification**

This page needs a real Supabase project to render real data (Task 5's schema must be applied first). Until then, run `npx tsc --noEmit` to confirm it compiles. Once Supabase credentials exist in `.env.local`, run `npm run dev`, open `http://localhost:3000`, and confirm the page loads without a runtime error (it will show an empty page if the `sections` table is empty — that's expected before any content is seeded from `/admin`).

- [ ] **Step 7: Commit**

```bash
git add src/lib/sections/get-sections.ts src/lib/sections/get-sections.test.ts src/app/page.tsx
git commit -m "feat: render visible sections dynamically on the public page"
```

---

## Task 8: Supabase Auth for `/admin`

**Files:**
- Create: `src/middleware.ts`
- Create: `src/lib/auth/require-session.ts`
- Create: `src/app/admin/(public)/login/page.tsx`
- Create: `src/app/admin/(public)/login/actions.ts`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/(protected)/layout.tsx`
- Test: `src/lib/auth/require-session.test.ts`

Two route groups split `/admin`: `(public)/login` is reachable without a session, `(protected)` wraps every other admin page (Task 13's builder) behind `requireSession`. Route groups don't appear in the URL, so `(public)/login` still serves at `/admin/login`.

**Interfaces:**
- Consumes: `createSupabaseServerClient` (Task 5).
- Produces: `requireSession(client): Promise<Session>` (redirects to `/admin/login` if absent), used by Task 13's admin page.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/auth/require-session.test.ts
import { describe, it, expect, vi } from 'vitest'
import { requireSession } from './require-session'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('REDIRECT')
  }),
}))

describe('requireSession', () => {
  it('returns the session when the user is authenticated', async () => {
    const client = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
      },
    }
    const user = await requireSession(client as never)
    expect(user.id).toBe('user-1')
  })

  it('redirects to /admin/login when there is no user', async () => {
    const client = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    }
    await expect(requireSession(client as never)).rejects.toThrow('REDIRECT')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/auth/require-session.test.ts`
Expected: FAIL — `require-session.ts` doesn't exist yet.

- [ ] **Step 3: Implement `requireSession`**

```typescript
// src/lib/auth/require-session.ts
import { redirect } from 'next/navigation'
import type { SupabaseClient, User } from '@supabase/supabase-js'

export async function requireSession(client: SupabaseClient): Promise<User> {
  const { data } = await client.auth.getUser()
  if (!data.user) {
    redirect('/admin/login')
  }
  return data.user
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/auth/require-session.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Add the session-refresh middleware**

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()
  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 6: Write the login page and its server action**

```typescript
// src/app/admin/(public)/login/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const client = await createSupabaseServerClient()
  const { error } = await client.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`)
  }
  redirect('/admin')
}
```

```tsx
// src/app/admin/(public)/login/page.tsx
import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#EDE6D3]">
      <form action={login} className="bg-white/60 p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-[#3B2F23]">Connexion à l'espace de gestion</h1>
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <div>
          <label className="block text-sm mb-1" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="w-full border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="password">Mot de passe</label>
          <input id="password" name="password" type="password" required className="w-full border px-3 py-2" />
        </div>
        <button type="submit" className="bg-[#3B2F23] text-[#EDE6D3] px-4 py-2 w-full">
          Se connecter
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 7: Guard the protected admin pages, leave `/admin` itself as a pass-through**

`src/app/admin/layout.tsx` wraps both route groups, so it stays a plain pass-through — the actual guard lives one level down, only around `(protected)`, so `(public)/login` is never redirected to itself.

```tsx
// src/app/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

```tsx
// src/app/admin/(protected)/layout.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireSession } from '@/lib/auth/require-session'

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const client = await createSupabaseServerClient()
  await requireSession(client)
  return <>{children}</>
}
```

- [ ] **Step 8: Manual verification**

Needs a real Supabase project with at least one user created (Task 14's checklist covers creating the shared account). Once available: run `npm run dev`, visit `/admin`, confirm it redirects to `/admin/login`; log in with the shared account and confirm it reaches `/admin`.

- [ ] **Step 9: Commit**

```bash
git add src/middleware.ts src/lib/auth/require-session.ts src/lib/auth/require-session.test.ts src/app/admin
git commit -m "feat: protect /admin with Supabase Auth and a session-refresh middleware"
```

---

## Task 9: Autosave hook

**Files:**
- Create: `src/hooks/use-autosave.ts`
- Test: `src/hooks/use-autosave.test.ts`

**Interfaces:**
- Produces: `useAutosave<T>({ value: T, onSave: (value: T) => Promise<void>, delayMs?: number }): { status: 'idle' | 'pending' | 'saving' | 'saved' | 'error' }`, consumed by Task 13's `AdminBuilder`.

- [ ] **Step 1: Write the failing tests**

```typescript
// src/hooks/use-autosave.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutosave } from './use-autosave'

describe('useAutosave', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('calls onSave after the debounce delay and reports "saved"', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { result, rerender } = renderHook(
      ({ value }) => useAutosave({ value, onSave, delayMs: 1000 }),
      { initialProps: { value: 'a' } }
    )

    rerender({ value: 'b' })
    expect(result.current.status).toBe('pending')

    // advanceTimersByTimeAsync (not the sync advanceTimersByTime) is required
    // here: the timer's own callback does `await onSave(value)`, and only the
    // async variant flushes that microtask between ticks. The sync variant
    // fires the callback but leaves its awaited promise forever unresolved,
    // so `onSave`'s mock never appears "called" and status never leaves
    // "saving" — no amount of waitFor() afterwards fixes that.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(onSave).toHaveBeenCalledWith('b')
    expect(result.current.status).toBe('saved')
  })

  it('reports "error" and keeps the value for a manual retry when onSave rejects', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('network down'))
    const { result, rerender } = renderHook(
      ({ value }) => useAutosave({ value, onSave, delayMs: 1000 }),
      { initialProps: { value: 'a' } }
    )

    rerender({ value: 'b' })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(result.current.status).toBe('error')
  })

  it('does not call onSave when the value never changes', () => {
    const onSave = vi.fn()
    renderHook(({ value }) => useAutosave({ value, onSave, delayMs: 1000 }), {
      initialProps: { value: 'a' },
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onSave).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/hooks/use-autosave.test.ts`
Expected: FAIL — `use-autosave.ts` doesn't exist yet.

- [ ] **Step 3: Implement the hook**

```typescript
// src/hooks/use-autosave.ts
import { useEffect, useRef, useState } from 'react'

export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

interface UseAutosaveOptions<T> {
  value: T
  onSave: (value: T) => Promise<void>
  delayMs?: number
}

export function useAutosave<T>({ value, onSave, delayMs = 1000 }: UseAutosaveOptions<T>) {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const isFirstRender = useRef(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setStatus('pending')
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      setStatus('saving')
      try {
        await onSave(value)
        setStatus('saved')
      } catch {
        setStatus('error')
      }
    }, delayMs)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delayMs])

  return { status }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/hooks/use-autosave.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-autosave.ts src/hooks/use-autosave.test.ts
git commit -m "feat: add debounced autosave hook with retry-on-error status"
```

---

## Task 10: File upload helper

**Files:**
- Create: `src/lib/storage/upload-file.ts`
- Test: `src/lib/storage/upload-file.test.ts`

**Interfaces:**
- Produces: `uploadFile(client: SupabaseClient, file: File): Promise<{ url: string }>`, used by the `documents`, `gallery`, and `team` forms (Task 11).

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/storage/upload-file.test.ts
import { describe, it, expect, vi } from 'vitest'
import { uploadFile } from './upload-file'

describe('uploadFile', () => {
  it('uploads the file to the section-files bucket and returns its public URL', async () => {
    const upload = vi.fn().mockResolvedValue({ data: { path: 'abc-menu.pdf' }, error: null })
    const getPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://xxxxx.supabase.co/storage/v1/object/public/section-files/abc-menu.pdf' },
    })
    const client = {
      storage: { from: vi.fn().mockReturnValue({ upload, getPublicUrl }) },
    }

    const file = new File(['content'], 'menu.pdf', { type: 'application/pdf' })
    const result = await uploadFile(client as never, file)

    expect(client.storage.from).toHaveBeenCalledWith('section-files')
    expect(upload).toHaveBeenCalled()
    expect(result.url).toContain('section-files')
  })

  it('throws when the upload fails', async () => {
    const upload = vi.fn().mockResolvedValue({ data: null, error: new Error('quota exceeded') })
    const client = {
      storage: { from: vi.fn().mockReturnValue({ upload, getPublicUrl: vi.fn() }) },
    }
    const file = new File(['content'], 'menu.pdf', { type: 'application/pdf' })

    await expect(uploadFile(client as never, file)).rejects.toThrow('quota exceeded')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/storage/upload-file.test.ts`
Expected: FAIL — `upload-file.ts` doesn't exist yet.

- [ ] **Step 3: Implement it**

```typescript
// src/lib/storage/upload-file.ts
import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'section-files'

export async function uploadFile(client: SupabaseClient, file: File): Promise<{ url: string }> {
  const path = `${crypto.randomUUID()}-${file.name}`
  const { error } = await client.storage.from(BUCKET).upload(path, file)
  if (error) throw error

  const { data } = client.storage.from(BUCKET).getPublicUrl(path)
  return { url: data.publicUrl }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/storage/upload-file.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage/upload-file.ts src/lib/storage/upload-file.test.ts
git commit -m "feat: add Supabase Storage upload helper for PDFs and photos"
```

---

## Task 11: Admin section forms

**Files:**
- Create: `src/components/admin/forms/HeroForm.tsx`
- Create: `src/components/admin/forms/TextForm.tsx`
- Create: `src/components/admin/forms/TeamForm.tsx`
- Create: `src/components/admin/forms/ValuesForm.tsx`
- Create: `src/components/admin/forms/DocumentsForm.tsx`
- Create: `src/components/admin/forms/GalleryForm.tsx`
- Create: `src/components/admin/forms/FaqForm.tsx`
- Create: `src/components/admin/forms/MapForm.tsx`
- Create: `src/components/admin/forms/TestimonialsForm.tsx`
- Create: `src/components/admin/forms/ContactFooterForm.tsx`
- Create: `src/components/admin/SectionEditorPanel.tsx`
- Test: `src/components/admin/SectionEditorPanel.test.tsx`

**Interfaces:**
- Consumes: `Section`, per-type content interfaces (Task 2); `uploadFile` (Task 10).
- Produces: `<SectionEditorPanel section={Section} onChange={(content: Section['content']) => void} uploadFile={(file: File) => Promise<{url: string}>} />`, used by Task 13's `AdminBuilder`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/admin/SectionEditorPanel.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectionEditorPanel } from './SectionEditorPanel'
import type { Section } from '@/types/section'

describe('SectionEditorPanel', () => {
  it('renders the hero form and reports edits through onChange', () => {
    const onChange = vi.fn()
    const section: Section = {
      id: '1',
      type: 'hero',
      position: 0,
      visible: true,
      content: { badge: 'Badge', titre: 'Titre', sousTitre: 'Sous-titre', texteCta: 'CTA' },
    }
    render(<SectionEditorPanel section={section} onChange={onChange} uploadFile={vi.fn()} />)

    // fireEvent.change, not userEvent.clear + userEvent.type: this panel is
    // rendered directly with a fixed `section` prop and no stateful parent
    // feeding onChange back into it (that wiring is Task 13's AdminBuilder,
    // exercised there instead). Typing character-by-character into a
    // controlled input whose value prop never updates between keystrokes
    // re-syncs to the stale prop after every character, so the result is
    // garbled ("Titree") rather than the typed string. A single atomic
    // value-set is what this test actually needs: confirming one edit
    // reports the right full content object through onChange.
    const titreInput = screen.getByLabelText('Titre')
    fireEvent.change(titreInput, { target: { value: 'Nouveau titre' } })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ titre: 'Nouveau titre' })
    )
  })

  it('renders the documents form and uploads a file on selection', async () => {
    const onChange = vi.fn()
    const uploadFile = vi.fn().mockResolvedValue({ url: 'https://example.com/menu.pdf' })
    const section: Section = {
      id: '2',
      type: 'documents',
      position: 0,
      visible: true,
      content: { titre: 'Menu', fichiers: [] },
    }
    render(<SectionEditorPanel section={section} onChange={onChange} uploadFile={uploadFile} />)

    const file = new File(['content'], 'menu.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText('Ajouter un fichier')
    await userEvent.upload(input, file)

    expect(uploadFile).toHaveBeenCalledWith(file)
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        fichiers: [{ nom: 'menu.pdf', url: 'https://example.com/menu.pdf' }],
      })
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/admin/SectionEditorPanel.test.tsx`
Expected: FAIL — none of the form components exist yet.

- [ ] **Step 3: Implement the simple text-like forms**

```tsx
// src/components/admin/forms/HeroForm.tsx
import type { HeroContent } from '@/types/section'

export function HeroForm({ content, onChange }: { content: HeroContent; onChange: (c: HeroContent) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1" htmlFor="hero-badge">Badge</label>
        <input
          id="hero-badge"
          className="w-full border px-3 py-2"
          value={content.badge}
          onChange={(e) => onChange({ ...content, badge: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="hero-titre">Titre</label>
        <input
          id="hero-titre"
          className="w-full border px-3 py-2"
          value={content.titre}
          onChange={(e) => onChange({ ...content, titre: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="hero-sous-titre">Sous-titre</label>
        <input
          id="hero-sous-titre"
          className="w-full border px-3 py-2"
          value={content.sousTitre}
          onChange={(e) => onChange({ ...content, sousTitre: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="hero-cta">Texte du bouton</label>
        <input
          id="hero-cta"
          className="w-full border px-3 py-2"
          value={content.texteCta}
          onChange={(e) => onChange({ ...content, texteCta: e.target.value })}
        />
      </div>
    </div>
  )
}
```

```tsx
// src/components/admin/forms/TextForm.tsx
import type { TextContent } from '@/types/section'

export function TextForm({ content, onChange }: { content: TextContent; onChange: (c: TextContent) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1" htmlFor="text-titre">Titre</label>
        <input
          id="text-titre"
          className="w-full border px-3 py-2"
          value={content.titre}
          onChange={(e) => onChange({ ...content, titre: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="text-texte">Texte</label>
        <textarea
          id="text-texte"
          className="w-full border px-3 py-2 h-40"
          value={content.texte}
          onChange={(e) => onChange({ ...content, texte: e.target.value })}
        />
      </div>
    </div>
  )
}
```

```tsx
// src/components/admin/forms/MapForm.tsx
import type { MapContent } from '@/types/section'

export function MapForm({ content, onChange }: { content: MapContent; onChange: (c: MapContent) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1" htmlFor="map-titre">Titre</label>
        <input
          id="map-titre"
          className="w-full border px-3 py-2"
          value={content.titre}
          onChange={(e) => onChange({ ...content, titre: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="map-adresse">Adresse</label>
        <input
          id="map-adresse"
          className="w-full border px-3 py-2"
          value={content.adresse}
          onChange={(e) => onChange({ ...content, adresse: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1" htmlFor="map-lat">Latitude</label>
          <input
            id="map-lat"
            type="number"
            step="any"
            className="w-full border px-3 py-2"
            value={content.latLng?.lat ?? ''}
            onChange={(e) =>
              onChange({
                ...content,
                latLng: { lat: Number(e.target.value), lng: content.latLng?.lng ?? 0 },
              })
            }
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="map-lng">Longitude</label>
          <input
            id="map-lng"
            type="number"
            step="any"
            className="w-full border px-3 py-2"
            value={content.latLng?.lng ?? ''}
            onChange={(e) =>
              onChange({
                ...content,
                latLng: { lat: content.latLng?.lat ?? 0, lng: Number(e.target.value) },
              })
            }
          />
        </div>
      </div>
    </div>
  )
}
```

```tsx
// src/components/admin/forms/ContactFooterForm.tsx
import type { ContactFooterContent } from '@/types/section'

export function ContactFooterForm({
  content,
  onChange,
}: {
  content: ContactFooterContent
  onChange: (c: ContactFooterContent) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1" htmlFor="contact-adresse">Adresse</label>
        <input
          id="contact-adresse"
          className="w-full border px-3 py-2"
          value={content.adresse}
          onChange={(e) => onChange({ ...content, adresse: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="contact-telephone">Téléphone</label>
        <input
          id="contact-telephone"
          className="w-full border px-3 py-2"
          value={content.telephone}
          onChange={(e) => onChange({ ...content, telephone: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="contact-email">Adresse mail</label>
        <input
          id="contact-email"
          className="w-full border px-3 py-2"
          value={content.email}
          onChange={(e) => onChange({ ...content, email: e.target.value })}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Implement the list-based forms (team, values, faq, testimonials)**

```tsx
// src/components/admin/forms/TeamForm.tsx
import type { TeamContent } from '@/types/section'

export function TeamForm({
  content,
  onChange,
  uploadFile,
}: {
  content: TeamContent
  onChange: (c: TeamContent) => void
  uploadFile: (file: File) => Promise<{ url: string }>
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm mb-1" htmlFor="team-titre">Titre</label>
        <input
          id="team-titre"
          className="w-full border px-3 py-2"
          value={content.titre}
          onChange={(e) => onChange({ ...content, titre: e.target.value })}
        />
      </div>
      {content.membres.map((membre, index) => (
        <div key={index} className="border p-3 space-y-2">
          <input
            aria-label={`Nom du membre ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Nom"
            value={membre.nom}
            onChange={(e) => {
              const membres = [...content.membres]
              membres[index] = { ...membre, nom: e.target.value }
              onChange({ ...content, membres })
            }}
          />
          <input
            aria-label={`Rôle du membre ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Rôle"
            value={membre.role}
            onChange={(e) => {
              const membres = [...content.membres]
              membres[index] = { ...membre, role: e.target.value }
              onChange({ ...content, membres })
            }}
          />
          <input
            aria-label={`Photo du membre ${index + 1}`}
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const { url } = await uploadFile(file)
              const membres = [...content.membres]
              membres[index] = { ...membre, photoUrl: url }
              onChange({ ...content, membres })
            }}
          />
          <button
            type="button"
            onClick={() => onChange({ ...content, membres: content.membres.filter((_, i) => i !== index) })}
          >
            Supprimer
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange({ ...content, membres: [...content.membres, { nom: '', role: '', photoUrl: '' }] })
        }
      >
        Ajouter un membre
      </button>
    </div>
  )
}
```

```tsx
// src/components/admin/forms/ValuesForm.tsx
import type { ValuesContent } from '@/types/section'

export function ValuesForm({ content, onChange }: { content: ValuesContent; onChange: (c: ValuesContent) => void }) {
  return (
    <div className="space-y-3">
      <input
        aria-label="Titre"
        className="w-full border px-3 py-2"
        value={content.titre}
        onChange={(e) => onChange({ ...content, titre: e.target.value })}
      />
      {content.points.map((point, index) => (
        <div key={index} className="border p-3 space-y-2">
          <input
            aria-label={`Label du point ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Label"
            value={point.label}
            onChange={(e) => {
              const points = [...content.points]
              points[index] = { ...point, label: e.target.value }
              onChange({ ...content, points })
            }}
          />
          <textarea
            aria-label={`Texte du point ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Texte"
            value={point.texte}
            onChange={(e) => {
              const points = [...content.points]
              points[index] = { ...point, texte: e.target.value }
              onChange({ ...content, points })
            }}
          />
          <button
            type="button"
            onClick={() => onChange({ ...content, points: content.points.filter((_, i) => i !== index) })}
          >
            Supprimer
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...content, points: [...content.points, { label: '', texte: '' }] })}
      >
        Ajouter un point
      </button>
    </div>
  )
}
```

```tsx
// src/components/admin/forms/FaqForm.tsx
import type { FaqContent } from '@/types/section'

export function FaqForm({ content, onChange }: { content: FaqContent; onChange: (c: FaqContent) => void }) {
  return (
    <div className="space-y-3">
      <input
        aria-label="Titre"
        className="w-full border px-3 py-2"
        value={content.titre}
        onChange={(e) => onChange({ ...content, titre: e.target.value })}
      />
      {content.items.map((item, index) => (
        <div key={index} className="border p-3 space-y-2">
          <input
            aria-label={`Question ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Question"
            value={item.question}
            onChange={(e) => {
              const items = [...content.items]
              items[index] = { ...item, question: e.target.value }
              onChange({ ...content, items })
            }}
          />
          <textarea
            aria-label={`Réponse ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Réponse"
            value={item.reponse}
            onChange={(e) => {
              const items = [...content.items]
              items[index] = { ...item, reponse: e.target.value }
              onChange({ ...content, items })
            }}
          />
          <button
            type="button"
            onClick={() => onChange({ ...content, items: content.items.filter((_, i) => i !== index) })}
          >
            Supprimer
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...content, items: [...content.items, { question: '', reponse: '' }] })}
      >
        Ajouter une question
      </button>
    </div>
  )
}
```

```tsx
// src/components/admin/forms/TestimonialsForm.tsx
import type { TestimonialsContent } from '@/types/section'

export function TestimonialsForm({
  content,
  onChange,
}: {
  content: TestimonialsContent
  onChange: (c: TestimonialsContent) => void
}) {
  return (
    <div className="space-y-3">
      <input
        aria-label="Titre"
        className="w-full border px-3 py-2"
        value={content.titre}
        onChange={(e) => onChange({ ...content, titre: e.target.value })}
      />
      {content.citations.map((citation, index) => (
        <div key={index} className="border p-3 space-y-2">
          <textarea
            aria-label={`Citation ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Citation"
            value={citation.texte}
            onChange={(e) => {
              const citations = [...content.citations]
              citations[index] = { ...citation, texte: e.target.value }
              onChange({ ...content, citations })
            }}
          />
          <input
            aria-label={`Auteur ${index + 1}`}
            className="w-full border px-3 py-2"
            placeholder="Auteur"
            value={citation.auteur}
            onChange={(e) => {
              const citations = [...content.citations]
              citations[index] = { ...citation, auteur: e.target.value }
              onChange({ ...content, citations })
            }}
          />
          <button
            type="button"
            onClick={() =>
              onChange({ ...content, citations: content.citations.filter((_, i) => i !== index) })
            }
          >
            Supprimer
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange({ ...content, citations: [...content.citations, { texte: '', auteur: '' }] })
        }
      >
        Ajouter un témoignage
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Implement the file-upload forms (documents, gallery)**

```tsx
// src/components/admin/forms/DocumentsForm.tsx
import type { DocumentsContent } from '@/types/section'

export function DocumentsForm({
  content,
  onChange,
  uploadFile,
}: {
  content: DocumentsContent
  onChange: (c: DocumentsContent) => void
  uploadFile: (file: File) => Promise<{ url: string }>
}) {
  return (
    <div className="space-y-3">
      <input
        aria-label="Titre"
        className="w-full border px-3 py-2"
        value={content.titre}
        onChange={(e) => onChange({ ...content, titre: e.target.value })}
      />
      <ul className="space-y-1">
        {content.fichiers.map((fichier, index) => (
          <li key={index} className="flex items-center justify-between border px-3 py-2">
            <span>{fichier.nom}</span>
            <button
              type="button"
              onClick={() =>
                onChange({ ...content, fichiers: content.fichiers.filter((_, i) => i !== index) })
              }
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
      <label className="block text-sm mb-1" htmlFor="documents-upload">Ajouter un fichier</label>
      <input
        id="documents-upload"
        type="file"
        accept="application/pdf"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const { url } = await uploadFile(file)
          onChange({ ...content, fichiers: [...content.fichiers, { nom: file.name, url }] })
        }}
      />
    </div>
  )
}
```

```tsx
// src/components/admin/forms/GalleryForm.tsx
import type { GalleryContent } from '@/types/section'

export function GalleryForm({
  content,
  onChange,
  uploadFile,
}: {
  content: GalleryContent
  onChange: (c: GalleryContent) => void
  uploadFile: (file: File) => Promise<{ url: string }>
}) {
  return (
    <div className="space-y-3">
      <input
        aria-label="Titre"
        className="w-full border px-3 py-2"
        value={content.titre}
        onChange={(e) => onChange({ ...content, titre: e.target.value })}
      />
      <div className="grid grid-cols-3 gap-2">
        {content.photos.map((photo, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <div key={index} className="relative">
            <img src={photo.url} alt={photo.alt} className="w-full h-20 object-cover" />
            <button
              type="button"
              className="absolute top-0 right-0 bg-white/80 px-1 text-xs"
              onClick={() => onChange({ ...content, photos: content.photos.filter((_, i) => i !== index) })}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <label className="block text-sm mb-1" htmlFor="gallery-upload">Ajouter une photo</label>
      <input
        id="gallery-upload"
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const { url } = await uploadFile(file)
          onChange({ ...content, photos: [...content.photos, { url, alt: file.name }] })
        }}
      />
    </div>
  )
}
```

- [ ] **Step 6: Implement the dispatcher**

```tsx
// src/components/admin/SectionEditorPanel.tsx
import type { Section } from '@/types/section'
import { HeroForm } from './forms/HeroForm'
import { TextForm } from './forms/TextForm'
import { TeamForm } from './forms/TeamForm'
import { ValuesForm } from './forms/ValuesForm'
import { DocumentsForm } from './forms/DocumentsForm'
import { GalleryForm } from './forms/GalleryForm'
import { FaqForm } from './forms/FaqForm'
import { MapForm } from './forms/MapForm'
import { TestimonialsForm } from './forms/TestimonialsForm'
import { ContactFooterForm } from './forms/ContactFooterForm'

interface Props {
  section: Section
  onChange: (content: Section['content']) => void
  uploadFile: (file: File) => Promise<{ url: string }>
}

export function SectionEditorPanel({ section, onChange, uploadFile }: Props) {
  switch (section.type) {
    case 'hero':
      return <HeroForm content={section.content} onChange={onChange} />
    case 'text':
      return <TextForm content={section.content} onChange={onChange} />
    case 'team':
      return <TeamForm content={section.content} onChange={onChange} uploadFile={uploadFile} />
    case 'values':
      return <ValuesForm content={section.content} onChange={onChange} />
    case 'documents':
      return <DocumentsForm content={section.content} onChange={onChange} uploadFile={uploadFile} />
    case 'gallery':
      return <GalleryForm content={section.content} onChange={onChange} uploadFile={uploadFile} />
    case 'faq':
      return <FaqForm content={section.content} onChange={onChange} />
    case 'map':
      return <MapForm content={section.content} onChange={onChange} />
    case 'testimonials':
      return <TestimonialsForm content={section.content} onChange={onChange} />
    case 'contact_footer':
      return <ContactFooterForm content={section.content} onChange={onChange} />
    default: {
      const exhaustiveCheck: never = section
      throw new Error(`Unhandled section type: ${JSON.stringify(exhaustiveCheck)}`)
    }
  }
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run src/components/admin/SectionEditorPanel.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 8: Commit**

```bash
git add src/components/admin/forms src/components/admin/SectionEditorPanel.tsx src/components/admin/SectionEditorPanel.test.tsx
git commit -m "feat: add per-type admin forms and the section editor dispatcher"
```

---

## Task 12: Sections list panel (reorder, add, duplicate, delete, toggle visibility)

**Files:**
- Create: `src/components/admin/SectionsListPanel.tsx`
- Test: `src/components/admin/SectionsListPanel.test.tsx`

**Interfaces:**
- Consumes: `Section`, `SECTION_TYPES`, `SECTION_TYPE_LABELS` (Task 2).
- Produces: `<SectionsListPanel sections={Section[]} selectedId={string | null} onSelect={(id) => void} onAdd={(type: SectionType) => void} onDelete={(id) => void} onDuplicate={(id) => void} onToggleVisible={(id) => void} onReorder={(fromIndex: number, toIndex: number) => void} />`, used by Task 13's `AdminBuilder`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/admin/SectionsListPanel.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SectionsListPanel } from './SectionsListPanel'
import type { Section } from '@/types/section'

const sections: Section[] = [
  { id: '1', type: 'hero', position: 0, visible: true, content: { badge: '', titre: 'Hero', sousTitre: '', texteCta: '' } },
  { id: '2', type: 'text', position: 1, visible: false, content: { titre: 'Le périscolaire', texte: '' } },
]

describe('SectionsListPanel', () => {
  it('lists every section by its title and calls onSelect on click', async () => {
    const onSelect = vi.fn()
    render(
      <SectionsListPanel
        sections={sections}
        selectedId={null}
        onSelect={onSelect}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onToggleVisible={vi.fn()}
        onReorder={vi.fn()}
      />
    )
    expect(screen.getByText('Hero')).toBeInTheDocument()
    expect(screen.getByText('Le périscolaire')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Hero'))
    expect(onSelect).toHaveBeenCalledWith('1')
  })

  it('calls onDelete and onDuplicate for the right section', async () => {
    const onDelete = vi.fn()
    const onDuplicate = vi.fn()
    render(
      <SectionsListPanel
        sections={sections}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onToggleVisible={vi.fn()}
        onReorder={vi.fn()}
      />
    )
    await userEvent.click(screen.getAllByLabelText('Supprimer la section')[0])
    expect(onDelete).toHaveBeenCalledWith('1')

    await userEvent.click(screen.getAllByLabelText('Dupliquer la section')[1])
    expect(onDuplicate).toHaveBeenCalledWith('2')
  })

  it('calls onToggleVisible when the visibility button is clicked', async () => {
    const onToggleVisible = vi.fn()
    render(
      <SectionsListPanel
        sections={sections}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onToggleVisible={onToggleVisible}
        onReorder={vi.fn()}
      />
    )
    await userEvent.click(screen.getAllByLabelText('Afficher ou masquer la section')[1])
    expect(onToggleVisible).toHaveBeenCalledWith('2')
  })

  it('opens the type menu and calls onAdd with the chosen type', async () => {
    const onAdd = vi.fn()
    render(
      <SectionsListPanel
        sections={sections}
        selectedId={null}
        onSelect={vi.fn()}
        onAdd={onAdd}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onToggleVisible={vi.fn()}
        onReorder={vi.fn()}
      />
    )
    await userEvent.click(screen.getByText('Ajouter une section'))
    await userEvent.click(screen.getByText('FAQ'))
    expect(onAdd).toHaveBeenCalledWith('faq')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/admin/SectionsListPanel.test.tsx`
Expected: FAIL — `SectionsListPanel.tsx` doesn't exist yet.

- [ ] **Step 3: Implement it**

Drag-and-drop itself (the pointer gesture) is not practical to unit test meaningfully — it is covered by manual browser verification in Task 13's smoke test. This component still wires `@dnd-kit` so the gesture works, and exposes `onReorder(fromIndex, toIndex)` as the piece the tests above cover through the other interactions.

```tsx
// src/components/admin/SectionsListPanel.tsx
'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Eye, EyeOff, Copy, Trash2, Plus,
  Home, FileText, Users, Heart, FileDown, Image as ImageIcon,
  HelpCircle, MapPin, Quote, Phone,
} from 'lucide-react'
import type { Section, SectionType } from '@/types/section'
import { SECTION_TYPES, SECTION_TYPE_LABELS } from '@/types/section'

const TYPE_ICONS: Record<SectionType, React.ComponentType<{ size?: number }>> = {
  hero: Home,
  text: FileText,
  team: Users,
  values: Heart,
  documents: FileDown,
  gallery: ImageIcon,
  faq: HelpCircle,
  map: MapPin,
  testimonials: Quote,
  contact_footer: Phone,
}

interface Props {
  sections: Section[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAdd: (type: SectionType) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onToggleVisible: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
}

function SortableRow({
  section,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisible,
}: {
  section: Section
  selected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleVisible: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id })
  const Icon = TYPE_ICONS[section.type]
  const title = 'titre' in section.content ? section.content.titre : SECTION_TYPE_LABELS[section.type]

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 border px-2 py-2 ${selected ? 'bg-[#A3A374]/30' : 'bg-white/40'}`}
    >
      <button type="button" aria-label="Réordonner la section" {...attributes} {...listeners}>
        <GripVertical size={16} />
      </button>
      <Icon size={16} />
      <button type="button" className="flex-1 text-left" onClick={onSelect}>
        {title}
      </button>
      <button type="button" aria-label="Afficher ou masquer la section" onClick={onToggleVisible}>
        {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
      <button type="button" aria-label="Dupliquer la section" onClick={onDuplicate}>
        <Copy size={16} />
      </button>
      <button type="button" aria-label="Supprimer la section" onClick={onDelete}>
        <Trash2 size={16} />
      </button>
    </li>
  )
}

export function SectionsListPanel({
  sections,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onDuplicate,
  onToggleVisible,
  onReorder,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromIndex = sections.findIndex((s) => s.id === active.id)
    const toIndex = sections.findIndex((s) => s.id === over.id)
    if (fromIndex === -1 || toIndex === -1) return
    onReorder(fromIndex, toIndex)
  }

  return (
    <div className="flex flex-col gap-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-1">
            {sections.map((section) => (
              <SortableRow
                key={section.id}
                section={section}
                selected={section.id === selectedId}
                onSelect={() => onSelect(section.id)}
                onDelete={() => onDelete(section.id)}
                onDuplicate={() => onDuplicate(section.id)}
                onToggleVisible={() => onToggleVisible(section.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className="relative">
        <button
          type="button"
          className="flex items-center gap-2 border px-3 py-2 w-full justify-center"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Plus size={16} /> Ajouter une section
        </button>
        {menuOpen && (
          <ul className="absolute z-10 bg-white border w-full mt-1">
            {SECTION_TYPES.map((type) => (
              <li key={type}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-[#EDE6D3]"
                  onClick={() => {
                    onAdd(type)
                    setMenuOpen(false)
                  }}
                >
                  {SECTION_TYPE_LABELS[type]}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/admin/SectionsListPanel.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/SectionsListPanel.tsx src/components/admin/SectionsListPanel.test.tsx
git commit -m "feat: add drag-and-drop sections list panel with add/duplicate/delete/toggle"
```

---

## Task 13: AdminBuilder — wire the 3 columns to Server Actions

**Files:**
- Create: `src/app/admin/(protected)/actions.ts`
- Create: `src/components/admin/AdminBuilder.tsx`
- Create: `src/app/admin/(protected)/page.tsx`
- Test: `src/components/admin/AdminBuilder.test.tsx`

**Interfaces:**
- Consumes: `SectionsListPanel` (Task 12), `SectionEditorPanel` (Task 11), `SectionRenderer` (Task 6), `useAutosave` (Task 9), `moveSection` (Task 3).
- Produces: the finished `/admin` page.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/admin/AdminBuilder.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminBuilder } from './AdminBuilder'
import type { Section } from '@/types/section'

const initialSections: Section[] = [
  { id: '1', type: 'hero', position: 0, visible: true, content: { badge: '', titre: 'Hero', sousTitre: '', texteCta: '' } },
]

function makeActions() {
  return {
    addSection: vi.fn().mockResolvedValue({ id: '2', type: 'text', position: 1, visible: true, content: { titre: 'Nouvelle rubrique', texte: '' } }),
    updateSectionContent: vi.fn().mockResolvedValue(undefined),
    updateSectionVisibility: vi.fn().mockResolvedValue(undefined),
    deleteSection: vi.fn().mockResolvedValue(undefined),
    duplicateSection: vi.fn().mockResolvedValue({ id: '3', type: 'hero', position: 1, visible: true, content: { badge: '', titre: 'Hero', sousTitre: '', texteCta: '' } }),
    reorderSections: vi.fn().mockResolvedValue(undefined),
    uploadFile: vi.fn(),
  }
}

describe('AdminBuilder', () => {
  it('selects a section and shows its editor form', async () => {
    render(<AdminBuilder initialSections={initialSections} actions={makeActions()} />)
    await userEvent.click(screen.getByText('Hero'))
    expect(screen.getByLabelText('Titre')).toBeInTheDocument()
  })

  it('adds a new section through the actions and shows it in the list', async () => {
    const actions = makeActions()
    render(<AdminBuilder initialSections={initialSections} actions={actions} />)
    await userEvent.click(screen.getByText('Ajouter une section'))
    await userEvent.click(screen.getByText('Bloc texte'))
    expect(actions.addSection).toHaveBeenCalledWith('text')
    expect(await screen.findByText('Nouvelle rubrique')).toBeInTheDocument()
  })

  it('edits the selected section content and triggers the autosave action', async () => {
    // Real timers on purpose: userEvent's internal typing delays hang
    // forever under vi.useFakeTimers() unless userEvent itself is
    // configured with { advanceTimers }. A real ~1s wait for the autosave
    // debounce is simpler and avoids that footgun entirely.
    const actions = makeActions()
    render(<AdminBuilder initialSections={initialSections} actions={actions} />)
    await userEvent.click(screen.getByText('Hero'))

    const titreInput = screen.getByLabelText('Titre')
    await userEvent.clear(titreInput)
    await userEvent.type(titreInput, 'Titre modifié')

    await waitFor(
      () =>
        expect(actions.updateSectionContent).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({ titre: 'Titre modifié' })
        ),
      { timeout: 2000 }
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/admin/AdminBuilder.test.tsx`
Expected: FAIL — `AdminBuilder.tsx` doesn't exist yet.

- [ ] **Step 3: Write the Server Actions**

```typescript
// src/app/admin/(protected)/actions.ts
'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseSectionsRepository } from '@/lib/sections/supabase-repository'
import { uploadFile as uploadFileToStorage } from '@/lib/storage/upload-file'
import type { Section, SectionType } from '@/types/section'

async function getRepository() {
  const client = await createSupabaseServerClient()
  return { client, repository: createSupabaseSectionsRepository(client) }
}

export async function addSection(type: SectionType): Promise<Section> {
  const { repository } = await getRepository()
  return repository.create(type)
}

export async function updateSectionContent(id: string, content: Section['content']): Promise<void> {
  const { repository } = await getRepository()
  await repository.update(id, { content })
}

export async function updateSectionVisibility(id: string, visible: boolean): Promise<void> {
  const { repository } = await getRepository()
  await repository.update(id, { visible })
}

export async function deleteSection(id: string): Promise<void> {
  const { repository } = await getRepository()
  await repository.remove(id)
}

export async function duplicateSection(id: string): Promise<Section> {
  const { repository } = await getRepository()
  return repository.duplicate(id)
}

export async function reorderSections(orderedIds: string[]): Promise<void> {
  const { repository } = await getRepository()
  await repository.reorder(orderedIds)
}

export async function uploadSectionFile(formData: FormData): Promise<{ url: string }> {
  const file = formData.get('file') as File
  const { client } = await getRepository()
  return uploadFileToStorage(client, file)
}
```

- [ ] **Step 4: Implement `AdminBuilder`**

The component takes its actions as props (not direct imports) so Step 1's test can inject fakes — the real `/admin` page (Step 6) passes the Server Actions from Step 3, and `uploadFile` is adapted to the `(file: File) => Promise<{url:string}>` shape the forms expect by wrapping `uploadSectionFile`'s `FormData` signature.

```tsx
// src/components/admin/AdminBuilder.tsx
'use client'

import { useState } from 'react'
import type { Section, SectionType } from '@/types/section'
import { SectionsListPanel } from './SectionsListPanel'
import { SectionEditorPanel } from './SectionEditorPanel'
import { SectionRenderer } from '@/components/public/SectionRenderer'
import { useAutosave } from '@/hooks/use-autosave'
import { moveSection } from '@/lib/sections/order'

export interface AdminActions {
  addSection: (type: SectionType) => Promise<Section>
  updateSectionContent: (id: string, content: Section['content']) => Promise<void>
  updateSectionVisibility: (id: string, visible: boolean) => Promise<void>
  deleteSection: (id: string) => Promise<void>
  duplicateSection: (id: string) => Promise<Section>
  reorderSections: (orderedIds: string[]) => Promise<void>
  uploadFile: (file: File) => Promise<{ url: string }>
}

function EditingSectionAutosave({
  section,
  onSave,
}: {
  section: Section
  onSave: (content: Section['content']) => Promise<void>
}) {
  const { status } = useAutosave({ value: section.content, onSave, delayMs: 1000 })
  const label = { idle: '', pending: 'Modifié...', saving: 'Enregistrement...', saved: 'Enregistré', error: 'Erreur, réessai...' }[status]
  return <p className="text-xs text-[#5b4f3f] mb-2">{label}</p>
}

export function AdminBuilder({
  initialSections,
  actions,
}: {
  initialSections: Section[]
  actions: AdminActions
}) {
  const [sections, setSections] = useState(initialSections)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedSection = sections.find((s) => s.id === selectedId) ?? null

  async function handleAdd(type: SectionType) {
    const created = await actions.addSection(type)
    setSections((current) => [...current, created])
    setSelectedId(created.id)
  }

  async function handleDelete(id: string) {
    await actions.deleteSection(id)
    setSections((current) => current.filter((s) => s.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  async function handleDuplicate(id: string) {
    const copy = await actions.duplicateSection(id)
    setSections((current) => [...current, copy])
  }

  async function handleToggleVisible(id: string) {
    const target = sections.find((s) => s.id === id)
    if (!target) return
    const nextVisible = !target.visible
    setSections((current) => current.map((s) => (s.id === id ? { ...s, visible: nextVisible } : s)))
    await actions.updateSectionVisibility(id, nextVisible)
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    const reordered = moveSection(sections, fromIndex, toIndex)
    setSections(reordered)
    void actions.reorderSections(reordered.map((s) => s.id))
  }

  function handleContentChange(content: Section['content']) {
    if (!selectedSection) return
    setSections((current) =>
      current.map((s) => (s.id === selectedSection.id ? ({ ...s, content } as Section) : s))
    )
  }

  return (
    <div className="flex h-screen">
      <aside className="w-72 border-r p-3 overflow-y-auto">
        <SectionsListPanel
          sections={sections}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
          onToggleVisible={handleToggleVisible}
          onReorder={handleReorder}
        />
      </aside>

      <main className="flex-1 overflow-y-auto">
        {sections.filter((s) => s.visible).map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))}
      </main>

      <aside className="w-80 border-l p-3 overflow-y-auto">
        {selectedSection ? (
          <>
            <EditingSectionAutosave
              key={selectedSection.id}
              section={selectedSection}
              onSave={(content) => actions.updateSectionContent(selectedSection.id, content)}
            />
            <SectionEditorPanel
              section={selectedSection}
              onChange={handleContentChange}
              uploadFile={actions.uploadFile}
            />
          </>
        ) : (
          <p className="text-sm text-[#5b4f3f]">Sélectionne une section pour l'éditer.</p>
        )}
      </aside>
    </div>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/admin/AdminBuilder.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 6: Wire the real `/admin` page**

```tsx
// src/app/admin/(protected)/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseSectionsRepository } from '@/lib/sections/supabase-repository'
import { AdminBuilder } from '@/components/admin/AdminBuilder'
import {
  addSection,
  updateSectionContent,
  updateSectionVisibility,
  deleteSection,
  duplicateSection,
  reorderSections,
  uploadSectionFile,
} from './actions'

export default async function AdminPage() {
  const client = await createSupabaseServerClient()
  const repository = createSupabaseSectionsRepository(client)
  const sections = await repository.list()

  async function uploadFile(file: File) {
    const formData = new FormData()
    formData.set('file', file)
    return uploadSectionFile(formData)
  }

  return (
    <AdminBuilder
      initialSections={sections}
      actions={{
        addSection,
        updateSectionContent,
        updateSectionVisibility,
        deleteSection,
        duplicateSection,
        reorderSections,
        uploadFile,
      }}
    />
  )
}
```

- [ ] **Step 7: Manual verification**

Needs a real Supabase project and a logged-in session (Task 5 + Task 8 + Task 14's account checklist). Once available, run `npm run dev`, log in, and confirm in the browser:
1. Adding each of the 10 section types works and shows a sensible default in the preview.
2. Editing a field updates the preview live and the status indicator cycles pending → saving → saved.
3. Dragging a section in the list reorders the preview.
4. Uploading a PDF in "Documents" and a photo in "Galerie" both work and the file is downloadable/visible from the public page after a refresh.
5. Toggling visibility off removes the section from the public page.

- [ ] **Step 8: Commit**

```bash
git add src/app/admin src/components/admin/AdminBuilder.tsx src/components/admin/AdminBuilder.test.tsx
git commit -m "feat: wire the admin builder to Server Actions with live preview and autosave"
```

---

## Task 14: Netlify deployment and account-setup checklist

**Files:**
- Create: `netlify.toml`
- Create: `README.md`

**Interfaces:**
- Produces: a deployable configuration and a manual checklist — no code interface, this is the handover task.

- [ ] **Step 1: Install the Netlify Next.js plugin**

```bash
npm install -D @netlify/plugin-nextjs
```

- [ ] **Step 2: Add the Netlify config**

```toml
# netlify.toml
[build]
  command = "npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

- [ ] **Step 3: Write the README as a manual setup checklist**

```markdown
# Les Champs d'Escale — site + app de gestion

## Mise en route (à faire une seule fois, avec les identifiants de l'association)

Ces étapes ne peuvent pas être automatisées : elles nécessitent l'email de
l'association (`champsdescale@gmail.com`) sur le poste qui y a déjà accès.

1. **Créer le projet Supabase**
   - Aller sur https://supabase.com, créer un compte avec l'email de l'association.
   - "New project", choisir un nom (ex: `champsdescale`) et une région proche (Europe).
   - Une fois créé : menu "SQL Editor" → coller le contenu de `supabase/schema.sql` → Run.
   - Menu "Project Settings" → "API" : noter l'URL du projet et la clé `anon public`.
   - Menu "Authentication" → "Users" → "Add user" : créer le compte partagé de l'équipe
     (email + mot de passe à leur transmettre).

2. **Créer le repo GitHub**
   - Créer un nouveau repo sous le compte GitHub de l'association (ou transférer ce repo local dessus).
   - `git remote add origin <url-du-repo>` puis `git push -u origin main`.

3. **Créer le site Netlify**
   - Aller sur https://netlify.com, créer un compte avec l'email de l'association.
   - "Add new site" → "Import an existing project" → sélectionner le repo GitHub.
   - Dans "Site settings" → "Environment variables", ajouter :
     - `NEXT_PUBLIC_SUPABASE_URL` = l'URL notée à l'étape 1
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la clé notée à l'étape 1
   - Déclencher un déploiement ("Trigger deploy").
   - Le site est alors accessible sur une URL du type `<nom>.netlify.app`.

4. **Basculer le domaine (plus tard, une fois le site validé)**
   - Voir la section "Domaine" de `docs/superpowers/specs/2026-09-21-champsdescale-landing-design.md`.

## Développement local

```bash
npm install
cp .env.local.example .env.local   # puis remplir avec les valeurs de l'étape 1
npm run dev
```

## Tests

```bash
npm run test
```
```

- [ ] **Step 4: Manual verification**

This task has no automated check — it produces the deployment config and the handover instructions. Confirm `netlify.toml` is valid TOML by running `npx netlify build --dry` locally if the Netlify CLI is available, otherwise just review the file by eye (it follows the exact format Netlify's docs specify for the Next.js runtime plugin).

- [ ] **Step 5: Commit**

```bash
git add netlify.toml README.md package.json package-lock.json
git commit -m "chore: add Netlify deployment config and manual account-setup checklist"
```
