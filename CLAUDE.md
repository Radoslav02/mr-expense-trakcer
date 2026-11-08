# Expense tracker

React + TypeScript + Redux Toolkit + Firebase (Auth, Firestore) PWA, styled with Tailwind.
Checks: `npx tsc --noEmit -p tsconfig.json`, `npm run lint`, `npm test`, `npm run build`.

## Every change must work in English and Serbian

The app ships in **English and Serbian (Latin script)**. Anything new that a person can see or
hear — labels, buttons, headings, placeholders, hints, empty states, toasts, validation and
error messages, `aria-label`s, `title`s, alt text, page descriptions — must be added in **both**
languages. Never hard-code user-facing text in components, hooks, thunks or utils.

How it works (`src/i18n/`):

- `en/<namespace>.ts` is the source of truth; `sr/<namespace>.ts` is typed as
  `Messages['<namespace>']`, so a missing or extra Serbian key fails `tsc`. Add a key to both.
- Namespaces: `common`, `nav`, `auth`, `expenses`, `categories`, `dashboard`, `partner`,
  `settings`. Put a string in the namespace of the feature it belongs to; shared words go in
  `common`.
- In components: `const { t } = useI18n();` then `t.expenses.title`.
- Outside React (validation, thunks, selectors, utils): `getMessages().expenses.title`.
- Text with values is a function: `added: (title: string) => \`"${title}" added.\``.
- Counts: English uses `pluralEn(n, one, other)`; Serbian has three forms, use
  `pluralSr(n, one, few, many)` (1 trošak, 2 troška, 5 troškova; 11–14 take `many`).
- Memoized selectors that produce text must take `selectLanguage` as an input so they
  recompute when the language changes.
- Dates: use the helpers in `src/utils/dates.ts` (`formatMonthLabel`, `formatShortDate`, …);
  they use the current locale. Patterns per language live in `common.dateFormats`.
  Keys like `yyyy-MM-dd` use plain `format` without a locale.
- Money and percentages: use `src/utils/currency.ts` / `useCurrencyFormatter`, which format with
  the current language's locale.
- Built-in categories (`default-*` ids) show a translated name while their stored name is still
  the English default (`localizeCategory`). Stored data (expense titles, notes, category names
  people type) is never translated.

Serbian style: Latin script, informal "ti", short and natural ("Dodaj trošak", not "Dodavanje
troška"). Keep terms consistent with the existing dictionary: trošak/troškovi, kategorija,
podeljeno (split), samo ja (only me), ponavlja se svakog meseca (repeats monthly).

## Data and privacy

- Shared data lives in `users/{uid}/expenses` and `users/{uid}/categories`, which a connected
  partner can read. Private expenses/categories, recurring templates and income live in
  owner-only collections. Firestore rules are in `firestore.rules`; changes there must be
  deployed separately (`npm run deploy:rules`).
- Shared categories are synced between partners by `sharedKey` (`src/utils/sharedCategories.ts`).
