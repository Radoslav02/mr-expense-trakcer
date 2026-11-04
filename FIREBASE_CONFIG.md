# Firebase configuration

The app uses one Firebase project: Firestore is the database and Firebase Auth handles sign-in.
There is no custom backend.

## Where the config lives

All Firebase values come from environment variables. **No real values are committed.**

| Firebase config key | Environment variable                |
| ------------------- | ----------------------------------- |
| `apiKey`            | `VITE_FIREBASE_API_KEY`             |
| `authDomain`        | `VITE_FIREBASE_AUTH_DOMAIN`         |
| `projectId`         | `VITE_FIREBASE_PROJECT_ID`          |
| `storageBucket`     | `VITE_FIREBASE_STORAGE_BUCKET`      |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId`             | `VITE_FIREBASE_APP_ID`              |
| `measurementId`     | `VITE_FIREBASE_MEASUREMENT_ID`      |

- **Local development:** copy `.env.example` to `.env` and fill in the values. Get them from
  Firebase console → Project settings → General → *Your apps* → Web app → *SDK setup and
  configuration*. `.env` is git-ignored.
- **Vercel:** add the same keys under Project → Settings → Environment Variables. Set
  `VITE_FIREBASE_AUTH_DOMAIN` to your Vercel domain (see the README).
- **Firebase CLI** (only needed for `npm run deploy:rules`): copy `.firebaserc.example` to
  `.firebaserc` and put your project ID in it. `.firebaserc` is git-ignored too.

The app refuses to start with a clear error if the API key or project ID is missing
(`src/services/firebase/firebase.ts`).

### How private are these values?

A Firebase web config identifies your project. Every browser that loads the app downloads it, so
it can't be fully hidden. Keeping it in `.env` stops it from being copied into the repository.
What actually protects your data is:

1. **Firestore security rules** (`firestore.rules`): each person can only read and write their own
   data, plus read their partner's after they've opted in.
2. **Authorized domains** in Firebase Auth: only your domains can sign users in.
3. Optionally, an **API key restriction** in Google Cloud console → Credentials: limit the key to
   your Vercel domain and `localhost`.

## Initialization

`src/services/firebase/firebase.ts` initializes Firebase once and exports `app`, `db` and `auth`.
Analytics is only started when `isSupported()` resolves to `true` (it is not available in every
browser or in private windows).

## Data model

```
users/{uid}                      profile doc: displayName, email, currency, monthlyBudget, createdAt
users/{uid}/categories/{id}      name, color, icon, isDefault, createdAt
users/{uid}/expenses/{id}        title, amount, categoryId, date, note, paymentMethod, createdAt, updatedAt
```

- `date`, `createdAt` and `updatedAt` are Firestore `Timestamp`s. The service layer converts them
  to ISO strings so Redux state stays serializable.
- Default categories use fixed IDs (`default-food`, `default-other`, ...). That makes first-login
  seeding idempotent, and `default-other` is the target when a category is deleted and its
  expenses are reassigned.

## Security rules

`firestore.rules` lets each signed-in user read and write only their own subtree:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

The recursive wildcard `{document=**}` also matches the `users/{userId}` document itself, so the
profile document is covered too.
