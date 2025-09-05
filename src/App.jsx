import React, { useEffect, useMemo, useRef, useState } from 'react'

const API = 'https://openlibrary.org/search.json'

function useDebouncedValue(value, delay=450){
  const [v, setV] = useState(value)
  useEffect(()=>{
    const t = setTimeout(()=> setV(value), delay)
    return ()=> clearTimeout(t)
  }, [value, delay])
  return v
}

export default function App(){
  // core search inputs
  const [title, setTitle] = useState('harry potter')
  const [author, setAuthor] = useState('')
  const [subject, setSubject] = useState('')
  const [isbn, setIsbn] = useState('')

  // filters & sort
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [lang, setLang] = useState('')
  const [sort, setSort] = useState('relevance')

  // pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  // data
  const [docs, setDocs] = useState([])
  const [numFound, setNumFound] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // modal
  const [active, setActive] = useState(null)
  const dialogRef = useRef(null)

  const debounced = useDebouncedValue({title, author, subject, isbn, yearFrom, yearTo, lang, sort, page, limit}, 450)

  useEffect(()=>{
    const controller = new AbortController()
    async function fetchBooks(){
      setLoading(true); setError('')
      try {
        const params = new URLSearchParams()
        if(debounced.title) params.set('title', debounced.title)
        if(debounced.author) params.set('author', debounced.author)
        if(debounced.subject) params.set('subject', debounced.subject)
        if(debounced.isbn) params.set('isbn', debounced.isbn)
        if(debounced.lang) params.set('language', debounced.lang)
        params.set('page', String(debounced.page))
        params.set('limit', String(debounced.limit))
        if(debounced.sort === 'new') params.set('sort', 'new')
        const url = `${API}?${params.toString()}`
        const res = await fetch(url, { signal: controller.signal })
        if(!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        // client-side year range filter
        const filtered = data.docs.filter(d => {
          if(!debounced.yearFrom && !debounced.yearTo) return true
          const y = d.first_publish_year
          if(!y) return false
          if(debounced.yearFrom && y < +debounced.yearFrom) return false
          if(debounced.yearTo && y > +debounced.yearTo) return false
          return true
        })
        const sorted = (()=>{
          if(debounced.sort === 'year-desc') return [...filtered].sort((a,b)=>(b.first_publish_year||0)-(a.first_publish_year||0))
          if(debounced.sort === 'year-asc') return [...filtered].sort((a,b)=>(a.first_publish_year||0)-(b.first_publish_year||0))
          return filtered
        })()
        setDocs(sorted)
        setNumFound(data.numFound || sorted.length)
      } catch(err){
        if(err.name !== 'AbortError'){
          setError(String(err))
          setDocs([]); setNumFound(0)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
    return ()=> controller.abort()
  }, [debounced])

  useEffect(()=>{ if(active && dialogRef.current && !dialogRef.current.open){ dialogRef.current.showModal() } }, [active])

  const pages = useMemo(()=>{
    const totalPages = Math.max(1, Math.ceil(numFound / limit))
    const max = Math.min(totalPages, 10) // clamp to 10 for UI
    const start = Math.max(1, Math.min(page - 4, (totalPages - max + 1)))
    return Array.from({length: max}, (_,i)=> start + i)
  }, [numFound, limit, page])

  function clearAll(){
    setTitle(''); setAuthor(''); setSubject(''); setIsbn(''); setYearFrom(''); setYearTo(''); setLang(''); setSort('relevance'); setPage(1)
  }

  // helper to open read view if possible; prefer openlibrary read link via edition key
  function getReadLink(d){
    // Open Library may expose edition keys; try to use the OL work key or edition key
    if(d.key) return `https://openlibrary.org${d.key}`
    return null
  }

  return (
    <div className="container">
      <header>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 19V7a2 2 0 0 1 2-2h5v14H5a2 2 0 0 1-2-2Zm10 2V5h4a2 2 0 0 1 2 2v10a4 4 0 0 1-4 4h-2Z" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <h1><span className="tag">Book Finder</span> for Alex</h1>
      </header>

      <section className="toolbar" aria-label="Search controls">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={title} onChange={e=>{ setTitle(e.target.value); setPage(1)}}
                 placeholder="e.g., The Hobbit" aria-describedby="helper-title" onKeyDown={e=>{ if(e.key==='Enter'){ /* immediate */ setPage(1) }}}/>
          <div className="helper" id="helper-title">Tip: Press <span className="kbd">Enter</span> to update instantly.</div>
        </div>
        <div className="field">
          <label htmlFor="author">Author</label>
          <input id="author" value={author} onChange={e=>{setAuthor(e.target.value); setPage(1)}}
                 placeholder="e.g., Agatha Christie" />
        </div>
        <div className="field">
          <label htmlFor="subject">Subject</label>
          <input id="subject" value={subject} onChange={e=>{setSubject(e.target.value); setPage(1)}}
                 placeholder="e.g., fantasy, mystery" />
        </div>
        <div className="field">
          <label htmlFor="isbn">ISBN</label>
          <input id="isbn" value={isbn} onChange={e=>{setIsbn(e.target.value); setPage(1)}}
                 placeholder="e.g., 9780439708180" />
        </div>
        <div className="controls" role="group" aria-label="Search actions">
          <button className="btn" onClick={()=> setPage(1)}>Search</button>
          <button className="btn secondary" onClick={clearAll}>Clear</button>
        </div>
      </section>

      <section className="toolbar" aria-label="Filters">
        <div className="field">
          <label htmlFor="yearFrom">Year From</label>
          <input id="yearFrom" type="number" min="0" max="2100" value={yearFrom} onChange={e=>{setYearFrom(e.target.value); setPage(1)}} placeholder="e.g., 1990"/>
        </div>
        <div className="field">
          <label htmlFor="yearTo">Year To</label>
          <input id="yearTo" type="number" min="0" max="2100" value={yearTo} onChange={e=>{setYearTo(e.target.value); setPage(1)}} placeholder="e.g., 2020"/>
        </div>
        <div className="field">
          <label htmlFor="lang">Language</label>
          <select id="lang" value={lang} onChange={e=>{setLang(e.target.value); setPage(1)}}>
            <option value="">Any</option>
            <option value="eng">English</option>
            <option value="fre">French</option>
            <option value="ger">German</option>
            <option value="spa">Spanish</option>
            <option value="ita">Italian</option>
            <option value="hin">Hindi</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="sort">Sort</label>
          <select id="sort" value={sort} onChange={e=> setSort(e.target.value)}>
            <option value="relevance">Relevance</option>
            <option value="new">Newest (API)</option>
            <option value="year-desc">Year ↓ (client)</option>
            <option value="year-asc">Year ↑ (client)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="limit">Per Page</label>
          <select id="limit" value={limit} onChange={e=> setLimit(+e.target.value)}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="40">40</option>
          </select>
        </div>
      </section>

      {error && <p role="alert" className="helper">Error: {error}</p>}
      <p className="helper">{loading ? 'Loading…' : (docs.length ? `Found ~${numFound.toLocaleString()} results` : 'No results found')}</p>

      <section className="grid" aria-live="polite">
        {docs.map((d, idx)=>{
          const coverId = d.cover_i
          const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'https://via.placeholder.com/300x400?text=No+Cover'
          const authors = (d.author_name || []).slice(0,2).join(', ')
          const year = d.first_publish_year || '—'
          return (
            <article key={`${d.key}-${idx}`} className="card" onClick={()=> setActive(d)} role="button" tabIndex={0} onKeyDown={e=>{ if(e.key==='Enter'){ setActive(d) }}}>
              <img className="cover" src={cover} alt={`Cover of ${d.title}`} loading="lazy" />
              <div className="content">
                <h3 className="title">{d.title}</h3>
                <div className="meta">{authors || 'Unknown author'} • {year}</div>
              </div>
            </article>
          )
        })}
      </section>

      <footer className="footer">
        <div className="helper">Use ←/→ to navigate pages when focused on pagination.</div>
        <nav className="pagination" aria-label="Pagination" onKeyDown={e=>{
          if(e.key==='ArrowRight') setPage(p=> p+1)
          if(e.key==='ArrowLeft') setPage(p=> Math.max(1,p-1))
        }}>
          {pages.map(p => (
            <button key={p} className="pill" aria-current={p===page?'page':undefined} onClick={()=> setPage(p)}>{p}</button>
          ))}
        </nav>
      </footer>

      <dialog ref={dialogRef} onClose={()=> setActive(null)}>
        {active && (
          <div className="modal-body">
            <img className="cover" style={{borderRadius:12}} src={active.cover_i ? `https://covers.openlibrary.org/b/id/${active.cover_i}-L.jpg` : 'https://via.placeholder.com/300x400?text=No+Cover'} alt={`Cover of ${active.title}`} />
            <div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', gap:8}}>
                <h2 style={{margin:'0 0 .4rem'}}>{active.title}</h2>
                <form method="dialog"><button className="pill">Close</button></form>
              </div>
              <p className="meta">by {(active.author_name||[]).join(', ') || 'Unknown'}</p>
              <p><strong>First published:</strong> {active.first_publish_year || '—'}</p>
              <p><strong>Edition count:</strong> {active.edition_count || '—'}</p>
              <p><strong>Subjects:</strong> {(active.subject||[]).slice(0,10).join(', ') || '—'}</p>
              <div className="controls">
                {active.key && <a className="btn" href={`https://openlibrary.org${active.key}`} target="_blank" rel="noreferrer">More on Open Library</a>}
                {active.isbn && active.isbn[0] && <a className="btn secondary" href={`https://openlibrary.org/isbn/${active.isbn[0]}`} target="_blank" rel="noreferrer">ISBN Page</a>}
                {/* Read link prefers work key or edition page */}
                {getReadLink(active) && <a className="btn" href={getReadLink(active)} target="_blank" rel="noreferrer">Read</a>}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}
