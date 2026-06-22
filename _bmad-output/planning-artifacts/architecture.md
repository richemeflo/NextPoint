---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief.md
  - _bmad-output/planning-artifacts/ux-screen-inventory.md
  - _bmad-output/planning-artifacts/design-tokens.md
  - _bmad-output/planning-artifacts/decision-log.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - _bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/EXPERIENCE.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-06-07'
project_name: 'NextPoint'
user_name: 'Flo'
date: '2026-06-07'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Le PRD contient environ 112 exigences fonctionnelles, organisees autour de ces blocs: comptes/roles, profils coach/eleve, relation coach/eleve, disponibilites, reservations, tarifs, eleves/notes privees, mobile/webapp, statistiques coach, notifications in-app et messagerie coach.

Le graphe fonctionnel du MVP converge vers quatre noyaux architecturaux:

1. **Identity & Access**
   Gere comptes, roles `coach`/`eleve`, relation coach/eleve single-coach, provisionnement des comptes eleves, activation par jeton et protection des donnees privees.

2. **Scheduling & Booking**
   Gere plages de disponibilites, generation de creneaux, demandes `pending`, confirmation/refus, annulation/modification, expiration 7 jours, cours individuels/collectifs et recurrence coach.

3. **Communication & Notifications**
   Gere notification push, notification in-app miroir, historique consultable, refus push systeme, liens vers evenements concernes, commentaires demande/refus et messagerie coach liee aux creneaux, demandes, reservations ou evenements.

4. **Experience System**
   Gere app mobile-first, webapp complementaire, i18n FR/EN/ES, design tokens, light/dark theme, planning semaine/jour et UX coherente coach/eleve.

Le noeud le plus critique est **Scheduling & Booking**, mais il depend directement de **Identity & Access** pour les permissions et de **Communication & Notifications** pour les effets de bord metier. Ces dependances impliquent que les mutations de reservation ne doivent pas etre traitees comme de simples CRUD: elles doivent produire des changements d'etat coherents, atomiques et auditables.

**Non-Functional Requirements:**
Les NFR structurants sont: mobile-first, performance sur connexion mobile standard, reservation atomique, securite par role/relation, confidentialite des notes privees, coherence app mobile/webapp, internationalisation FR/EN/ES, design tokens light/dark, et maintien d'un MVP sans marketplace, paiement ou logique club.

**Scale & Complexity:**
Le projet est full-stack, mobile-first avec webapp complementaire. La complexite est moyenne-haute pour un MVP car les regles de reservation sont transactionnelles, les notifications sont doubles push/in-app, et les donnees doivent rester coherentes entre plateformes.

- Primary domain: planning, booking, notifications, coach/student management
- Complexity level: medium-high
- Estimated architectural components: auth/access control, scheduling engine, booking workflow, notification service, pricing, student records, lesson packs, stats, i18n/theme system, mobile/web clients

### Technical Constraints & Dependencies

Le MVP doit rester single-coach et padel-only, mais le modele ne doit pas etre confondu avec une marketplace, un systeme de paiement ou une logique club.

Dependances fortes identifiees:

- Une action de reservation depend des permissions, du statut du creneau, du compteur de demandes `pending`, de la limite eleve, du tarif applicable et de la creation de notifications.
- Le tarif applicable depend du type de cours, de la duree, des tarifs actifs et des criteres d'applicabilite definis par le coach, par exemple certains eleves, tarif etudiant, tarif senior, week-end ou jour ferie.
- Une validation coach doit modifier la demande validee, bloquer le creneau, refuser automatiquement les autres demandes pending du meme creneau avec le message produit defini, et notifier les eleves concernes.
- Une notification push n'est jamais suffisante seule: chaque evenement fonctionnel doit aussi creer une notification in-app.
- La webapp et l'app mobile doivent consommer les memes regles serveur, pas reimplementer les regles metier cote client.
- Les donnees privees coach, surtout les notes eleves, imposent une separation stricte des lectures selon role et relation.

### Cross-Cutting Concerns Identified

- Controle d'acces strict par role et relation coach/eleve.
- Transactions et contraintes serveur pour eviter les conflits de reservation.
- Machine d'etat explicite pour creneaux et reservations: `available`, `pending`, `booked`, `confirmed`, `refused`, `expired`, `cancelled`.
- Effets de bord fiables apres mutation: notifications push, notifications in-app, statut des demandes concurrentes, liberation ou blocage de creneau, messages coach lies aux evenements de planning/reservation.
- Expiration automatique apres 7 jours.
- Synchronisation mobile/webapp.
- Internationalisation FR/EN/ES des le depart.
- Tokens design obligatoires, light/dark theme, pas de couleurs codees en dur.
- Confidentialite des notes privees coach.
- Observabilite minimale des erreurs critiques de reservation et notification.

