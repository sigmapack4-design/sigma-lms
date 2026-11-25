// SIGMA LMS — frontend (NavikX-style layout, SIGMA branding)
(function(){
  const app = document.getElementById('app');
  const WA = 'https://whatsapp.com/channel/0029VbE0bx5BKfhvceuZrE1I';
  const LEVELS = { 'claude-ai-accounts-create-method':'Beginner', 'pinterest-blogging-course':'Intermediate' };

  const I = {
    play:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="15" height="14" rx="2"/><path d="M17 10l5-3v10l-5-3"/></svg>',
    doc:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>',
    drive:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"/><path d="M1 3h22v5H1zM10 12h4"/></svg>',
    chart:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    users:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    code:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>',
    pen:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
    mega:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-7-4 14-6-4-3 5v-6z"/></svg>',
    user:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    target:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    clock:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    device:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>',
    check:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.1V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
    chat:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>'
  };

  function customCourses(){ try { return JSON.parse(localStorage.getItem('sigma-lms-custom') || '[]'); } catch(e){ return []; } }
  function allCourses(){ return (window.COURSES || []).concat(customCourses()); }
  function watchedKey(slug){ return 'sigma-lms-watched-' + slug; }
  function getWatched(slug){ try { return new Set(JSON.parse(localStorage.getItem(watchedKey(slug)) || '[]')); } catch(e){ return new Set(); } }
  function setWatched(slug, set){ localStorage.setItem(watchedKey(slug), JSON.stringify(Array.from(set))); }
  function levelOf(c){ return c.level || LEVELS[c.slug] || 'Beginner'; }

  let fQuery = '', fCat = 'All', fLevel = 'All';

  function courseCard(c){
    const w = getWatched(c.slug);
    const pct = c.lessons.length ? Math.round(w.size / c.lessons.length * 100) : 0;
    return `<article class="card">
      <div class="thumbwrap"><a href="#/course/${c.slug}"><img src="${c.thumb}" alt="${c.title}" loading="lazy"></a><span class="badge">FREE</span></div>
      <div class="card-body">
        <div class="card-cat">${c.category}</div>
        <h3><a href="#/course/${c.slug}">${c.title}</a></h3>
        <div class="meta">🎬 ${c.lessons.length} Lessons • ${levelOf(c)}</div>
        ${pct ? `<div class="prog"><i style="width:${pct}%"></i></div>` : ''}
        <div class="price"><b>FREE</b><span>Full Course →</span></div>
      </div>
    </article>`;
  }

  function filtered(){
    return allCourses().filter(c =>
      (fCat==='All' || c.category===fCat) &&
      (fLevel==='All' || levelOf(c)===fLevel) &&
      (c.title + ' ' + c.category).toLowerCase().includes(fQuery.toLowerCase()));
  }

  function homeView(){
    if(window.__cd){ clearInterval(window.__cd); window.__cd = null; }
    const courses = allCourses();
    const cats = ['All'].concat(Array.from(new Set(courses.map(c=>c.category))));
    const totalLessons = courses.reduce((a,c)=>a+c.lessons.length,0);
    const catTiles = [
      {n:'AI Tools', s: courses.filter(c=>c.category==='AI Tools').length + ' Course', ic:I.code, cls:'c1'},
      {n:'Blogging', s: courses.filter(c=>c.category==='Blogging').length + ' Course', ic:I.pen, cls:'c2'},
      {n:'Marketing', s:'Coming Soon', ic:I.mega, cls:'c3'},
      {n:'Design', s:'Coming Soon', ic:I.pen, cls:'c4'},
      {n:'Personal Development', s:'Coming Soon', ic:I.user, cls:'c5'}
    ];
    app.innerHTML = `
    <section class="hero">
      <div class="hero-in">
        <div class="hero-copy">
          <h1>Learn Today.<span>Earn Tomorrow.</span></h1>
          <p>Free world-class courses and practical skills by SIGMA (LWS) — AI tools, blogging, marketing aur online earning, sab bilkul free.</p>
          <a class="btn" href="#/" data-goto="courses">Explore Courses</a>
        </div>
        <div class="hero-art">
          <span class="hero-dot" style="width:14px;height:14px;top:8%;left:12%"></span>
          <span class="hero-dot" style="width:9px;height:9px;top:30%;left:2%;background:#8b3dff"></span>
          <img src="assets/hero.webp" alt="Student learning with SIGMA LMS">
          <div class="chip-float cf1"><span class="ic g">${I.play}</span><span><b>Video Lessons</b><small>Watch Anytime</small></span></div>
          <div class="chip-float cf2"><span class="ic p">${I.check}</span><span><b>Free Courses</b><small>No Fees, Ever</small></span></div>
          <div class="chip-float cf3"><span class="ic y">${I.drive}</span><span><b>Drive Access</b><small>Full Course Files</small></span></div>
        </div>
      </div>
    </section>

    <div class="searchbar-card">
      <input id="q" type="search" placeholder="Search Courses — find your perfect course" value="${fQuery.replace(/"/g,'&quot;')}">
      <select id="fcat">${cats.map(c=>`<option ${c===fCat?'selected':''}>${c}</option>`).join('')}</select>
      <select id="flevel"><option>All</option><option ${fLevel==='Beginner'?'selected':''}>Beginner</option><option ${fLevel==='Intermediate'?'selected':''}>Intermediate</option><option ${fLevel==='Advanced'?'selected':''}>Advanced</option></select>
      <button class="btn purple" id="searchBtn">Search Courses</button>
    </div>

    <div class="features">
      <div class="feature"><span class="ic">${I.play}</span><span><b>Video Lessons</b><small>Learn at your pace</small></span></div>
      <div class="feature"><span class="ic">${I.doc}</span><span><b>Step-by-Step</b><small>Practice & improve</small></span></div>
      <div class="feature"><span class="ic">${I.drive}</span><span><b>Drive Files</b><small>Full course folders</small></span></div>
      <div class="feature"><span class="ic">${I.users}</span><span><b>Community</b><small>Connect & learn</small></span></div>
    </div>

    <div class="marquee"><div class="marquee-track">${'<span>AI TOOLS ✦ BLOGGING ✦ CHATGPT ✦ CANVA ✦ MIDJOURNEY ✦ AFFILIATE MARKETING ✦ PINTEREST ✦ ONLINE EARNING ✦ </span>'.repeat(2)}</div></div>

    <section class="section" id="categories">
      <div class="sec-head"><h2>Top Categories</h2><a href="#/" data-goto="courses">View All</a></div>
      <div class="cats">${catTiles.map(t=>`<div class="cat"><span class="ic ${t.cls}">${t.ic}</span><b>${t.n}</b><small>${t.s}</small></div>`).join('')}</div>
    </section>

    <section class="section" id="courses">
      <div class="sec-head"><h2>Popular Courses</h2><a href="#/" data-goto="courses">View All</a></div>
      <div class="grid" id="courseGrid">${filtered().map(courseCard).join('') || '<p class="empty">No course found for this search.</p>'}</div>
    </section>

    <section class="section">
      <div class="why">
        <div>
          <div class="sec-head"><h2>Why Choose <em>SIGMA LMS?</em></h2></div>
          <p>We provide complete, practical courses with step-by-step methods and lifetime free access, so you can learn real skills and start earning — without paying anything.</p>
          <div class="why-feats">
            <div class="wf"><span class="ic">${I.target}</span>Complete Methods</div>
            <div class="wf"><span class="ic">${I.clock}</span>Lifetime Free Access</div>
            <div class="wf"><span class="ic">${I.check}</span>Learn at Your Own Pace</div>
            <div class="wf"><span class="ic">${I.device}</span>Watch on Any Device</div>
            <div class="wf"><span class="ic">${I.chat}</span>Community Support</div>
          </div>
          <a class="btn purple" href="#/" data-goto="courses">Explore All Benefits</a>
        </div>
        <div class="why-art">
          <img class="big" src="assets/why-student.jpg" alt="Student learning online">
          <img class="s1" src="assets/edu-girl.jpg" alt="Student with laptop">
          <img class="s2" src="assets/offer-cap.jpg" alt="Graduation cap and books">
        </div>
      </div>
    </section>

    <section class="section">
      <div class="offer">
        <div class="offer-copy">
          <div class="lt">LIMITED TIME</div>
          <h3>Unlock Your Potential</h3>
          <p>All courses are 100% FREE. New courses drop soon — channel members hear first.</p>
          <div class="count">
            <div class="cd"><b id="cd-d">0</b><small>DAYS</small></div>
            <div class="cd"><b id="cd-h">0</b><small>HOURS</small></div>
            <div class="cd"><b id="cd-m">0</b><small>MINUTES</small></div>
            <div class="cd"><b id="cd-s">0</b><small>SECONDS</small></div>
          </div>
          <a class="btn" href="${WA}" target="_blank" rel="noopener">Join WhatsApp Channel</a>
        </div>
        <img src="assets/offer-cap.jpg" alt="Graduation cap on books">
      </div>
    </section>

    <section class="section" id="paths">
      <div class="sec-head"><h2>Popular Learning Paths</h2><a href="#/" data-goto="courses">View All</a></div>
      <div class="paths">
        <a class="path" href="#/course/claude-ai-accounts-create-method"><img src="assets/thumb-claude.jpg" alt="AI Tools Path"><div class="pb"><b>AI Tools Path</b><small>1 Course</small></div></a>
        <a class="path" href="#/course/pinterest-blogging-course"><img src="assets/thumb-pinterest.jpg" alt="Blogging Path"><div class="pb"><b>Blogging Path</b><small>1 Course</small></div></a>
        <div class="path"><img src="assets/edu-girl.jpg" alt="Marketing Path"><div class="pb"><b>Marketing Path</b><small>Coming Soon</small></div></div>
        <div class="path"><img src="assets/why-student.jpg" alt="Earning Path"><div class="pb"><b>Online Earning Path</b><small>Coming Soon</small></div></div>
      </div>
    </section>

    <section class="section">
      <div class="sec-head"><h2>Trending Courses</h2><a href="#/" data-goto="courses">View All</a></div>
      <div class="grid">${courses.slice().reverse().map(courseCard).join('')}</div>
    </section>

    <section class="section">
      <div class="edu">
        <div class="edu-copy">
          <h3>Education for everyone, everywhere</h3>
          <p>Join the SIGMA (LWS) community of learners and transform your future with free, practical courses — no fees, no sign-up.</p>
          <a class="btn purple" href="${WA}" target="_blank" rel="noopener">Join Now</a>
        </div>
        <div class="edu-art"><img src="assets/edu-girl.jpg" alt="Student learning with laptop"></div>
      </div>
      <div class="stats">
        <div class="st"><b data-count="${courses.length}">0</b><span>Free Courses</span></div>
        <div class="st"><b data-count="${totalLessons}">0</b><span>Video Lessons</span></div>
        <div class="st"><b>100%</b><span>Free Forever</span></div>
        <div class="st"><b>24/7</b><span>Watch Anytime</span></div>
      </div>
    </section>

    <section class="section" id="skills">
      <div class="sec-head"><h2>Explore by Skills</h2><a href="#/" data-goto="courses">View All</a></div>
      <div class="skills">
        <div class="skill"><span class="ic c1">${I.code}</span>AI Tools</div>
        <div class="skill"><span class="ic c2">${I.pen}</span>Pinterest Blogging</div>
        <div class="skill"><span class="ic c3">${I.target}</span>ChatGPT</div>
        <div class="skill"><span class="ic c4">${I.chart}</span>Canva Design</div>
        <div class="skill"><span class="ic c5">${I.mega}</span>Affiliate Marketing</div>
      </div>
    </section>

    <section class="section">
      <div class="sec-head"><h2>Why Learners Love SIGMA LMS</h2></div>
      <div class="learners">
        <div class="learner"><span class="q">“</span><p>Complete step-by-step methods in one place. Har lesson clear hai aur course bilkul free hai — koi fees, koi sign-up nahi.</p><div class="who"><span class="av">S</span><span><b>For Students</b><small>Learn new skills free</small></span></div></div>
        <div class="learner"><span class="q">“</span><p>Practical courses jo seedha earning se connected hain — AI tools, blogging aur affiliate marketing ke real methods.</p><div class="who"><span class="av">E</span><span><b>For Earners</b><small>Start online earning</small></span></div></div>
        <div class="learner"><span class="q">“</span><p>Lessons ek ke baad ek chalte hain, progress save hota hai, aur pura course Drive par bhi mil jata hai.</p><div class="who"><span class="av">C</span><span><b>For Creators</b><small>Grow with content</small></span></div></div>
      </div>
    </section>

    <section class="section">
      <div class="appbanner">
        <div class="app-copy">
          <h3>Learn on the go with SIGMA LMS</h3>
          <p>Access your courses, track progress, and learn anytime, anywhere — the website works perfectly on your mobile. No app install needed.</p>
          <div class="app-btns">
            <a class="btn" href="#/" data-goto="courses">Open Courses</a>
            <a class="btn ghost" href="${WA}" target="_blank" rel="noopener">WhatsApp Channel</a>
          </div>
        </div>
        <div class="phone-zone">
          <div class="phone">
            <div class="ph-greet">Hi, Learner!</div>
            <div class="ph-title">What do you want to learn today?</div>
            <div class="ph-card"><small>CONTINUE LEARNING</small><b>Pinterest Blogging Course</b><div class="ph-bar"><i></i></div></div>
            <div class="ph-card"><small>NEW COURSE</small><b>Muse AI Accounts Method</b></div>
            <div class="ph-chips"><span>AI Tools</span><span>Blogging</span><span>Marketing</span><span>Design</span></div>
          </div>
        </div>
      </div>
    </section>`;

    const grid = document.getElementById('courseGrid');
    function applyFilter(){ grid.innerHTML = filtered().map(courseCard).join('') || '<p class="empty">No course found for this search.</p>'; }
    const q = document.getElementById('q');
    q.addEventListener('input', ()=>{ fQuery = q.value; applyFilter(); });
    document.getElementById('fcat').addEventListener('change', e=>{ fCat = e.target.value; applyFilter(); });
    document.getElementById('flevel').addEventListener('change', e=>{ fLevel = e.target.value; applyFilter(); });
    document.getElementById('searchBtn').addEventListener('click', ()=>{ applyFilter(); document.getElementById('courses').scrollIntoView({behavior:'smooth'}); });

    // scroll-reveal animations + stats count-up (scroll-check, koi element miss nahi hota)
    const rvEls = app.querySelectorAll('.feature, .card, .cat, .path, .skill, .learner, .offer, .edu, .appbanner, .searchbar-card, .stats');
    rvEls.forEach((el,i)=>{ el.classList.add('rv'); el.style.transitionDelay = (i%3)*70 + 'ms'; });
    const counters = app.querySelectorAll('[data-count]');
    function animateCount(el){
      const end = parseInt(el.dataset.count,10); const t0 = performance.now();
      (function step(t){ const p = Math.min(1,(t-t0)/1100); el.textContent = Math.round(end * (1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(step); })(t0);
    }
    let ticking = false;
    function revealCheck(){
      const vh = window.innerHeight;
      rvEls.forEach(el=>{ if(!el.classList.contains('in') && el.getBoundingClientRect().top < vh*0.94) el.classList.add('in'); });
      counters.forEach(el=>{ if(!el.dataset.done && el.getBoundingClientRect().top < vh*0.94){ el.dataset.done = '1'; animateCount(el); } });
    }
    function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(()=>{ revealCheck(); ticking = false; }); } }
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onScroll);
    revealCheck(); setTimeout(revealCheck, 400); setTimeout(revealCheck, 1400);

    const target = new Date('2026-11-30T23:59:59+05:00').getTime();
    function tick(){
      const el = document.getElementById('cd-d'); if(!el){ clearInterval(window.__cd); return; }
      let diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff/86400000), h = Math.floor(diff%86400000/3600000), m = Math.floor(diff%3600000/60000), s = Math.floor(diff%60000/1000);
      el.textContent = d; document.getElementById('cd-h').textContent = h; document.getElementById('cd-m').textContent = m; document.getElementById('cd-s').textContent = s;
    }
    tick(); window.__cd = setInterval(tick, 1000);

    app.querySelectorAll('[data-goto]').forEach(a => a.addEventListener('click', ()=>{
      setTimeout(()=>{ const t = document.getElementById(a.dataset.goto); if(t) t.scrollIntoView({behavior:'smooth'}); }, 60);
    }));
  }

  function courseView(slug){
    if(window.__cd){ clearInterval(window.__cd); window.__cd = null; }
    const c = allCourses().find(x=>x.slug===slug);
    if(!c){ app.innerHTML = '<div class="coursepage"><p class="empty">Course not found. <a href="#/">Back to courses</a></p></div>'; return; }
    let cur = 0;
    const w = getWatched(slug);
    function render(){
      const l = c.lessons[cur];
      const isFile = !l.id && l.src;
      app.innerHTML = `<div class="coursepage">
        <a class="backlink" href="#/">← All Courses</a>
        <div class="course-head"><h2>${c.title}</h2><p>${c.desc || ''}</p></div>
        <div class="player-wrap">
          ${isFile
            ? `<video id="vid" src="${l.src}" controls autoplay playsinline></video>`
            : `<iframe src="https://drive.google.com/file/d/${l.id}/preview" allow="autoplay; fullscreen" allowfullscreen title="${l.t}"></iframe>`}
        </div>
        <p class="now">Now Playing: <b>Lesson ${cur+1} of ${c.lessons.length}</b> — ${l.t}</p>
        <div class="player-actions">
          <button class="btn ghost" id="prev" ${cur===0?'disabled':''}>← Previous</button>
          <button class="btn purple" id="nextdone">${cur===c.lessons.length-1 ? '✓ Mark Complete' : '✓ Complete & Next →'}</button>
          ${c.folder ? `<a class="btn green" href="${c.folder}" target="_blank" rel="noopener">Open Full Course in Drive</a>` : ''}
        </div>
        <h3>Course Lessons</h3>
        <div class="lessons">
          ${c.lessons.map((x,i)=>`<button class="lesson ${i===cur?'playing':''}" data-i="${i}"><span class="n">${i+1}</span><span>${x.t}</span>${w.has(i)?'<span class="done">✓ Watched</span>':''}</button>`).join('')}
        </div></div>`;
      const vid = document.getElementById('vid');
      if(vid){ vid.addEventListener('ended', ()=>{ w.add(cur); setWatched(slug, w); if(cur < c.lessons.length-1){ cur++; } render(); window.scrollTo({top:0,behavior:'smooth'}); }); }
      document.getElementById('prev').addEventListener('click', ()=>{ if(cur>0){ cur--; render(); } });
      document.getElementById('nextdone').addEventListener('click', ()=>{
        w.add(cur); setWatched(slug, w);
        if(cur < c.lessons.length-1){ cur++; render(); window.scrollTo({top:0,behavior:'smooth'}); }
        else { render(); alert('Mubarak! Course complete kar liya.'); }
      });
      app.querySelectorAll('.lesson').forEach(b => b.addEventListener('click', ()=>{ cur = parseInt(b.dataset.i,10); render(); window.scrollTo({top:0,behavior:'smooth'}); }));
    }
    render();
  }

  function route(){
    const h = location.hash || '#/';
    const m = h.match(/^#\/course\/(.+)$/);
    if(m) courseView(decodeURIComponent(m[1])); else homeView();
    window.scrollTo(0,0);
  }
  document.querySelectorAll('[data-goto]').forEach(a => a.addEventListener('click', ()=>{
    setTimeout(()=>{ const t = document.getElementById(a.dataset.goto); if(t) t.scrollIntoView({behavior:'smooth'}); }, 80);
  }));
  window.addEventListener('hashchange', route);
  route();
})();
