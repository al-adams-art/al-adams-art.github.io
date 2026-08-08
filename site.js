(() => {
  const data = window.AL_ADAMS_SITE;
  if (!data) return;

  const gallery = document.getElementById('gallery');
  const artModal = document.getElementById('art-modal');
  const availabilityModal = document.getElementById('availability-modal');
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalIndex = document.getElementById('modal-index');
  const modalMeta = document.getElementById('modal-meta');
  const modalNote = document.getElementById('modal-note');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  let lastFocus = null;

  const layout = [
    ['span-7','wide'], ['span-5','tall'], ['span-4','tall'], ['span-8','wide'],
    ['span-7','wide'], ['span-5','square'], ['span-4','tall'], ['span-8','wide'],
    ['span-5','wide'], ['span-7','wide'], ['span-8','wide'], ['span-4','wide']
  ];

  const titleFor = (art) => art.title || 'Title not yet catalogued';

  function metadataRows(art) {
    const rows = [];
    const push = (label, value) => { if (value) rows.push([label, value]); };
    push('Year', art.year);
    push('Medium', art.medium);
    push('Dimensions', art.dimensions);
    push('Availability', art.availability);
    if (!rows.length) rows.push(['Catalogue status', 'Metadata pending artist verification']);
    return rows;
  }

  data.artworks.forEach((art, i) => {
    const card = document.createElement('article');
    const [span, shape] = layout[i % layout.length];
    card.className = `art-card ${span} ${shape} reveal`;
    card.innerHTML = `
      <button type="button" aria-label="Open ${escapeHtml(titleFor(art))} in a larger view" data-art-id="${escapeHtml(art.id)}">
        <figure>
          <span class="index-mark">${escapeHtml(art.id)}</span>
          <img src="${escapeAttr(art.image)}" alt="${escapeAttr(art.alt)}" loading="${i < 2 ? 'eager' : 'lazy'}">
          <figcaption class="caption">
            <span class="micro">${escapeHtml(art.id)} / archive image</span>
            <strong>${escapeHtml(titleFor(art))}</strong>
          </figcaption>
        </figure>
      </button>`;
    gallery.appendChild(card);
    if (i === 3 || i === 8) {
      const murmur = document.createElement('aside');
      murmur.className = 'archive-murmur reveal';
      murmur.innerHTML = i === 3
        ? '<span class="micro">MARGIN NOTE / FOUND IN THE STUDIO</span>“What has it seen? Who held it? What secrets does it know?”'
        : '<span class="micro">MARGIN NOTE / APPARENTLY IMPORTANT</span>“There\'s waves on the inside of this drawer? Who does that?”';
      gallery.appendChild(murmur);
    }
  });

  const territoryGrid = document.getElementById('territory-grid');
  data.territories.forEach((territory, i) => {
    const section = document.createElement('article');
    section.className = 'territory reveal';
    section.innerHTML = `
      <div class="num">0${i + 1} / TERRITORY</div>
      <h3>${escapeHtml(territory.name)}</h3>
      <p>${escapeHtml(territory.text)}</p>`;
    territoryGrid.appendChild(section);
  });

  function openArt(id) {
    const art = data.artworks.find(a => a.id === id);
    if (!art) return;
    lastFocus = document.activeElement;
    modalImage.src = art.image;
    modalImage.alt = art.alt;
    modalTitle.textContent = titleFor(art);
    modalIndex.textContent = `${art.id} / ARCHIVE IMAGE`;
    modalMeta.innerHTML = metadataRows(art)
      .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
      .join('');
    if (art.note) {
      modalNote.textContent = art.note;
      modalNote.hidden = false;
    } else {
      modalNote.textContent = 'Artist note not yet attached. Nothing has been invented to fill the gap.';
      modalNote.hidden = false;
    }
    openModal(artModal);
  }

  function openModal(modal) {
    lastFocus = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('.modal-close')?.focus();
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  gallery.addEventListener('click', e => {
    const button = e.target.closest('[data-art-id]');
    if (button) openArt(button.dataset.artId);
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.closest('.modal-close')) closeModal(modal);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const open = document.querySelector('.modal.open');
      if (open) closeModal(open);
    }
  });

  const availabilityButton = document.getElementById('availability-button');
  if (data.links.shop) {
    const link = document.createElement('a');
    link.className = availabilityButton.className;
    link.textContent = availabilityButton.textContent;
    link.href = data.links.shop;
    link.rel = 'noopener';
    availabilityButton.replaceWith(link);
  } else {
    availabilityButton.addEventListener('click', () => openModal(availabilityModal));
  }

  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.addEventListener('click', e => {
    if (e.target.matches('a')) {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.11, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const easter = document.getElementById('al-easter');
  const easterText = document.getElementById('al-easter-text');
  const easterLines = [
    'Yeah, okay, well everything is the same but different.',
    'Realistic dumpster fires, please.',
    'I just have a big like bucket of everything. And I just pull out of it.',
    'It\'s going to tell a story.',
    'If it ain\'t free, I don\'t want it.',
    'Literally anything goes. So long as I laugh',
    'Its so tiny. I did try and paint him....with a toothpick.',
    'No one will see that.......I wonder if any of the other drawers have paintings on the inside like this one...',
    'I want it to look like it could have actually come out of there'
  ];
  let eggIndex = 0;
  let eggBusy = false;
  function showEgg(){
    if (!easter || eggBusy || document.querySelector('.modal.open')) return;
    eggBusy = true;
    easter.className = 'al-egg';
    const edge = Math.random() > .5 ? 'edge-right' : 'edge-left';
    const pos = ['pos-high','pos-mid','pos-low'][Math.floor(Math.random()*3)];
    easter.classList.add(edge,pos);
    easterText.textContent = easterLines[eggIndex % easterLines.length];
    eggIndex += 1;
    requestAnimationFrame(() => easter.classList.add('show'));
    setTimeout(() => { easter.classList.remove('show'); setTimeout(() => eggBusy = false, 350); }, 5200);
  }
  let lastEggAt = 0;
  window.addEventListener('scroll', () => {
    const now = Date.now();
    if (window.scrollY > window.innerHeight * .55 && now - lastEggAt > 24000) {
      lastEggAt = now;
      showEgg();
    }
  }, {passive:true});
  setTimeout(() => { if (window.scrollY > 150) showEgg(); }, 11000);

  document.getElementById('year').textContent = new Date().getFullYear();

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    })[ch]);
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