## Starter Template Evaluation

### Primary Technology Domain

React Native avec TypeScript, mobile-first, avec webapp complementaire. Le projet doit produire une application iOS/Android prioritaire et une experience web fonctionnelle pour les parcours P0.

### Starter Options Considered

**Option 1 - Expo `create-expo-app` default template**

Starter officiel Expo pour React Native. Le template `default@sdk-56` inclut TypeScript, Expo Router et une base adaptee aux apps multi-ecrans. C'est l'option la plus coherente pour NextPoint car Expo Router couvre native et web, tout en restant suffisamment leger pour ne pas verrouiller trop tot le choix backend ou UI kit.

**Option 2 - Expo blank TypeScript**

Option plus minimale. Elle convient si l'on veut tout composer a la main, mais elle apporte moins de structure initiale pour un produit avec plusieurs surfaces: coach, eleve, planning, notifications, compte, statistiques.

**Option 3 - Ignite**

Boilerplate React Native mature et maintenu, avec TypeScript, React Navigation, Expo SDK, i18n, persistance, testing et outillage. Bon choix pour une equipe qui veut une architecture mobile tres opinionated des le depart. Pour NextPoint, il impose davantage de conventions et semble moins directement aligne avec le besoin webapp via Expo Router.

**Option 4 - Tamagui Expo Router Starter**

Starter interessant pour partager des composants native/web et structurer un design system. Il ajoute toutefois une decision UI forte des le depart. Comme NextPoint dispose deja de tokens design mais pas encore d'architecture UI validee, Tamagui doit rester une option a evaluer pendant les decisions front, pas le starter de base.

**Option 5 - React Native CLI**

Option plus proche du natif pur. Elle donne davantage de controle iOS/Android, mais augmente le cout de configuration et ne sert pas aussi directement le besoin webapp P0.

### Selected Starter: Expo `create-expo-app` default TypeScript template

**Rationale for Selection:**

NextPoint est mobile-first, mais la webapp doit couvrir les parcours P0. Expo avec Expo Router permet de demarrer en React Native TypeScript, de partager les ecrans et composants entre mobile et web lorsque c'est pertinent, et de garder une base officielle maintenue.

Le starter ne doit pas porter les regles metier critiques. Les contraintes de reservation, permissions, limites `pending`, expiration, notifications miroir et confidentialite doivent etre garanties cote backend/API.

**Initialization Command:**

