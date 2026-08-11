(() => {
  const data = window.AL_ADAMS_SITE;
  if (!data) return;

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const mail = data.links.email || 'the.official.a.l.adams@gmail.com';

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
  if (featured) {
    const chosen = data.artworks.filter(a => a.featured).slice(0,3);
    const list = chosen.length === 3 ? chosen : data.artworks.slice(0,3);
    featured.innerHTML = list.map(art => `<a class="feature-card" href="${artHref(art)}"><img src="${esc(art.image)}" alt="${esc(art.alt)}" loading="lazy"><div class="copy"><span class="micro">${esc(art.category)}</span><strong>${esc(art.title)}</strong><span class="micro">Open record →</span></div></a>`).join('');
  }

  const archiveGrid = $('#archive-grid');
  if (archiveGrid) {
    archiveGrid.innerHTML = data.artworks.map(artCard).join('');
    const filters = $$('.filter');
    filters.forEach(btn => btn.addEventListener('click', () => {
      filters.forEach(x => x.classList.remove('active'));
      btn.classList.add('active');
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
    let index = data.artworks.findIndex(a => a.id === id);
    if (index < 0) index = 0;
    const art = data.artworks[index];
    document.title = `${art.title} | A. L. Adams`;
    const rows = [
      art.category && ['Type', art.category],
      art.year && ['Year', art.year],
      art.medium && ['Medium', art.medium],
      art.dimensions && ['Dimensions', art.dimensions]
    ].filter(Boolean).map(([k,v])=>`<div><span class="micro">${esc(k)}</span><div>${esc(v)}</div></div>`).join('');
    const prev = data.artworks[(index - 1 + data.artworks.length) % data.artworks.length];
    const next = data.artworks[(index + 1) % data.artworks.length];
    const inquiry = art.availability === 'archive' ? '' : `<a class="button primary" href="${inquiryHref(art.title)}">Ask about availability</a>`;
    workRoot.innerHTML = `<div class="work-grid"><div class="work-image"><img src="${esc(art.image)}" alt="${esc(art.alt)}"></div><div class="work-copy"><span class="eyebrow">${esc(art.id)} / archive record</span><h1>${esc(art.title)}</h1><p class="description">${esc(art.note || art.description || 'Catalogue notes pending.')}</p><div class="work-meta">${rows || '<span class="micro">Additional catalogue details pending</span>'}</div><div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:26px">${inquiry}<a class="button" href="commissions.html">Commissions</a></div><div class="work-nav"><a class="button small" href="${artHref(prev)}">← ${esc(prev.title)}</a><a class="button small" href="${artHref(next)}">${esc(next.title)} →</a></div></div></div>`;
  }

  const shopGrid = $('#shop-grid');
  if (shopGrid) {
    const saleItems = data.artworks.filter(art => art.availability !== 'archive');
    shopGrid.innerHTML = saleItems.map(art => {
      const buy = art.shopUrl ? `<a class="button primary small" href="${esc(art.shopUrl)}">Buy now</a>` : `<a class="button primary small" href="${inquiryHref(art.title,'Purchase inquiry')}">Inquire</a>`;
      return `<article class="shop-card"><a href="${artHref(art)}"><img src="${esc(art.image)}" alt="${esc(art.alt)}" loading="lazy"></a><div class="copy"><span class="micro">${esc(art.category)}</span><strong>${esc(art.title)}</strong><div class="price">${esc(art.price || 'Price on request')}</div><div class="actions">${buy}<a class="button small" href="${artHref(art)}">Details</a></div></div></article>`;
    }).join('');
  }

  const commissionForm = $('#commission-form');
  if (commissionForm) {
    $$('.commission-type').forEach(card => card.addEventListener('click', () => {
      const select = $('#commission-type');
      if(select) select.value = card.dataset.type || 'Other';
      commissionForm.scrollIntoView({behavior:'smooth',block:'start'});
    }));
    commissionForm.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(commissionForm);
      const subject = `Commission inquiry: ${fd.get('type') || 'Other'}`;
      const body = `Name: ${fd.get('name') || ''}\nEmail: ${fd.get('email') || ''}\nType: ${fd.get('type') || ''}\nBudget: ${fd.get('budget') || ''}\nTiming: ${fd.get('timing') || ''}\n\nProject:\n${fd.get('idea') || ''}`;
      location.href = `mailto:${mail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  const territoryGrid = $('#territory-grid');
  if (territoryGrid) territoryGrid.innerHTML = data.territories.map(t => `<article class="territory"><span class="micro">PROJECT</span><h3>${esc(t.name)}</h3><p>${esc(t.text)}</p></article>`).join('');
})();