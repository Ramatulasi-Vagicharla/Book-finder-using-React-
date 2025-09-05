# 📚 Book Finder — Take-Home Challenge

A sleek React app that allows users to search for books using the **Open Library API**.  
Built for **Alex** (college student persona) who wants to easily search and discover books.

---

## ✨ Features
- 🔎 Search by **title**, **author**, **subject**, and **ISBN**
- 🎚 Filters: **language** and **year range**
- ↕ Sorting options:
  - Relevance (API)
  - Newest (API)
  - Year ↑ / Year ↓ (client-side)
- 📖 Book detail modal with:
  - Cover image  
  - Title, authors, published year  
  - Subjects, edition count  
  - Links to **Open Library**, **ISBN page**, and **Read button** (if available)  
- ⌨️ **Keyboard support** for pagination (←/→) and modal access
- ⚡ **Debounced search** (450ms) with `AbortController` to cancel stale requests
- 📱 Responsive card grid for mobile & desktop
- 🚦 Graceful error handling and "no results" messages

---

## 🧪 API
- **Search endpoint**  
  `https://openlibrary.org/search.json?title={bookTitle}`
- **Covers**  
  `https://covers.openlibrary.org/b/id/{coverID}-{size}.jpg`

Example:  
[Harry Potter search](https://openlibrary.org/search.json?title=harry+potter)

---

## 🚀 Getting Started

### Run locally

git clone https://github.com/YOUR-USERNAME/book-finder.git
cd book-finder
npm install
npm run dev