```bash
npx create-expo-app@latest apps/mobile --template default@sdk-56
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
React Native avec TypeScript. La base TypeScript est incluse par le template Expo default.

**Routing & Navigation:**
Expo Router avec routing file-based dans le dossier `app`. Cette structure convient aux groupes de routes par role: public, auth, coach, eleve.

**Styling Solution:**
Le starter ne force pas de design system complet. Les tokens NextPoint devront etre ajoutes explicitement a partir de `design-tokens.md`, avec support light/dark theme et interdiction de couleurs codees en dur dans les composants.

**Build Tooling:**
Expo CLI et Metro. EAS Build pourra etre utilise pour produire les builds iOS/Android. Expo Web pourra servir la webapp P0.

**Testing Framework:**
Le starter ne doit pas etre considere comme couverture de test suffisante. Les tests unitaires/integration front, les tests des regles de reservation backend et les tests E2E des parcours critiques devront etre ajoutes dans les stories d'implementation.

**Code Organization:**
La structure initiale sera orientee Expo Router. L'architecture applicative devra ensuite isoler les domaines NextPoint: identity/access, scheduling/booking, notifications, pricing, students, packs, stats, i18n/theme.

**Development Experience:**
Fast Refresh, serveur Expo, developpement iOS/Android/web depuis une base commune. La premiere story d'implementation doit initialiser ce starter avant d'ajouter les domaines metier.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- React Native avec TypeScript et Expo `create-expo-app` template `default@sdk-56`.
- Supabase avec PostgreSQL comme system of record.
- Supabase Auth + Row Level Security pour authentification et autorisation.
- Mutations metier critiques via fonctions serveur transactionnelles, pas CRUD direct depuis le client.
- Expo Router pour navigation mobile/web.

**Important Decisions (Shape Architecture):**

- TanStack Query pour le server state cote client.
- React Hook Form + Zod pour formulaires et validation.
- Tokens design NextPoint, light/dark theme, i18n FR/EN/ES des le depart.
- Infrastructure compatible free tier: Supabase Free, Expo/EAS Free, Vercel Hobby ou equivalent, GitHub Actions leger.

**Deferred Decisions (Post-MVP):**

- Backend TypeScript separe: reporte tant que Supabase Edge Functions et PostgreSQL couvrent les besoins.
- OpenAPI formel: reporte tant qu'il n'y a pas d'integrations externes.
- Realtime large: limite a planning/notifications si la valeur UX le justifie.
- Observabilite payante: reportee jusqu'a usage production.
- UI kit lourd type Tamagui: a reevaluer seulement si les besoins de composants partages native/web depassent le systeme de tokens simple.

### Data Architecture

**Decision:** Supabase with PostgreSQL as the system of record.

**Rationale:** NextPoint needs relational modeling, transactional booking rules, role-based data access, private coach notes, and shared data for mobile and web. Supabase provides managed PostgreSQL, Auth, RLS, migrations, and TypeScript Edge Functions while keeping the MVP lean and free-tier compatible at startup.

**Data Modeling Approach:** Relational SQL model with explicit tables for users, coach profiles, student profiles, coach/student relations, availability ranges, availability slots, bookings, group participants, pricing, lesson packs, private notes, push notifications, and in-app notifications.

**Validation Strategy:** Zod for client/API input validation; PostgreSQL constraints, indexes, and transaction logic for critical invariants.

**Migration Approach:** Supabase CLI migrations committed to the repo.

**Caching Strategy:** TanStack Query on the Expo client for server state caching and invalidation. No custom distributed cache in P0.

### Authentication & Security

**Decision:** Supabase Auth for authentication, PostgreSQL Row Level Security for data access, and server-side functions for sensitive booking mutations.

**Authentication Method:** Supabase Auth with email/password for P0. OAuth/social login can be deferred unless product onboarding requires it.

**Session Storage:** Expo client stores auth sessions using the Supabase React Native setup with secure platform storage where applicable. Avoid storing service keys or privileged secrets in the app.

**Authorization Pattern:** Application roles are `coach` and `eleve`, backed by database tables and/or trusted auth metadata. RLS policies enforce read/write access by role and coach/student relation.

**Sensitive Operations:** Reservation mutations are not client-side CRUD. Booking request, coach validation, refusal, cancellation, modification, expiration handling, lesson-pack consumption, notification mirroring, provisionnement Auth eleve, generation/revocation de lien et activation de compte doivent passer par des commandes serveur de confiance.

**Private Data:** Coach private notes are protected by RLS and never exposed to student queries. Tests must cover this explicitly.

**API Security:** The client uses only public anon credentials. Service-role access is restricted to Supabase Edge Functions or trusted backend execution. Rate limiting is required for auth-sensitive and booking-sensitive actions before production.

**Student Account Lifecycle:** L'etat metier du compte eleve est distinct du statut de la relation coach/eleve. Les valeurs sont `pending_activation`, `active`, `suspended`, `deleted`. Les routes privees eleve exigent `active`.

**Activation Tokens:** Les liens utilisent un jeton opaque aleatoire dont seul le hash est stocke. Le jeton est a usage unique, expire apres 24 heures et toute regeneration revoque les jetons precedents. L'API Admin Supabase Auth reste confinee aux Edge Functions.

### API & Communication Patterns

**Decision:** Hybrid Supabase communication model: direct Supabase client reads for simple RLS-protected queries, Edge Functions for all business-critical mutations.

**API Style:** Use Supabase client queries for read models and Supabase Edge Functions as command endpoints for workflows such as `requestBooking`, `approveBooking`, `refuseBooking`, `cancelBooking`, coach-only `modifyBooking`, `consumeLessonPack`, and notification mirroring.

**Business Command Pattern:** Booking-related operations are commands, not generic CRUD. Each command validates permissions, checks current state, applies transactional database changes, creates required in-app notifications, and returns a typed response.

**Student Account Commands:** `create-manual-student`, `generate-student-activation-link` et `activate-student-account` suivent le meme pattern de commande. Elles normalisent les erreurs, auditent les changements d'etat et compensent toute creation Auth partielle.

**Realtime Strategy:** Use Supabase Realtime selectively for coach planning updates, notification badges, and booking state updates where live feedback materially improves UX. Avoid broad realtime subscriptions in P0; prefer TanStack Query invalidation/refetch for ordinary screens.

**Error Handling Standard:** All Edge Functions return a normalized error shape: `{ code, message, fieldErrors?, retryable? }`. Client copy must stay user-facing and translated; technical details remain in logs.

**API Documentation:** Document command contracts in repo markdown and colocated Zod schemas. OpenAPI can be deferred unless external integrations appear.

**Rate Limiting:** Apply rate limiting before production on auth-sensitive and booking-sensitive commands, especially booking request creation and notification-triggering operations.

### Frontend Architecture

**Decision:** Expo Router app with feature-oriented modules, TanStack Query for server state, local React state for UI state, React Hook Form + Zod for forms, and a token-driven theme system.

**Routing Strategy:** Use Expo Router file-based routing. Organize routes by access boundary: public routes, auth routes, coach routes, student routes, and shared modal/detail routes. Use Expo Router APIs directly and avoid importing external `@react-navigation/*` packages in app code unless a specific gap requires it.

**State Management:** Use TanStack Query for server state: bookings, slots, notifications, students, pricing, stats. Use local React state or colocated hooks for UI state: selected tab, filters, form UI, current week/day view. Avoid Redux/Zustand in P0 unless a concrete cross-screen client-only state problem appears.

**Forms & Validation:** Use React Hook Form for form state and Zod schemas for validation. Reuse Zod schemas with Edge Function command inputs where possible.

**Component Architecture:** Use domain-oriented folders: `features/auth`, `features/scheduling`, `features/bookings`, `features/notifications`, `features/students`, `features/pricing`, `features/stats`, `features/i18n`, `features/theme`. Shared primitives live under `ui/`, but business-aware components stay in their feature folder.

**Styling & Theme:** Use a token-driven styling layer based on `design-tokens.md`. Light/dark theme support is required from the start. Components must not hardcode colors.

**Internationalization:** Use i18next/react-i18next or an equivalent React Native-compatible i18n layer. All user-facing strings must be externalized for French, English, and Spanish.

**Offline Strategy:** P0 is online-first. TanStack Query may cache previously loaded data, but booking mutations require network access to avoid inconsistent reservations.

**Performance Strategy:** Use stable calendar dimensions, paginated/ranged queries for planning screens, memoized slot rendering where needed, and selective realtime subscriptions only for planning/notifications.

### Infrastructure & Deployment

**Decision:** Free-tier-compatible infrastructure: Supabase Cloud for backend/data, Expo/EAS for native app builds, Expo Web hosted on Vercel Hobby or equivalent static hosting, and GitHub Actions for lightweight CI.

**Backend Hosting:** Supabase Cloud Free plan for MVP/prototype. Upgrade only when quotas, production reliability, team workflow, or usage require it.

**Native App Builds:** Use Expo locally during development. Use EAS Build free tier for occasional iOS/Android builds. Local native builds remain an option if cloud build quotas become limiting.

**Webapp Hosting:** Use Expo Web output deployed to Vercel Hobby or another free static/web hosting option. Webapp is P0 functional, not a separate Next.js app.

**CI/CD:** Use GitHub Actions for lint/typecheck/test on pull requests or main branch. Keep CI lightweight to stay inside free quotas.

**Environment Configuration:** Separate local, preview/staging, and production Supabase projects when needed. Client apps only receive public anon keys and project URLs. Service-role keys stay server-side only.

**Monitoring & Logging:** Use Supabase logs, Edge Function logs, Expo/EAS build logs, and lightweight client error reporting initially. Add paid observability only when production usage justifies it.

**Scaling Strategy:** Start with managed free tiers. The first scale-up path is Supabase paid plan, then more formal monitoring/rate limiting/build capacity. Avoid adding separate backend hosting until Supabase Edge Functions and Postgres functions are insufficient.

### Decision Impact Analysis

**Implementation Sequence:**

1. Initialize Expo app with `create-expo-app` template `default@sdk-56`.
2. Initialize Supabase project, migrations, local env and generated types.
3. Implement auth/session handling and route guards.
4. Implement database schema, RLS policies and test fixtures.
5. Implement command functions for booking workflows.
6. Implement TanStack Query clients, Zod contracts and feature modules.
7. Implement notification mirroring and selective realtime.
8. Add CI checks, deployment config and lightweight monitoring.

**Cross-Component Dependencies:**

- Booking commands depend on Auth/RLS, relational schema, pricing rules and notification creation.
- Frontend planning screens depend on server read models plus command responses, not local-only state.
- Notifications depend on booking state transitions and must create in-app records even when push delivery is unavailable.
- i18n and theme tokens affect every screen and must be established before broad component implementation.
- Free-tier infrastructure constrains realtime usage, build frequency and observability depth in P0.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 10 areas: database naming, route naming, command naming, file structure, feature boundaries, API response format, error format, date/time format, loading/error UI, and booking state transitions.

### Naming Patterns

**Database Naming Conventions:**

- Tables: `snake_case`, plural: `student_profiles`, `availability_slots`, `in_app_notifications`.
- Columns: `snake_case`: `coach_id`, `student_id`, `created_at`, `expires_at`.
- Primary keys: `id`.
- Foreign keys: `{entity}_id`.
- Indexes: `idx_{table}_{columns}`.
- Unique constraints: `uniq_{table}_{columns}`.
- RLS policies: `{table}_{action}_{role_or_scope}`.

**API Naming Conventions:**

- Edge Function command names: `verb-noun`, kebab-case: `request-booking`, `approve-booking`, `refuse-booking`.
- Command schema names in TypeScript: `RequestBookingInput`, `RequestBookingResult`.
- JSON request/response fields exposed to app: `camelCase`.
- Database fields stay `snake_case`; mapping happens in typed data access helpers.

**Code Naming Conventions:**

- Components: `PascalCase`, e.g. `BookingStatusChip.tsx`.
- Hooks: `useCamelCase`, e.g. `useCoachSchedule`.
- Utility files: `kebab-case.ts`, e.g. `booking-status.ts`.
- Feature folders: `kebab-case`, e.g. `lesson-packs`.
- Constants/enums: explicit domain names, e.g. `BOOKING_STATUS`.

### Structure Patterns

**Project Organization:**

- Route files live in Expo Router `app/`.
- Business code lives in `features/{domain}/`.
- Shared UI primitives live in `ui/`.
- Shared contracts live in `contracts/`.
- Supabase client/data access lives in `lib/supabase/`.
- Tests are colocated for app code: `*.test.ts` or `*.test.tsx`.
- Supabase migrations live in `supabase/migrations/`.
- Edge Functions live in `supabase/functions/{command-name}/`.

**Feature Boundary Rule:**
Features may import from `ui/`, `contracts/`, `lib/`, and `features/*/types`, but must not reach into another feature's internal components or hooks.

### Format Patterns

**API Response Formats:**
All Edge Functions return one of:

```ts
type CommandSuccess<T> = { ok: true; data: T };
type CommandFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
    retryable?: boolean;
  };
};
```

**Data Exchange Formats:**

- Dates/times over API: ISO 8601 strings in UTC.
- Local display timezone handled only at UI boundary.
- Money: integer minor units plus currency, e.g. `{ amountCents: 4500, currency: "EUR" }`.
- Status values: lowercase string unions: `pending`, `confirmed`, `refused`, `expired`, `cancelled`.
- Missing optional values: `null`, not `undefined`, in API responses.

### Communication Patterns

**Event System Patterns:**

- Event names: dot notation, past tense: `booking.requested`, `booking.approved`, `notification.created`.
- Event payloads include: `eventId`, `eventType`, `occurredAt`, `actorUserId`, `subjectId`.
- P0 events may be stored as notification-related records; no separate event bus required.

**State Management Patterns:**

- Server state: TanStack Query only.
- UI state: local React state or colocated hooks.
- Query keys use array format: `["coach-schedule", coachId, rangeStart, rangeEnd]`.
- Mutation success invalidates specific related query keys, not the whole cache.

### Process Patterns

**Error Handling Patterns:**

- Edge Functions never expose SQL/raw internal errors to the client.
- Client maps `error.code` to translated user-facing copy.
- Booking conflicts use stable codes: `slot_unavailable`, `pending_limit_reached`, `student_pending_limit_reached`, `unauthorized`.
- Security failures log server-side detail but return generic client copy.

**Loading State Patterns:**

- Screen-level initial loads use skeletons matching final layout.
- Button mutations use disabled + inline progress state.
- Planning views keep previous data visible during range refetch when possible.
- Booking mutations must not optimistically confirm reservations before server success.

### Enforcement Guidelines

**All AI Agents MUST:**

- Keep booking rules in server-side commands or database constraints.
- Use RLS-protected reads and never expose service-role keys to client code.
- Use `snake_case` in database and `camelCase` in TypeScript app contracts.
- Add or update Zod schemas for every command input.
- Use design tokens for colors and theme values.
- Externalize user-facing text for FR/EN/ES.
- Add tests for RLS/private notes and booking conflict behavior when touching those areas.
- Never call Supabase Auth Admin APIs from client code; student provisioning and activation are server-only.
- Store activation token hashes only; enforce one-time use, 24-hour expiry, and revocation on regeneration.

**Pattern Enforcement:**

- TypeScript typecheck must pass.
- Supabase migrations must be committed.
- Edge Function contracts must include Zod schemas.
- PR/review notes should call out pattern violations explicitly.
- Architecture changes update this document before implementation divergence.

### Pattern Examples

**Good Examples:**

- `supabase/functions/request-booking/index.ts`
- `features/bookings/hooks/useRequestBooking.ts`
- `contracts/bookings/request-booking.ts`
- `student_profiles.coach_id`
- `idx_availability_slots_coach_start_at`

**Anti-Patterns:**

- Direct client update of `bookings.status = "confirmed"`.
- Hardcoded color like `#C65A2E` inside a component.
- Mixed API formats such as sometimes `{ data, error }` and sometimes raw JSON.
- Feature imports like `features/bookings/internal/...` from another feature.
- Local optimistic booking confirmation before server transaction succeeds.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
nextpoint/
├── README.md
├── AGENTS.md
├── RTK.md
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .gitignore
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml
├── apps/
│   └── mobile/
│       ├── app.json
│       ├── package.json
│       ├── tsconfig.json
│       ├── babel.config.js
│       ├── metro.config.js
│       ├── expo-env.d.ts
│       ├── .env.example
│       ├── app/
│       │   ├── _layout.tsx
│       │   ├── index.tsx
│       │   ├── (public)/
│       │   │   ├── _layout.tsx
│       │   │   └── index.tsx
│       │   ├── (auth)/
│       │   │   ├── _layout.tsx
│       │   │   ├── sign-in.tsx
│       │   │   └── sign-up.tsx
│       │   ├── (coach)/
│       │   │   ├── _layout.tsx
│       │   │   ├── planning/
│       │   │   │   ├── index.tsx
│       │   │   │   └── request/[bookingId].tsx
│       │   │   ├── availability/
│       │   │   │   ├── index.tsx
│       │   │   │   ├── new.tsx
│       │   │   │   └── [slotId].tsx
│       │   │   ├── students/
│       │   │   │   ├── index.tsx
│       │   │   │   ├── new.tsx
│       │   │   │   └── [studentId].tsx
│       │   │   ├── stats.tsx
│       │   │   ├── notifications.tsx
│       │   │   ├── messaging.tsx
│       │   │   └── profile.tsx
│       │   ├── (student)/
│       │   │   ├── _layout.tsx
│       │   │   ├── index.tsx
│       │   │   ├── slot/[slotId].tsx
│       │   │   ├── planning.tsx
│       │   │   ├── notifications.tsx
│       │   │   └── account.tsx
│       │   └── +not-found.tsx
│       ├── assets/
│       │   ├── fonts/
│       │   └── images/
│       ├── src/
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   ├── scheduling/
│       │   │   ├── bookings/
│       │   │   ├── notifications/
│       │   │   ├── messaging/
│       │   │   ├── students/
│       │   │   ├── pricing/
│       │   │   ├── lesson-packs/
│       │   │   ├── stats/
│       │   │   ├── i18n/
│       │   │   └── theme/
│       │   ├── lib/
│       │   │   ├── supabase/
│       │   │   │   ├── client.ts
│       │   │   │   ├── queries.ts
│       │   │   │   └── commands.ts
│       │   │   ├── query/
│       │   │   │   └── query-client.ts
│       │   │   └── dates/
│       │   │       └── format.ts
│       │   ├── ui/
│       │   │   ├── primitives/
│       │   │   ├── feedback/
│       │   │   ├── forms/
│       │   │   └── calendar/
│       │   └── types/
│       │       └── supabase.ts
│       └── test/
│           ├── setup.ts
│           └── fixtures/
├── packages/
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── contracts/
│           │   ├── bookings/
│           │   │   ├── request-booking.ts
│           │   │   ├── approve-booking.ts
│           │   │   ├── refuse-booking.ts
│           │   │   ├── cancel-booking.ts
│           │   │   └── modify-booking.ts
│           │   ├── lesson-packs/
│           │   ├── notifications/
│           │   └── messaging/
│           ├── domain/
│           │   ├── booking-status.ts
│           │   ├── slot-status.ts
│           │   └── roles.ts
│           └── errors/
│               └── command-errors.ts
├── supabase/
│   ├── config.toml
│   ├── seed.sql
│   ├── migrations/
│   │   ├── 0001_initial_schema.sql
│   │   ├── 0002_rls_policies.sql
│   │   └── 0003_booking_commands.sql
│   ├── functions/
│   │   ├── _shared/
│   │   │   ├── auth.ts
│   │   │   ├── cors.ts
│   │   │   ├── errors.ts
│   │   │   └── responses.ts
│   │   ├── request-booking/
│   │   │   └── index.ts
│   │   ├── approve-booking/
│   │   │   └── index.ts
│   │   ├── refuse-booking/
│   │   │   └── index.ts
│   │   ├── cancel-booking/
│   │   │   └── index.ts
│   │   ├── modify-booking/
│   │   │   └── index.ts
│   │   └── consume-lesson-pack/
│   │       └── index.ts
│   └── tests/
│       ├── rls/
│       │   ├── private-notes.test.sql
│       │   └── student-visibility.test.sql
│       └── booking/
│           ├── pending-limits.test.sql
│           ├── approve-conflict.test.sql
│           └── expiration.test.sql
└── docs/
    ├── architecture.md
    ├── api-commands.md
    ├── database-model.md
    └── development.md
