(() => {
  const data = window.AL_ADAMS_SITE;
  if (!data) return;

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const mail = data.links.email || 'inkandanarchy@gmail.com';

  const navToggle = $('.nav-toggle');
  const nav = $('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }
  const page = document.body.dataset.page || '';
  $$('.nav a').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
    a.addEventListener('click', () => nav?.classList.remove('open'));
  });
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  const toast = $('#egg-toast');
  const toastText = $('#egg-toast-text');
  let toastTimer;
  function showToast(text, label='FOUND NOTE') {
    if (!toast || !toastText) return;
    clearTimeout(toastTimer);
    $('.egg-toast .micro')?.replaceChildren(document.createTextNode(label));
    toastText.textContent = text;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4800);
  }

  const harmlessNotes = [
    'Yeah, okay, well everything is the same but different.',
    'Realistic dumpster fires, please.',
    'I just have a big like bucket of everything. And I just pull out of it.',
    'It\'s going to tell a story.',
    'Literally anything goes. So long as I laugh',
    'Its so tiny. I did try and paint him....with a toothpick.',
    'I want it to look like it could have actually come out of there',
    'What has it seen? Who held it? What secrets does it know?'
  ];
  if (!sessionStorage.getItem('al-note-shown')) {
    const delay = 17000 + Math.floor(Math.random()*9000);
    setTimeout(() => {
      showToast(harmlessNotes[Math.floor(Math.random()*harmlessNotes.length)]);
      sessionStorage.setItem('al-note-shown','1');
    }, delay);
  }

  const RELICS = ['key','bottlecap','toothpick','thread','button'];
  const foundRelics = new Set(JSON.parse(localStorage.getItem('al-relics') || '[]'));
  function saveRelics(){ localStorage.setItem('al-relics', JSON.stringify([...foundRelics])); }
  function updateRelics(){
    $$('[data-relic-meter]').forEach(el => el.innerHTML = `FOUND <strong>${foundRelics.size}/${RELICS.length}</strong>`);
    $$('.relic').forEach(el => el.classList.toggle('collected', foundRelics.has(el.dataset.relic)));
    $$('.relic-slot').forEach(el => {
      const found = foundRelics.has(el.dataset.slot);
      el.classList.toggle('found', found);
      el.textContent = found ? el.dataset.slot : '???';
    });
    const secret = $('#secret-room');
    if (secret && foundRelics.size === RELICS.length) secret.classList.add('unlocked');
  }
  $$('.relic').forEach(el => el.addEventListener('click', () => {
    const id = el.dataset.relic;
    if (!id || foundRelics.has(id)) return;
    foundRelics.add(id); saveRelics(); updateRelics();
    showToast(`You found the ${id}. This accomplishes almost nothing, which is important.`, 'SMALL IMPORTANT THING');
  }));
  updateRelics();

  function artHref(art){ return `work.html?id=${encodeURIComponent(art.id)}`; }
  function inquiryHref(title, prefix='Artwork inquiry'){
    const subject = `${prefix}: ${title}`;
    const body = `Hi, I am asking about ${title}.\n\nPlease let me know whether it is available and what I need to know next.`;
    return `mailto:${mail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  function artCard(art){
    return `<a class="art-card" data-category="${esc(art.category)}" href="${artHref(art)}">
      <img src="${esc(art.image)}" alt="${esc(art.alt)}" loading="lazy">
      <div class="copy"><span class="micro">${esc(art.id)} / ${esc(art.category)}</span><strong>${esc(art.title)}</strong><span class="meta">Open record →</span></div>
    </a>`;
  }

  const featured = $('#featured-art');
  if (featured) featured.innerHTML = data.artworks.slice(1,4).map(art => `<a class="feature-card" href="${artHref(art)}"><img src="${esc(art.image)}" alt="${esc(art.alt)}" loading="lazy"><div class="copy"><span class="micro">${esc(art.category)}</span><strong>${esc(art.title)}</strong><span class="micro">Open record →</span></div></a>`).join('');

  const archiveGrid = $('#archive-grid');
  if (archiveGrid) {
    archiveGrid.innerHTML = data.artworks.map(artCard).join('');
    const filters = $$('.filter');
    filters.forEach(btn => btn.addEventListener('click', () => {
      filters.forEach(x => x.classList.remove('active')); btn.classList.add('active');
      const f = btn.dataset.filter;
      $$('.art-card', archiveGrid).forEach(card => card.hidden = f !== 'all' && card.dataset.category !== f);
    }));
    $('#surprise-me')?.addEventListener('click', () => {
      const art = data.artworks[Math.floor(Math.random()*data.artworks.length)];
      location.href = artHref(art);
    });
  }

  const workRoot = $('#work-root');
  if (workRoot) {
    const id = new URLSearchParams(location.search).get('id') || data.artworks[0].id;
    let index = data.artworks.findIndex(a => a.id === id); if (index < 0) index = 0;
    const art = data.artworks[index];
    document.title = `${art.title} | A. L. Adams`;
    const rows = [
      art.category && ['Type', art.category], art.year && ['Year', art.year], art.medium && ['Medium', art.medium], art.dimensions && ['Dimensions', art.dimensions]
    ].filter(Boolean).map(([k,v])=>`<div><span class="micro">${esc(k)}</span><div>${esc(v)}</div></div>`).join('');
    const prev = data.artworks[(index - 1 + data.artworks.length) % data.artworks.length];
    const next = data.artworks[(index + 1) % data.artworks.length];
    workRoot.innerHTML = `<div class="work-grid"><div class="work-image"><img src="${esc(art.image)}" alt="${esc(art.alt)}"></div><div class="work-copy"><span class="eyebrow">${esc(art.id)} / archive record</span><h1>${esc(art.title)}</h1><p class="description">${esc(art.note || art.description || 'No story has been invented to fill the silence. The object is allowed to exist before the paperwork catches up.')}</p><div class="work-meta">${rows || '<span class="micro">Additional catalogue details pending</span>'}</div><div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:26px"><a class="button primary" href="${inquiryHref(art.title)}">Ask about availability</a><a class="button" href="commissions.html">Commission something</a></div><div class="work-nav"><a class="button small" href="${artHref(prev)}">← ${esc(prev.title)}</a><a class="button small" href="${artHref(next)}">${esc(next.title)} →</a></div></div></div>`;
  }

  const shopGrid = $('#shop-grid');
  if (shopGrid) {
    shopGrid.innerHTML = data.artworks.map(art => {
      const buy = art.shopUrl ? `<a class="button primary small" href="${esc(art.shopUrl)}">Buy now</a>` : `<a class="button primary small" href="${inquiryHref(art.title,'Purchase inquiry')}">Ask / claim</a>`;
      return `<article class="shop-card"><a href="${artHref(art)}"><img src="${esc(art.image)}" alt="${esc(art.alt)}" loading="lazy"></a><div class="copy"><span class="micro">${esc(art.category)}</span><strong>${esc(art.title)}</strong><div class="price">${esc(art.price || 'Price on request')}</div><div class="actions">${buy}<a class="button small" href="${artHref(art)}">Details</a></div></div></article>`;
    }).join('');
  }

  const commissionForm = $('#commission-form');
  if (commissionForm) {
    $$('.commission-type').forEach(card => card.addEventListener('click', () => {
      const select = $('#commission-type'); if(select) select.value = card.dataset.type || 'Something weird';
      $('#commission-form')?.scrollIntoView({behavior:'smooth',block:'start'});
    }));
    commissionForm.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(commissionForm);
      const subject = `Commission inquiry: ${fd.get('type') || 'Something weird'}`;
      const body = `Name: ${fd.get('name') || ''}\nEmail: ${fd.get('email') || ''}\nType: ${fd.get('type') || ''}\nBudget: ${fd.get('budget') || ''}\nTiming: ${fd.get('timing') || ''}\n\nIdea / object / story:\n${fd.get('idea') || ''}`;
      location.href = `mailto:${mail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  const territoryGrid = $('#territory-grid');
  if (territoryGrid) territoryGrid.innerHTML = data.territories.map(t => `<article class="territory"><span class="micro">CONNECTED TERRITORY</span><h3>${esc(t.name)}</h3><p>${esc(t.text)}</p></article>`).join('');

  const drawerGame = $('#drawer-game');
  if (drawerGame) {
    let target = Math.floor(Math.random()*3), score = Number(sessionStorage.getItem('al-drawer-score') || 0);
    const msg = $('#game-message'), scoreEl = $('#game-score'), secret = $('#secret-room');
    const updateScore = () => { if(scoreEl) scoreEl.textContent = score; if(secret && score >= 5) secret.classList.add('unlocked'); };
    updateScore();
    $$('.drawer', drawerGame).forEach((drawer, i) => drawer.addEventListener('click', () => {
      if (i === target) {
        score += 1; sessionStorage.setItem('al-drawer-score', String(score));
        msg.textContent = ['A bent key. Obviously priceless.','A button with no known jurisdiction.','A bottle cap. Civilization continues.','A tiny scrap that now has a backstory.','Something that definitely looked more important in the dark.'][Math.floor(Math.random()*5)];
      } else msg.textContent = 'Dust. A receipt nobody can explain. Try another drawer.';
      target = Math.floor(Math.random()*3); updateScore();
    }));
    $('#oracle-button')?.addEventListener('click', () => showToast(harmlessNotes[Math.floor(Math.random()*harmlessNotes.length)], 'DUMPSTER ORACLE'));
  }
})();
