// SIGMA LMS — design-set rebuild (Home / Courses / Player / Login / Dashboard / Certificates)
(function(){
  const $ = (s, el) => (el || document).querySelector(s);
  const app = $('#app');
  const CHANNEL = 'https://whatsapp.com/channel/0029VbE0bx5BKfhvceuZrE1I';

  function getCourses(){
    let custom = [];
    try { custom = JSON.parse(localStorage.getItem('sigma-lms-custom') || '[]'); } catch(e){}
    return (window.COURSES || []).concat(custom);
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const totalLessons = cs => cs.reduce((n, c) => n + (c.lessons ? c.lessons.length : 0), 0);

  /* ---------- profile / session / progress (saved on this device) ---------- */
  const profile = () => { try { return JSON.parse(localStorage.getItem('sigma-lms-profile') || 'null'); } catch(e){ return null; } };
  const session = () => localStorage.getItem('sigma-lms-session') || '';
  const hash = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h); };
  const watched = slug => { try { return JSON.parse(localStorage.getItem('sigma-lms-watched-' + slug) || '[]'); } catch(e){ return []; } };
  const setWatched = (slug, arr) => localStorage.setItem('sigma-lms-watched-' + slug, JSON.stringify(arr));
  const enrolledMap = () => { try { return JSON.parse(localStorage.getItem('sigma-lms-enrolled') || '{}'); } catch(e){ return {}; } };
  const enroll = slug => { const m = enrolledMap(); if (!m[slug]) { m[slug] = Date.now(); localStorage.setItem('sigma-lms-enrolled', JSON.stringify(m)); } };
  const pct = c => { const w = watched(c.slug).length; return c.lessons.length ? Math.round(w / c.lessons.length * 100) : 0; };
  const priceOf = c => Math.max(0, parseInt(c.price || 0, 10) || 0);
  const fmtRs = n => 'Rs ' + Number(n).toLocaleString('en-US');
  const ownedMap = () => { try { return JSON.parse(localStorage.getItem('sigma-lms-owned') || '{}'); } catch(e){ return {}; } };
  const owned = slug => !!ownedMap()[slug];
  const coupons = () => { try { return JSON.parse(localStorage.getItem('sigma-lms-coupons') || '[]'); } catch(e){ return []; } };
  function findCoupon(code, slug){
    const c = coupons().find(x => x.code === String(code || '').trim().toUpperCase() && x.active !== false && (x.course === 'all' || x.course === slug));
    return c || null;
  }
  function discountFor(cp, price){
    if (!cp) return 0;
    return cp.type === 'pct' ? Math.round(price * Math.min(100, cp.value) / 100) : Math.min(price, cp.value);
  }
  function recordVisit(){
    const d = new Date(); const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    let v = []; try { v = JSON.parse(localStorage.getItem('sigma-lms-visits') || '[]'); } catch(e){}
    if (!v.includes(key)) { v.push(key); localStorage.setItem('sigma-lms-visits', JSON.stringify(v.slice(-120))); }
  }
  function streak(){
    let v = []; try { v = JSON.parse(localStorage.getItem('sigma-lms-visits') || '[]'); } catch(e){}
    const set = new Set(v); let n = 0; const d = new Date();
    while (true) {
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      if (set.has(key)) { n++; d.setDate(d.getDate() - 1); } else break;
    }
    return n;
  }
  function syncAuthBtn(){
    const b = $('#authBtn'); if (!b) return;
    const p = profile();
    if (session() && p) {
      b.textContent = (p.name || 'S').trim().charAt(0).toUpperCase();
      b.className = 'avatarbtn'; b.setAttribute('href', '#/dashboard'); b.title = p.name;
    } else {
      b.textContent = 'Login'; b.className = 'loginbtn'; b.setAttribute('href', '#/login'); b.title = '';
    }
  }

  /* ---------- icons ---------- */
  const I = {
    play: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    clock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    book: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>',
    users: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5"/><path d="M16 5a3.5 3.5 0 0 1 0 7M21.5 20c-.5-2.4-1.9-4-4-4.7"/></svg>',
    star: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>',
    check: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6L9 17l-5-5"/></svg>',
    cert: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="13" rx="2"/><circle cx="12" cy="10.5" r="2.6"/><path d="M10 16.5L9 21l3-1.8L15 21l-1-4.5"/></svg>',
    chart: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>',
    flame: '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 1.5s.75 2.62-1.13 5.25C10.88 8.63 9.75 10.13 9.75 12a3.75 3.75 0 0 0 7.5 0c0-1.31-.56-2.44-1.31-3.56-.19.75-.75 1.5-1.69 1.87.56-2.62.19-6.37-.75-8.81zM12 22.5a6.75 6.75 0 0 1-6.75-6.75c0-.47.06-.94.16-1.36A8.44 8.44 0 0 0 12 22.5z" transform="scale(0.94) translate(0.7,0.4)"/></svg>',
    home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    gear: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h0A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09c0 .68.4 1.3 1 1.55.61.26 1.32.1 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v0c.26.61.87 1 1.55 1H21a2 2 0 1 1 0 4h-.09c-.68 0-1.3.4-1.51 1z"/></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6d6d85" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>'
  };

  /* ---------- shared pieces ---------- */
  function courseCard(c, i){
    const p = pct(c);
    const chip = i === 0 ? 'Popular' : (i === 1 ? 'Trending' : 'Free');
    return `<article class="ccard rv">
      <a class="thumbwrap" href="#/course/${c.slug}"><img src="${esc(c.thumb)}" alt="${esc(c.title)}" loading="lazy"><span class="cchip ${chip === 'Free' ? 'free' : ''}">${chip}</span></a>
      <div class="ccard-body">
        <h3><a href="#/course/${c.slug}">${esc(c.title)}</a></h3>
        <p class="cdesc">${esc(c.desc)}</p>
        <div class="cmeta">${I.clock}<span>${c.lessons.length} Lessons • ${esc(c.category)}</span></div>
        ${p > 0 ? `<div class="prog"><i style="width:${p}%"></i></div>` : ''}
        ${priceOf(c) > 0
          ? `<div class="crow"><span class="paidprice">${fmtRs(priceOf(c))}</span>${owned(c.slug)
              ? `<a class="btn sm" href="#/course/${c.slug}">Continue →</a>`
              : `<a class="btn sm" href="#/checkout/${c.slug}">Buy Now →</a>`}</div>`
          : `<div class="crow"><span class="freeprice">FREE</span><a class="btn sm" href="#/course/${c.slug}" data-enroll="${c.slug}">${p > 0 ? 'Continue →' : 'Enroll Now →'}</a></div>`}
      </div>
    </article>`;
  }
  function bindEnroll(scope){
    scope.querySelectorAll('[data-enroll]').forEach(a => a.addEventListener('click', () => enroll(a.getAttribute('data-enroll'))));
  }
  function revealCheck(){
    document.querySelectorAll('.rv:not(.in)').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add('in');
    });
  }

  /* ---------- HOME ---------- */
  function homeView(){
    const cs = getCourses();
    app.innerHTML = `
    <div class="wrap">
      <section class="hero"><div class="hero-in">
        <div>
          <span class="hero-badge">100% Free Learning Platform</span>
          <h1>Learn Skills. <span class="grad">Build Future.</span></h1>
          <p>Upskill with free online courses by SIGMA (LWS). Learn anytime, anywhere, track your progress and earn certificates.</p>
          <div class="hero-btns">
            <a class="btn white" href="#/courses">Explore Courses</a>
            <a class="btn outline" href="#/signup">Get Started Free</a>
          </div>
          <div class="hero-stats">
            <span class="hs">${I.users}<span><b>${cs.length}</b> Courses</span></span>
            <span class="hs">${I.book}<span><b>${totalLessons(cs)}</b> Video Lessons</span></span>
            <span class="hs">${I.star}<span><b>100%</b> Free</span></span>
          </div>
        </div>
        <div class="hero-photo"><img src="assets/edu-girl.jpg" alt="Student learning online with SIGMA LMS"></div>
      </div></section>
    </div>

    <section class="section">
      <div class="sec-head"><h2>Popular Courses</h2><p>We provide the best learning experience to help you succeed</p></div>
      <div class="cgrid">${cs.map(courseCard).join('') || '<p class="empty">Courses are coming soon.</p>'}</div>
    </section>

    <section class="section">
      <div class="sec-head left"><h2>Why Choose Us</h2><p>We provide the best learning experience to help you succeed</p></div>
      <div class="why-grid">
        <div class="why-item rv"><span class="ic">${I.play}</span><span><b>Step-by-Step Video Lessons</b><small>Every course is broken into simple video lessons — watch them in order, one after another.</small></span></div>
        <div class="why-item rv"><span class="ic">${I.clock}</span><span><b>Flexible Learning</b><small>Study at your own pace with 24/7 access to all courses and materials, on any device.</small></span></div>
        <div class="why-item rv"><span class="ic">${I.chart}</span><span><b>Track Your Progress</b><small>Your dashboard shows enrolled courses, completed lessons and your study streak.</small></span></div>
        <div class="why-item rv"><span class="ic">${I.cert}</span><span><b>Free Certificates</b><small>Complete a course and download your Certificate of Completion — free, forever.</small></span></div>
      </div>
    </section>

    <section class="section">
      <div class="sec-head"><h2>Built for Learners</h2><p>Everything a student needs — without paying anything</p></div>
      <div class="bgrid">
        <div class="bcard rv"><span class="ic">${I.check}</span><b>Truly Free</b><p>No fees, no hidden charges. Every course on SIGMA LMS is completely free for everyone.</p></div>
        <div class="bcard rv"><span class="ic">${I.book}</span><b>Full Drive Access</b><p>Every course also opens in Google Drive, so you can save the complete course files.</p></div>
        <div class="bcard rv"><span class="ic">${I.users}</span><b>Community Support</b><p>New courses, methods and updates are announced first on the SIGMA (LWS) WhatsApp channel.</p></div>
      </div>
    </section>

    <section class="section">
      <div class="cta rv">
        <h3>Start Learning Today — It's Free</h3>
        <p>Create your free account, enroll in a course and earn your first certificate.</p>
        <a class="btn white" href="#/signup">Create Free Account</a>
      </div>
    </section>`;
    bindEnroll(app);
    window.scrollTo(0, 0);
    revealCheck();
  }

  /* ---------- COURSES PAGE ---------- */
  let cq = '', ccat = 'All', csort = 'popular';
  function coursesView(){
    const cs = getCourses();
    const cats = ['All'].concat(Array.from(new Set(cs.map(c => c.category))));
    app.innerHTML = `
    <div class="page-head">
      <div><h1>Courses</h1><p>Discover and enroll in courses to boost your skills</p></div>
      <label class="searchbox">${I.search}<input id="cq" type="search" placeholder="Search courses..." value="${esc(cq)}"></label>
    </div>
    <div class="filters">
      <div class="chips">${cats.map(c => `<button class="chip ${c === ccat ? 'on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <select class="sortsel" id="csort">
        <option value="popular" ${csort === 'popular' ? 'selected' : ''}>Sort by: Popular</option>
        <option value="az" ${csort === 'az' ? 'selected' : ''}>Sort by: A to Z</option>
        <option value="lessons" ${csort === 'lessons' ? 'selected' : ''}>Sort by: Most Lessons</option>
      </select>
    </div>
    <p class="showing" id="showing"></p>
    <section class="section" style="padding-top:18px"><div class="cgrid" id="cgrid"></div></section>`;
    const grid = $('#cgrid'), showing = $('#showing');
    function draw(){
      let list = cs.filter(c => (ccat === 'All' || c.category === ccat) && (c.title + ' ' + c.desc).toLowerCase().includes(cq.toLowerCase()));
      if (csort === 'az') list = list.slice().sort((a, b) => a.title.localeCompare(b.title));
      if (csort === 'lessons') list = list.slice().sort((a, b) => b.lessons.length - a.lessons.length);
      showing.textContent = 'Showing ' + list.length + ' of ' + cs.length + ' courses';
      grid.innerHTML = list.map(courseCard).join('') || '<p class="empty">No course matches your search.</p>';
      bindEnroll(grid);
      revealCheck();
    }
    draw();
    $('#cq').addEventListener('input', e => { cq = e.target.value; draw(); });
    $('#csort').addEventListener('change', e => { csort = e.target.value; draw(); });
    app.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => {
      ccat = b.getAttribute('data-cat');
      app.querySelectorAll('[data-cat]').forEach(x => x.classList.toggle('on', x === b));
      draw();
    }));
    window.scrollTo(0, 0);
  }

  /* ---------- COURSE PLAYER ---------- */
  function courseView(slug){
    const c = getCourses().find(x => x.slug === slug);
    if (!c) { app.innerHTML = '<div class="coursepage"><a class="backlink" href="#/courses">← All Courses</a><p class="empty">Course not found.</p></div>'; return; }
    enroll(slug);
    if (priceOf(c) > 0 && !owned(slug)) {
      app.innerHTML = `
      <div class="coursepage">
        <a class="backlink" href="#/courses">← All Courses</a>
        <div class="course-head"><h2>${esc(c.title)}</h2><p>${esc(c.desc)}</p></div>
        <div class="player-wrap"><img src="${esc(c.thumb)}" alt="${esc(c.title)}" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block"></div>
        <div class="cert-banner" style="background:#FBF6E3;border-color:#D4AF37">
          <span style="font-size:32px">🔒</span>
          <span style="flex:1;min-width:220px"><b style="color:#2b1065">Paid Course — ${fmtRs(priceOf(c))}</b><p style="color:#55556e">Ye course paid hai. Checkout par coupon / promo code bhi laga sakte hain.</p></span>
          <a class="btn" href="#/checkout/${slug}">Buy Now →</a>
        </div>
        <h3 style="font-size:19px;margin-top:20px">Course Lessons</h3>
        <div class="lessons">${c.lessons.map((l, i) => `<div class="lesson" style="cursor:default"><span class="n">${i + 1}</span><span>${esc(l.t)}</span><span class="done" style="color:#b3261e">Locked</span></div>`).join('')}</div>
      </div>`;
      window.scrollTo(0, 0);
      return;
    }
    let cur = 0;
    const last = (() => { try { return JSON.parse(localStorage.getItem('sigma-lms-last-' + slug) || 'null'); } catch(e){ return null; } })();
    if (last && last.i < c.lessons.length) cur = last.i;
    const firstUndone = watched(slug).findIndex((v, i) => !watched(slug).includes(i));
    function render(){
      const w = watched(slug);
      const L = c.lessons[cur];
      const done = w.includes(cur);
      const p = pct(c);
      const src = L.id ? 'https://drive.google.com/file/d/' + L.id + '/preview' : (L.url || '');
      app.innerHTML = `
      <div class="coursepage">
        <a class="backlink" href="#/courses">← All Courses</a>
        <div class="course-head">
          <h2>${esc(c.title)}</h2>
          <p>${esc(c.desc)}</p>
          <div class="prog" style="max-width:520px"><i style="width:${p}%"></i></div>
          <p style="margin-top:8px;font-size:13.5px">${w.length} of ${c.lessons.length} lessons completed • ${p}%</p>
        </div>
        <div class="player-wrap"><iframe src="${src}" allow="autoplay; fullscreen" allowfullscreen title="${esc(L.t)}"></iframe></div>
        <p class="now">Now Playing: <b>${esc(L.t)}</b></p>
        <div class="player-actions">
          <button class="btn" id="btnComplete" ${done ? 'disabled' : ''}>${done ? '✓ Completed' : '✓ Mark Complete & Next'}</button>
          <a class="btn ghost" href="${esc(c.folder)}" target="_blank" rel="noopener">Open Full Course in Drive</a>
          <a class="btn ghost" href="#/dashboard">My Dashboard</a>
        </div>
        ${p === 100 ? `<div class="cert-banner"><span style="font-size:34px"></span><span style="flex:1;min-width:220px"><b>Course Completed — Certificate Ready!</b><p>You finished all ${c.lessons.length} lessons. Download your Certificate of Completion.</p></span><button class="btn" id="btnCert">Download Certificate</button></div>` : ''}
        <h3 style="font-size:19px;margin-top:8px">Course Lessons</h3>
        <div class="lessons">
          ${c.lessons.map((l, i) => `<button class="lesson ${i === cur ? 'playing' : ''}" data-i="${i}"><span class="n">${i + 1}</span><span>${esc(l.t)}</span>${w.includes(i) ? '<span class="done">✓ Done</span>' : ''}</button>`).join('')}
        </div>
      </div>`;
      app.querySelectorAll('.lesson').forEach(b => b.addEventListener('click', () => {
        cur = Number(b.getAttribute('data-i'));
        localStorage.setItem('sigma-lms-last-' + slug, JSON.stringify({ i: cur, ts: Date.now() }));
        render(); window.scrollTo(0, 0);
      }));
      const bc = $('#btnComplete');
      if (bc) bc.addEventListener('click', () => {
        const w2 = watched(slug);
        if (!w2.includes(cur)) { w2.push(cur); setWatched(slug, w2); }
        if (cur < c.lessons.length - 1) cur++;
        localStorage.setItem('sigma-lms-last-' + slug, JSON.stringify({ i: cur, ts: Date.now() }));
        render();
      });
      const bt = $('#btnCert');
      if (bt) bt.addEventListener('click', () => {
        if (!profile()) { location.hash = '#/signup'; return; }
        downloadCertificate(c);
      });
    }
    render();
    window.scrollTo(0, 0);
  }

  /* ---------- CERTIFICATE (canvas, gold design) ---------- */
  function credId(c){
    const p = profile() || { email: 'student' };
    const n = Math.abs(parseInt(hash(p.email + c.slug), 10) || 0) % 9000 + 1000;
    return 'SIGMA-' + c.slug.split('-').map(w => w.charAt(0).toUpperCase()).join('').slice(0, 3) + '-' + new Date().getFullYear() + '-' + n;
  }
  function downloadCertificate(c){
    const p = profile(); if (!p) return;
    const cv = document.createElement('canvas'); cv.width = 1600; cv.height = 1131;
    const x = cv.getContext('2d');
    x.fillStyle = '#fdfbf4'; x.fillRect(0, 0, 1600, 1131);
    x.strokeStyle = '#c9a227'; x.lineWidth = 12; x.strokeRect(26, 26, 1548, 1079);
    x.lineWidth = 3; x.strokeRect(52, 52, 1496, 1027);
    x.strokeStyle = '#e5cf8a'; x.lineWidth = 2; x.strokeRect(66, 66, 1468, 999);
    [[66, 66], [1534, 66], [66, 1065], [1534, 1065]].forEach(pt => {
      x.beginPath(); x.arc(pt[0], pt[1], 16, 0, Math.PI * 2); x.fillStyle = '#c9a227'; x.fill();
    });
    const finish = () => {
      const a = document.createElement('a');
      a.download = 'SIGMA-Certificate-' + c.slug + '.png';
      a.href = cv.toDataURL('image/png'); a.click();
    };
    const img = new Image();
    img.onload = () => { x.drawImage(img, 716, 96, 168, 168); drawText(); };
    img.onerror = drawText;
    img.src = 'assets/logo-mark.png';
    function drawText(){
      x.textAlign = 'center';
      x.fillStyle = '#1b1b4d'; x.font = '800 54px Poppins, Arial';
      x.fillText('S I G M A   L M S', 800, 330);
      x.fillStyle = '#a5811d'; x.font = '600 21px Poppins, Arial';
      x.fillText('L E A R N  •  G R O W  •  A C H I E V E', 800, 368);
      x.fillStyle = '#8a6d1a'; x.font = 'italic 700 74px Georgia, serif';
      x.fillText('Certificate of Completion', 800, 478);
      x.fillStyle = '#55556e'; x.font = 'italic 30px Georgia, serif';
      x.fillText('This certifies that', 800, 540);
      x.fillStyle = '#14142b'; x.font = 'italic 700 88px Georgia, serif';
      x.fillText(p.name, 800, 656);
      x.strokeStyle = '#c9a227'; x.lineWidth = 2;
      x.beginPath(); x.moveTo(430, 686); x.lineTo(1170, 686); x.stroke();
      x.fillStyle = '#55556e'; x.font = '28px Poppins, Arial';
      x.fillText('has successfully completed the course', 800, 738);
      x.fillStyle = '#4b12b8'; x.font = '700 46px Poppins, Arial';
      const title = c.title.length > 44 ? c.title.slice(0, 44) + '…' : c.title;
      x.fillText(title, 800, 806);
      x.fillStyle = '#55556e'; x.font = '24px Poppins, Arial';
      x.fillText('for meeting all course requirements with dedication and consistency.', 800, 856);
      x.beginPath(); x.arc(800, 962, 58, 0, Math.PI * 2);
      x.fillStyle = '#c9a227'; x.fill();
      x.strokeStyle = '#8a6d1a'; x.lineWidth = 3; x.stroke();
      x.fillStyle = '#fff'; x.font = '800 56px Georgia, serif';
      x.fillText('Σ', 800, 982);
      x.fillStyle = '#8a6d1a'; x.font = '600 19px Poppins, Arial';
      x.fillText('SIGMA LMS CERTIFIED', 800, 1052);
      x.textAlign = 'left'; x.fillStyle = '#55556e'; x.font = '24px Poppins, Arial';
      const d = new Date();
      x.fillText('Date: ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), 120, 990);
      x.textAlign = 'right';
      x.fillText('Credential ID: ' + credId(c), 1480, 990);
      x.textAlign = 'left'; x.font = 'italic 34px Georgia, serif'; x.fillStyle = '#14142b';
      x.fillText('Yawar Rawi', 120, 900);
      x.strokeStyle = '#999'; x.lineWidth = 1.4;
      x.beginPath(); x.moveTo(110, 916); x.lineTo(330, 916); x.stroke();
      x.font = '20px Poppins, Arial'; x.fillStyle = '#55556e';
      x.fillText('Founder, SIGMA LMS', 120, 946);
      finish();
    }
  }

  /* ---------- CHECKOUT (paid courses + coupons) ---------- */
  function checkoutView(slug){
    const c = getCourses().find(x => x.slug === slug);
    if (!c || priceOf(c) === 0 || owned(slug)) { location.hash = '#/course/' + slug; return; }
    const price = priceOf(c);
    let applied = null, method = 'JazzCash';
    function render(msg){
      const disc = discountFor(applied, price);
      const total = price - disc;
      app.innerHTML = `
      <div class="checkout">
        <a class="backlink" href="#/courses">← All Courses</a>
        <h1 class="co-title">Checkout & Payment</h1>
        <p class="co-sub">Complete your purchase to enroll in the course</p>
        <div class="co-grid">
          <div class="co-card">
            <h3> Coupon / Promo Code</h3>
            <div class="coupon-row">
              <input type="text" id="cpInput" placeholder="Enter coupon code" value="${applied ? esc(applied.code) : ''}">
              <button class="btn sm" id="cpApply">Apply</button>
            </div>
            ${msg ? `<p class="co-msg">${msg}</p>` : ''}
            ${applied ? `<p class="co-ok">✓ Coupon <b>${esc(applied.code)}</b> applied — you saved ${fmtRs(disc)}</p>` : ''}
            <h3 style="margin-top:26px"> Payment Method</h3>
            ${['JazzCash|Pay via JazzCash mobile wallet', 'Easypaisa|Pay via Easypaisa mobile wallet', 'Bank Card|Credit or Debit Card'].map(m => {
              const parts = m.split('|');
              return `<label class="method ${method === parts[0] ? 'on' : ''}"><span><b>${parts[0]}</b><small>${parts[1]}</small></span><input type="radio" name="pm" value="${parts[0]}" ${method === parts[0] ? 'checked' : ''}></label>`;
            }).join('')}
            <button class="btn" id="coPay" style="width:100%;margin-top:22px">Confirm Order — ${fmtRs(total)}</button>
            <p class="co-note">Order confirm karne ke baad course is device par unlock ho jayega. Payment ki tasdeeq ke liye screenshot WhatsApp channel / admin ko bhejna hoga — online gateway abhi connect nahi hai.</p>
          </div>
          <div class="co-card summary">
            <h3>Course Summary</h3>
            <img src="${esc(c.thumb)}" alt="${esc(c.title)}">
            <b class="s-title">${esc(c.title)}</b>
            <p class="s-meta">${c.lessons.length} Lessons • ${esc(c.category)} • Full course</p>
            <div class="s-row"><span>Course Price:</span><b>${fmtRs(price)}</b></div>
            <div class="s-row"><span>Discount:</span><b>${disc ? '- ' + fmtRs(disc) : '- Rs 0'}</b></div>
            <div class="s-row total"><span>Total:</span><b>${fmtRs(total)}</b></div>
            <p class="s-note">ℹ You will get lifetime access to the course after successful payment.</p>
          </div>
        </div>
      </div>`;
      app.querySelectorAll('input[name=pm]').forEach(r => r.addEventListener('change', () => { method = r.value; render(msg); }));
      $('#cpApply').addEventListener('click', () => {
        const code = $('#cpInput').value.trim();
        if (!code) { render('Coupon code likhein pehle.'); return; }
        const cp = findCoupon(code, slug);
        if (!cp) { applied = null; render('Ye coupon code sahi nahi hai ya is course par apply nahi hota.'); return; }
        applied = cp;
        render('');
      });
      $('#coPay').addEventListener('click', () => {
        const disc2 = discountFor(applied, price);
        const total2 = price - disc2;
        const orders = (() => { try { return JSON.parse(localStorage.getItem('sigma-lms-orders') || '[]'); } catch(e){ return []; } })();
        orders.push({ slug, code: applied ? applied.code : '', price, discount: disc2, total: total2, method, ts: Date.now(), status: total2 === 0 ? 'confirmed-coupon' : 'pending-payment' });
        localStorage.setItem('sigma-lms-orders', JSON.stringify(orders));
        const om = ownedMap(); om[slug] = { ts: Date.now(), total: total2, code: applied ? applied.code : '' };
        localStorage.setItem('sigma-lms-owned', JSON.stringify(om));
        app.innerHTML = `
        <div class="wrap"><div class="gate">
          <div style="font-size:44px"></div>
          <h2>Order Placed!</h2>
          <p><b>${esc(c.title)}</b> unlock ho gaya hai is device par.<br>
          ${total2 > 0 ? 'Total: <b>' + fmtRs(total2) + '</b> via ' + esc(method) + ' — payment confirm karne ke liye screenshot <a href="' + CHANNEL + '" target="_blank" rel="noopener" style="color:var(--purple);font-weight:600">SIGMA (LWS) WhatsApp</a> par bhejein.' : 'Coupon se course bilkul FREE ho gaya hai — koi payment nahi chahiye.'}</p>
          <a class="btn" href="#/course/${slug}">Start Course →</a>
        </div></div>`;
        window.scrollTo(0, 0);
      });
      window.scrollTo(0, 0);
    }
    render('');
  }

  /* ---------- AUTH ---------- */
  function authSide(){
    return `<div class="auth-side">
      <img class="alog" src="assets/logo-full.webp" alt="SIGMA LMS">
      <img class="student" src="assets/hero.webp" alt="Student">
      <h3>Learn. Grow. Succeed.</h3>
      <p>Your all-in-one learning platform for students — free courses, progress tracking and certificates.</p>
    </div>`;
  }
  function loginView(){
    if (session() && profile()) { location.hash = '#/dashboard'; return; }
    app.innerHTML = `<div class="auth"><div class="auth-card">
      ${authSide()}
      <div class="auth-form">
        <h2>Welcome Back</h2>
        <p class="sub">Please login to your account to continue</p>
        <div class="auth-err" id="aerr"></div>
        <form id="loginForm">
          <div class="fld"><label>Email</label><input type="email" id="lemail" placeholder="Enter your email" required></div>
          <div class="fld"><label>Password</label><input type="password" id="lpass" placeholder="Enter your password" required></div>
          <button class="btn" type="submit">Login</button>
        </form>
        <p class="auth-alt">Don't have an account? <a href="#/signup">Sign Up</a></p>
        <p class="auth-note">Your free account is saved on this device only. Google sign-in is coming soon.</p>
      </div>
    </div></div>`;
    $('#loginForm').addEventListener('submit', e => {
      e.preventDefault();
      const em = $('#lemail').value.trim().toLowerCase(), pw = $('#lpass').value;
      const p = profile(), err = $('#aerr');
      if (!p || p.email !== em) { err.style.display = 'block'; err.textContent = 'No account found for this email on this device. Please Sign Up first.'; return; }
      if (p.pw !== hash(pw)) { err.style.display = 'block'; err.textContent = 'Wrong password. Please try again.'; return; }
      localStorage.setItem('sigma-lms-session', em);
      syncAuthBtn();
      location.hash = '#/dashboard';
    });
    window.scrollTo(0, 0);
  }
  function signupView(){
    if (session() && profile()) { location.hash = '#/dashboard'; return; }
    app.innerHTML = `<div class="auth"><div class="auth-card">
      ${authSide()}
      <div class="auth-form">
        <h2>Create Free Account</h2>
        <p class="sub">Sign up to track progress and earn certificates</p>
        <div class="auth-err" id="aerr"></div>
        <form id="signupForm">
          <div class="fld"><label>Full Name</label><input type="text" id="sname" placeholder="Enter your full name" required></div>
          <div class="fld"><label>Email</label><input type="email" id="semail" placeholder="Enter your email" required></div>
          <div class="fld"><label>Password</label><input type="password" id="spass" placeholder="Create a password" minlength="4" required></div>
          <button class="btn" type="submit">Sign Up — It's Free</button>
        </form>
        <p class="auth-alt">Already have an account? <a href="#/login">Login</a></p>
        <p class="auth-note">Your free account is saved on this device only — your name appears on your certificates.</p>
      </div>
    </div></div>`;
    $('#signupForm').addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#sname').value.trim(), em = $('#semail').value.trim().toLowerCase(), pw = $('#spass').value;
      const err = $('#aerr');
      if (name.length < 3) { err.style.display = 'block'; err.textContent = 'Please enter your full name.'; return; }
      localStorage.setItem('sigma-lms-profile', JSON.stringify({ name, email: em, pw: hash(pw) }));
      localStorage.setItem('sigma-lms-session', em);
      syncAuthBtn();
      location.hash = '#/dashboard';
    });
    window.scrollTo(0, 0);
  }

  /* ---------- DASHBOARD ---------- */
  function dashView(){
    const p = profile();
    if (!session() || !p) {
      app.innerHTML = `<div class="wrap"><div class="gate">
        <h2>Student Dashboard</h2>
        <p>Create your free account to see your enrolled courses, lesson progress, study streak and certificates — all saved on this device.</p>
        <a class="btn" href="#/signup">Create Free Account</a>
        <a class="btn ghost" href="#/login" style="margin-left:8px">Login</a>
      </div></div>`;
      window.scrollTo(0, 0);
      return;
    }
    const cs = getCourses();
    const em = enrolledMap();
    const enrolled = cs.filter(c => em[c.slug]);
    const lessonsDone = cs.reduce((n, c) => n + watched(c.slug).length, 0);
    const certs = cs.filter(c => pct(c) === 100 && c.lessons.length > 0);
    const recents = cs.map(c => {
      let last = null;
      try { last = JSON.parse(localStorage.getItem('sigma-lms-last-' + c.slug) || 'null'); } catch(e){}
      return last ? { c, i: last.i, ts: last.ts } : null;
    }).filter(Boolean).sort((a, b) => b.ts - a.ts).slice(0, 4);
    app.innerHTML = `<div class="dash">
      <aside class="dash-side">
        <div class="who"><span class="av">${esc((p.name || 'S').charAt(0).toUpperCase())}</span><span><b>${esc(p.name)}</b><small>Student</small></span></div>
        <a class="dl on" href="#/dashboard">${I.home} Dashboard</a>
        <a class="dl" href="#/courses">${I.book} My Courses</a>
        <a class="dl" href="#/dashboard">${I.chart} Progress</a>
        <a class="dl" href="#/dashboard">${I.cert} Certificates</a>
        <a class="dl" href="${CHANNEL}" target="_blank" rel="noopener">${I.users} Community</a>
        <a class="dl" href="#/" id="logoutBtn">${I.gear} Logout</a>
      </aside>
      <div class="dash-main">
        <h1>Student Dashboard</h1>
        <p class="dsub">Welcome back, ${esc(p.name.split(' ')[0])}! Continue your learning journey</p>
        <div class="stat-grid">
          <div class="stat-card"><span class="ic">${I.book}</span><span>Courses Enrolled</span><b>${enrolled.length}</b></div>
          <div class="stat-card"><span class="ic">${I.play}</span><span>Lessons Completed</span><b>${lessonsDone}</b></div>
          <div class="stat-card"><span class="ic">${I.cert}</span><span>Certificates Earned</span><b>${certs.length}</b></div>
          <div class="stat-card"><span class="ic">${I.flame}</span><span>Study Streak</span><b>${streak()} days</b></div>
        </div>
        <div class="dash-cols">
          <div class="panel">
            <h3>Course Progress</h3>
            ${enrolled.length ? enrolled.map(c => `<div class="dprog">
              <div class="dp-top"><b>${esc(c.title)}</b><span class="pct">${pct(c)}%</span></div>
              <div class="dp-top"><small>${watched(c.slug).length}/${c.lessons.length} lessons completed</small></div>
              <div class="prog"><i style="width:${pct(c)}%"></i></div>
            </div>`).join('') : '<p style="color:var(--muted);font-size:14.5px">No courses yet. <a href="#/courses" style="color:var(--purple);font-weight:600">Browse courses →</a></p>'}
            <h3 style="margin-top:26px">Recent Lessons</h3>
            ${recents.length ? recents.map(r => `<a class="recent-item" href="#/course/${r.c.slug}"><img src="${esc(r.c.thumb)}" alt=""><span><b>${esc(r.c.lessons[r.i] ? r.c.lessons[r.i].t : '')}</b><small>${esc(r.c.title)}</small></span></a>`).join('') : '<p style="color:var(--muted);font-size:14.5px">Lessons you watch will appear here.</p>'}
          </div>
          <div class="panel">
            <h3>Certificates</h3>
            ${certs.length ? certs.map(c => `<div class="cert-item"><span style="font-size:26px"></span><span style="flex:1;min-width:160px"><b>${esc(c.title)}</b><small>Credential ID: ${credId(c)}</small></span><button class="btn sm" data-cert="${c.slug}">Download</button></div>`).join('') : '<p style="color:var(--muted);font-size:14.5px">Complete any course 100% and your certificate will appear here.</p>'}
            <h3 style="margin-top:24px">Settings</h3>
            <div class="fld"><label>Your Name (on certificates)</label><input type="text" id="setName" value="${esc(p.name)}"></div>
            <button class="btn sm" id="saveName">Save Name</button>
            <p style="color:var(--muted);font-size:13px;margin-top:14px">Signed in as ${esc(p.email)} • Account saved on this device</p>
          </div>
        </div>
      </div>
    </div>`;
    const lo = $('#logoutBtn');
    if (lo) lo.addEventListener('click', e => { e.preventDefault(); localStorage.removeItem('sigma-lms-session'); syncAuthBtn(); location.hash = '#/'; });
    const sn = $('#saveName');
    if (sn) sn.addEventListener('click', () => {
      const v = $('#setName').value.trim();
      if (v.length >= 3) { const pr = profile(); pr.name = v; localStorage.setItem('sigma-lms-profile', JSON.stringify(pr)); syncAuthBtn(); dashView(); }
    });
    app.querySelectorAll('[data-cert]').forEach(b => b.addEventListener('click', () => {
      const c = getCourses().find(x => x.slug === b.getAttribute('data-cert'));
      if (c) downloadCertificate(c);
    }));
    window.scrollTo(0, 0);
  }

  /* ---------- router / chrome ---------- */
  function route(){
    const h = (location.hash || '#/').replace(/^#/, '');
    const parts = h.split('/').filter(Boolean);
    syncAuthBtn();
    document.querySelectorAll('.topnav a.nl').forEach(a => a.classList.remove('on'));
    if (parts.length === 0) homeView();
    else if (parts[0] === 'courses') coursesView();
    else if (parts[0] === 'course' && parts[1]) courseView(parts[1]);
    else if (parts[0] === 'checkout' && parts[1]) checkoutView(parts[1]);
    else if (parts[0] === 'login') loginView();
    else if (parts[0] === 'signup') signupView();
    else if (parts[0] === 'dashboard') dashView();
    else homeView();
    revealCheck();
  }
  const burger = $('#burgerBtn'), navPanel = $('#navPanel');
  if (burger && navPanel) {
    burger.addEventListener('click', () => { navPanel.classList.toggle('open'); burger.classList.toggle('x'); });
    navPanel.querySelectorAll('a').forEach(x => x.addEventListener('click', () => { navPanel.classList.remove('open'); burger.classList.remove('x'); }));
  }
  window.addEventListener('scroll', revealCheck, { passive: true });
  window.addEventListener('hashchange', route);
  recordVisit();
  route();
})();
