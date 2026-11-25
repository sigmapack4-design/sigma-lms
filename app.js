// SIGMA LMS — frontend
(function(){
  const app = document.getElementById('app');

  function customCourses(){
    try { return JSON.parse(localStorage.getItem('sigma-lms-custom') || '[]'); } catch(e){ return []; }
  }
  function allCourses(){ return (window.COURSES || []).concat(customCourses()); }
  function watchedKey(slug){ return 'sigma-lms-watched-' + slug; }
  function getWatched(slug){
    try { return new Set(JSON.parse(localStorage.getItem(watchedKey(slug)) || '[]')); } catch(e){ return new Set(); }
  }
  function setWatched(slug, set){ localStorage.setItem(watchedKey(slug), JSON.stringify(Array.from(set))); }
  function driveId(link){
    if(!link) return null;
    const m = String(link).match(/[-\w]{25,}/);
    return m ? m[0] : null;
  }

  let filterCat = 'All', query = '';

  function homeView(){
    const courses = allCourses();
    const cats = ['All'].concat(Array.from(new Set(courses.map(c=>c.category))));
    const list = courses.filter(c =>
      (filterCat==='All' || c.category===filterCat) &&
      (c.title + ' ' + c.category).toLowerCase().includes(query.toLowerCase())
    );
    app.innerHTML = `
      <section class="hero">
        <h1>Free Courses, <span>Learn & Earn</span></h1>
        <p>SIGMA (LWS) ke tamam free courses ek hi jagah. Course kholo, lessons ek ke baad ek dekho, ya pura course Google Drive se le lo.</p>
        <div class="searchbar"><input id="q" type="search" placeholder="Search courses..." value="${query.replace(/"/g,'&quot;')}"></div>
        <div class="chips">${cats.map(c=>`<button class="chip ${c===filterCat?'on':''}" data-cat="${c}">${c}</button>`).join('')}</div>
      </section>
      <section class="grid">
        ${list.map(c=>{
          const w = getWatched(c.slug);
          const pct = c.lessons.length ? Math.round(w.size / c.lessons.length * 100) : 0;
          return `<article class="card">
            <a href="#/course/${c.slug}"><img src="${c.thumb}" alt="${c.title}" loading="lazy"></a>
            <div class="card-body">
              <div class="card-cat">${c.category}</div>
              <h3><a href="#/course/${c.slug}">${c.title}</a></h3>
              <p>${c.desc || ''}</p>
              <div class="card-meta"><span class="pill">${c.lessons.length} Lessons</span><span class="pill">FREE</span></div>
              ${pct?`<div class="prog"><i style="width:${pct}%"></i></div>`:''}
            </div>
          </article>`;
        }).join('') || '<p class="empty">No course found.</p>'}
      </section>`;
    const q = document.getElementById('q');
    q.addEventListener('input', ()=>{ query = q.value; const pos = q.selectionStart; homeView(); const nq = document.getElementById('q'); nq.focus(); nq.setSelectionRange(pos,pos); });
    app.querySelectorAll('.chip').forEach(ch => ch.addEventListener('click', ()=>{ filterCat = ch.dataset.cat; homeView(); }));
  }

  function courseView(slug){
    const c = allCourses().find(x=>x.slug===slug);
    if(!c){ app.innerHTML = '<p class="empty">Course not found. <a href="#/">Back to courses</a></p>'; return; }
    let cur = 0;
    const w = getWatched(slug);

    function lessonSrc(l){ return l.id ? `https://drive.google.com/file/d/${l.id}/preview` : (l.src || ''); }

    function render(){
      const l = c.lessons[cur];
      const isFile = !l.id && l.src;
      app.innerHTML = `
        <a class="backlink" href="#/">← All Courses</a>
        <div class="course-head"><h2>${c.title}</h2><p>${c.desc || ''}</p></div>
        <div class="player-wrap" id="player">
          ${isFile
            ? `<video id="vid" src="${l.src}" controls autoplay playsinline></video>`
            : `<iframe src="${lessonSrc(l)}" allow="autoplay; fullscreen" allowfullscreen title="${l.t}"></iframe>`}
        </div>
        <p class="now">Now Playing: <b>Lesson ${cur+1} of ${c.lessons.length}</b> — ${l.t}</p>
        <div class="player-actions">
          <button class="btn ghost" id="prev" ${cur===0?'disabled':''}>← Previous</button>
          <button class="btn" id="nextdone">${cur===c.lessons.length-1 ? '✓ Mark Complete' : '✓ Complete & Next →'}</button>
          ${c.folder ? `<a class="btn green" href="${c.folder}" target="_blank" rel="noopener">Open Full Course in Drive</a>` : ''}
        </div>
        <h3 style="margin-bottom:6px">Course Lessons</h3>
        <div class="lessons">
          ${c.lessons.map((x,i)=>`<button class="lesson ${i===cur?'playing':''}" data-i="${i}"><span class="n">${i+1}</span><span>${x.t}</span>${w.has(i)?'<span class="done">✓ Watched</span>':''}</button>`).join('')}
        </div>`;
      const vid = document.getElementById('vid');
      if(vid){ vid.addEventListener('ended', ()=>{ w.add(cur); setWatched(slug, w); if(cur < c.lessons.length-1){ cur++; } render(); window.scrollTo({top:0,behavior:'smooth'}); }); }
      document.getElementById('prev').addEventListener('click', ()=>{ if(cur>0){ cur--; render(); } });
      document.getElementById('nextdone').addEventListener('click', ()=>{
        w.add(cur); setWatched(slug, w);
        if(cur < c.lessons.length-1){ cur++; render(); window.scrollTo({top:0,behavior:'smooth'}); }
        else { render(); alert('Mubarak! Course complete kar liya. Certificate ke liye WhatsApp channel par rabta karein.'); }
      });
      app.querySelectorAll('.lesson').forEach(b => b.addEventListener('click', ()=>{ cur = parseInt(b.dataset.i,10); render(); window.scrollTo({top:0,behavior:'smooth'}); }));
    }
    render();
  }

  function route(){
    const h = location.hash || '#/';
    const m = h.match(/^#\/course\/(.+)$/);
    if(m) courseView(decodeURIComponent(m[1])); else homeView();
  }
  window.addEventListener('hashchange', route);
  route();
})();
