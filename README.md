# Book Finder — for Alex

A sleek React app to search books using the **Open Library** public API (no auth). Built with Vite and plain CSS.

## ✨ Features
- Search by **title**, **author**, **subject**, and **ISBN**
- Filters: **language** and **first publish year range**
- Sorting: relevance (API), newest (API), year ↑/↓ (client-side)
- Pagination controls + keyboard support (←/→ and numbered pages)
- Responsive card grid with covers
- Accessible details dialog with extra links
- Debounced search (400-500ms) and request cancellation using `AbortController`
- Graceful error states and "no results" feedback

## 🔧 Bonus features (explicit)
- **Modal with book details**: cover, title, authors, published year, subjects, links to Open Library and ISBN pages, and a 'Read' quick-link (if available).
- **Debounce + cancellation**: prevents excessive API calls and cancels stale requests.
- **Keyboard pagination**: focus the pagination and use ArrowLeft/ArrowRight to navigate pages.

## 🧪 API
- Search endpoint: `https://openlibrary.org/search.json`
- Covers: `https://covers.openlibrary.org/b/id/{coverId}-M.jpg`

## 🚀 Run locally
```bash
npm install
npm run dev
```

## 🏖 Deploy quickly
- **StackBlitz / CodeSandbox:** Upload the ZIP or import the repo.
- Ensure `package.json` dependencies are installed by the online environment.

## 📦 Project structure
```
book-finder-react/
├─ public/
│  └─ favicon.svg
├─ src/
│  ├─ App.jsx
│  └─ main.jsx
├─ index.html
├─ package.json
├─ vite.config.js
└─ README.md
```

## ✅ Submission mapping (rubric)
- **Framework:** React (Vite)
- **Styling:** Plain CSS (inlined in index.html)
- **Data fetching:** Open Library API (no auth)
- **State management:** React hooks (useState/useEffect/useMemo)
- **Accessibility:** keyboard navigation, aria labels, dialog element
- **Extra:** debounce+abort, modal action buttons, keyboard pagination

Enjoy! 📚
