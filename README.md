# MemFlip

MemFlip is an AI-assisted flashcard application for creating, refining,
organising, and studying focused learning material.

The product combines fast AI drafting with deliberate human review: generated
cards remain editable drafts until the learner approves and saves them.

[Open MemFlip](https://mem-flip.live)

## Highlights

- Generate a deck from a topic with Groq-powered AI.
- Start manually and build a deck without AI.
- Edit every question and answer before saving.
- Add or remove draft cards, with undo support for removals.
- Search and sort saved decks.
- Browse a complete deck or study one card at a time.
- Flip cards with mouse, touch, Enter, or Space.
- Navigate study sessions with buttons or arrow keys.
- Reflect on recall with Again, Hard, Good, and Easy responses.
- Review a clear session summary after completing a deck.
- Use the application comfortably across mobile, tablet, and desktop layouts.

## Product experience

### Create

Enter a focused subject and choose between 3 and 30 cards. MemFlip shows a
layout-matched loading state while the draft is generated and preserves the
topic if generation fails.

Generated cards are clearly marked as unsaved. Questions and answers use
auto-resizing fields, inline validation, and an explicit save state. Replacing
an existing draft requires confirmation.

### Organise

Saved decks live in a searchable, sortable library. Loading, empty, no-result,
and network-error states are distinct, so the interface always communicates
what is happening and what to do next.

### Study

Each saved deck supports two views:

- **Study:** A focused, one-card experience with progress, directional
  navigation, recall feedback, and a completion summary.
- **Browse all:** A responsive grid for scanning and flipping every card in the
  deck.

Flashcards use a stable 3D scene to avoid layout shifts or face bleed during
flips. Long content scrolls within the card without changing its dimensions.

## Accessibility

MemFlip includes:

- Full keyboard navigation and visible focus states.
- A skip link and semantic page structure.
- Accessible dialogs with focus trapping, Escape handling, focus restoration,
  and scroll locking.
- Screen-reader announcements for card side, progress, loading, errors, and
  completion.
- Comfortable touch targets and sufficient colour contrast.
- A complete `prefers-reduced-motion` fallback, including non-animated card
  flipping.

## Technology

- [Next.js](https://nextjs.org/) App Router and TypeScript
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/) with shared design tokens
- [Clerk](https://clerk.com/) for authentication
- [Cloud Firestore](https://firebase.google.com/docs/firestore) for saved decks
- [Groq](https://groq.com/) for AI generation
- [Vercel Analytics](https://vercel.com/analytics)

No separate animation library is required. Motion is implemented with
lightweight CSS transforms and opacity transitions.

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- Clerk, Firebase, and Groq projects

### Install

```bash
git clone git@github.com:Chareeef/MemFlip.git
cd MemFlip
npm install
```

### Environment variables

Create `.env.local` and provide:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

GROQ_API_KEY=

FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=
```

For a project already connected to Vercel, the variables can be pulled with:

```bash
npx vercel link
npx vercel env pull .env.local
```

Use `--environment=production` or `--environment=preview` when you need a
different Vercel environment.

Never commit `.env.local` or expose its values in client-side code.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available commands

```bash
npm run dev
npm run lint
npm exec tsc -- --noEmit
npm run build
npm start
```

## Project structure

```text
app/
├── api/                    # Groq generation and Firestore routes
├── components/
│   ├── ui/                 # Shared button, modal, and empty-state primitives
│   ├── Flashcards.tsx      # Responsive browseable card grid
│   └── StudySession.tsx    # Focused study and completion flow
├── generate_flashcards/    # AI and manual deck creation
├── home/                   # Authenticated deck library
├── globals.css             # Design tokens, shared styles, and motion
└── page.tsx                # Public landing page
```

## Data model

A flashcard contains two string fields:

```ts
interface Flashcard {
  front: string;
  back: string;
}
```

Decks are currently stored by subject under each authenticated user. Review
responses are intentionally session-only because the current backend does not
yet include a spaced-repetition scheduling model.

## Validation

Before publishing changes, run:

```bash
npm run lint
npm exec tsc -- --noEmit
npm run build
git diff --check
```

## License

No license has been specified for this repository.