```

### Architectural Boundaries

**API Boundaries:**

- App reads use Supabase client with RLS.
- Business mutations use Edge Functions only.
- Service-role keys exist only in Supabase functions or trusted server contexts.
- App contracts live in `packages/shared/src/contracts`.

**Component Boundaries:**

- Expo routes in `apps/mobile/app` compose screens only.
- Feature modules own business-aware hooks/components.
- `ui/` contains reusable primitives with no domain rules.
- Features cannot import another feature's internals.

**Service Boundaries:**

- `lib/supabase/queries.ts` handles RLS-safe reads.
- `lib/supabase/commands.ts` invokes Edge Functions.
- Edge Functions call SQL/RPC transaction logic and create notifications.

**Data Boundaries:**

- PostgreSQL is the source of truth.
- Database names use `snake_case`.
- App contracts use `camelCase`.
- Mapping happens in typed helpers, not ad hoc in screens.

### Requirements to Structure Mapping

**Auth, roles, access:** `features/auth`, `app/(auth)`, `supabase/migrations/*rls*`, `supabase/tests/rls`.

**Disponibilites/planning:** `features/scheduling`, `app/(coach)/availability`, `app/(coach)/planning`, `app/(student)/index.tsx`.

**Reservations:** `features/bookings`, booking contracts, booking Edge Functions, booking SQL tests.

**Notifications:** `features/notifications`, `app/(coach)/notifications.tsx`, `app/(student)/notifications.tsx`, notification contracts and DB tables.

**Messagerie coach:** `features/messaging`, `app/(coach)/messaging.tsx`, messaging contracts and DB tables for discussions linked to slots, booking requests, reservations or events.

**Tarifs:** `features/pricing`, coach profile/settings routes, pricing tables/migrations.

**Eleves/notes privees:** `features/students`, `app/(coach)/students`, RLS tests for private notes.

**Packs:** `features/lesson-packs`, `consume-lesson-pack` command, student detail screen.

**Stats:** `features/stats`, `app/(coach)/stats.tsx`.

**i18n/theme:** `features/i18n`, `features/theme`, `ui/`.

### Integration Points

**Internal Communication:**

- Screens call feature hooks.
- Feature hooks call `queries.ts` and `commands.ts`.
- Commands use shared Zod contracts.
- Mutations invalidate TanStack Query keys.

**External Integrations:**

- Supabase Auth.
- Supabase PostgreSQL/RLS.
- Supabase Edge Functions.
- Supabase Realtime selectively.
- Expo/EAS for builds.
- Vercel or equivalent for web.

**Data Flow:**
User action -> screen -> feature hook -> command contract validation -> Edge Function -> SQL transaction/RLS -> notification records -> typed response -> query invalidation -> UI update.

### File Organization Patterns

**Configuration Files:**
Root config owns workspace, shared TypeScript and CI. App-specific Expo config stays in `apps/mobile`.

**Source Organization:**
Domain logic lives by feature. Shared reusable contracts/types live in `packages/shared`.

**Test Organization:**
App tests colocated or under `apps/mobile/test`. Database/RLS/booking invariant tests live under `supabase/tests`.

**Asset Organization:**
Fonts/images live under `apps/mobile/assets`. Design tokens are implemented in `features/theme`.

### Development Workflow Integration

**Development Server Structure:**
Expo app runs from `apps/mobile`. Supabase local stack runs from `supabase`.

**Build Process Structure:**
Expo builds native/web from `apps/mobile`. Shared package is consumed as a workspace dependency.

**Deployment Structure:**
Supabase migrations/functions deploy from `supabase`. Web output deploys from Expo web build. Native builds use local Expo or EAS.

**README Requirement:**
The root README must explain Expo Router route groups, including that folders like `(coach)` and `(auth)` organize routes and layouts without appearing in the URL/path. Include an example such as `app/(coach)/planning/index.tsx -> /planning`.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All core technology choices work together: Expo React Native TypeScript with Expo Router, Supabase Auth/PostgreSQL/RLS, Supabase Edge Functions, TanStack Query, Zod, React Hook Form, and free-tier-compatible deployment. No contradictory decisions identified.

**Pattern Consistency:**
The implementation patterns support the architecture: `snake_case` database naming aligns with PostgreSQL, `camelCase` contracts align with TypeScript, Edge Function command names align with business workflows, and feature boundaries align with Expo Router app structure.

**Structure Alignment:**
The project structure supports all decisions: `apps/mobile` contains the Expo app, `supabase` contains database/functions/tests, and `packages/shared` contains reusable contracts/domain types.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
All PRD feature areas are structurally covered: auth, profiles, coach/student relationship, availability, booking, pricing, students/private notes, lesson packs, stats, notifications, i18n/theme, app mobile and webapp.

**Functional Requirements Coverage:**
All major FR categories are architecturally supported through dedicated feature modules, database schema areas, RLS policies, Edge Function commands, and route groups.

**Non-Functional Requirements Coverage:**
Mobile-first, performance, atomic booking, security, private notes confidentiality, app/web consistency, i18n, design tokens, and MVP simplicity are all addressed.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Critical decisions are documented: starter, data architecture, auth/security, API pattern, frontend architecture, infrastructure/deployment.

**Structure Completeness:**
The project tree is specific enough for implementation stories. It defines app routes, feature folders, shared contracts, Supabase migrations/functions/tests, docs, CI and env boundaries.

**Pattern Completeness:**
Naming, structure, response formats, date/time, money, events, state management, errors, loading states and enforcement rules are defined.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps:**

- Exact database schema details still need to be produced in implementation planning or database-model documentation.
- Exact RLS policies need to be written and tested during Supabase schema implementation.
- Push notification provider details remain to be selected when implementing notifications.
- UI styling library remains intentionally undecided; implementation should start with token-driven primitives unless a concrete need emerges.

**Nice-to-Have Gaps:**

- Add diagrams later for booking state transitions and data flow.
- Add README section explaining Expo Router route groups.
- Add `docs/api-commands.md` and `docs/database-model.md` during implementation setup.

### Validation Issues Addressed

No blocking issues found. The only user-raised clarification was Expo Router folder names in parentheses; this was addressed by adding a README requirement explaining route groups.

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** high

**Key Strengths:**

- Clear split between client reads and server-side business commands.
- Booking invariants protected by backend/database decisions.
- Free-tier-compatible stack aligned with MVP constraints.
- Strong consistency rules for AI agents.
- Mobile-first architecture while preserving webapp P0.

**Areas for Future Enhancement:**

- More detailed database model.
- Push provider decision.
- Booking state transition diagram.
- Production observability and rate limiting details.
- Paid-tier migration criteria once usage grows.

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently across all components.
- Respect project structure and boundaries.
- Refer to this document for architectural questions.
- Do not move booking rules into client-only logic.

**First Implementation Priority:**
Initialize the Expo app:

```bash
npx create-expo-app@latest apps/mobile --template default@sdk-56
```
