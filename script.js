(() => {
  'use strict';
  const config = window.HUB_CONFIG || {};
  const projects = Array.isArray(window.HUB_PROJECTS) ? window.HUB_PROJECTS : [];
  const $ = (selector) => document.querySelector(selector);
  const grid = $('#project-grid');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const search = $('#search');
  const modal = $('#project-modal');
  let currentFilter = 'all';

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const validUrl = (value) => {
    if (!value || typeof value !== 'string') return '';
    if (value.startsWith('./') || value.startsWith('#')) return value;
    try { const url = new URL(value); return ['https:', 'http:', 'mailto:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
  };
  const label = {live:'Live now', development:'In development', upcoming:'Coming soon'};
  const fmtDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return '';
    const date = new Date(value + 'T12:00:00');
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, {month:'long',year:'numeric',day:'numeric'});
  };
  const getStatus = (item) => ['live','development','upcoming'].includes(item.status) ? item.status : 'upcoming';
  const getColor = (item) => /^#[0-9a-f]{3,8}$/i.test(item.color || '') ? item.color : '#a58cff';
  const projectById = (id) => projects.find(item => item.id === id);

  document.title = `${config.siteName || 'PROJECT//HUB'} — My Projects`;
  $('#hero-status').textContent = config.heroStatus || 'CREATING SOMETHING NEW';
  $('#hero-description').textContent = config.heroDescription || '';
  $('#about-description').textContent = config.about || '';
  // The footer contains static copyright text, not a #footer-name element.
  // Do not throw here: doing so would break filters, previews and contact links.
  // Footer copyright stays at the requested year: 2026.
  const socials = $('#social-links');
  (config.socials || []).forEach(s => {
    const url = validUrl(s.url);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.textContent = `${s.label || 'Link'} ↗`;
    if (url.startsWith('http')) {a.target = '_blank'; a.rel = 'noopener noreferrer';}
    if (s.mobileApp && /discord\.com\/users\/(\d+)/.test(url)) {
      a.dataset.discordUser = url.match(/discord\.com\/users\/(\d+)/)[1];
      a.setAttribute('aria-label', 'Contact Huskyganster on Discord');
    }
    socials.append(a);
  });

  const counts = {all: projects.length, live: 0, development: 0, upcoming: 0};
  projects.forEach(p => counts[getStatus(p)]++);
  for (const key of Object.keys(counts)) {
    const countElem = $(`#count-${key}`);
    if (countElem) countElem.textContent = counts[key];
  }
  for (const [key,id] of [['all','stat-total'],['live','stat-live'],['development','stat-progress'],['upcoming','stat-upcoming']]) $('#'+id).textContent = String(counts[key]).padStart(2,'0');

  // Only PUBLISHED projects can appear in the spotlight.
  // Prefer the newest dated release; undated releases follow array order.
  const liveProjects = projects.filter(p => getStatus(p) === 'live' && validUrl(p.url));
  const featured = liveProjects.slice().sort((a,b) => {
    const ad = /^\d{4}-\d{2}-\d{2}$/.test(a.releaseDate || '') ? a.releaseDate : '';
    const bd = /^\d{4}-\d{2}-\d{2}$/.test(b.releaseDate || '') ? b.releaseDate : '';
    if (ad && bd && ad !== bd) return bd.localeCompare(ad);
    if (ad !== bd) return ad ? -1 : 1;
    return liveProjects.indexOf(b) - liveProjects.indexOf(a);
  })[0];
  const featureLink = $('#feature-link');
  const featureArt = $('#feature-art');
  const featureImage = $('#feature-image');
  const previewPlaceholder = $('#preview-placeholder');
  if (featured) {
    $('#feature-title').textContent = featured.title;
    $('#feature-description').textContent = featured.description || 'Explore the newest release.';
    featureArt.style.setProperty('--project-color', getColor(featured));
    $('#preview-footnote').textContent = fmtDate(featured.releaseDate) || 'NOW LIVE_';
    $('.panel-label').textContent = 'LATEST RELEASE / LIVE';
    featureLink.hidden = false;
    featureLink.href = validUrl(featured.url);
    featureLink.target = '_blank';
    featureLink.rel = 'noopener noreferrer';
    featureLink.setAttribute('aria-label', `Visit ${featured.title}`);
    const thumb = validAssetPath(featured.thumbnail);
    if (thumb) {
      featureImage.alt = `Preview screenshot of ${featured.title}`;
      featureImage.src = thumb;
      featureImage.hidden = false;
      featureImage.addEventListener('load', () => {
        featureArt.classList.remove('is-empty');
        featureArt.classList.add('has-preview');
        previewPlaceholder.hidden = true;
      });
      featureImage.addEventListener('error', () => {
        featureImage.hidden = true;
        previewPlaceholder.hidden = false;
        $('.preview-scan').textContent = 'SCREENSHOT UNAVAILABLE_';
      });
    } else {
      $('.preview-scan').textContent = 'SCREENSHOT NOT ADDED_';
      $('.preview-guide').textContent = 'ADD A THUMBNAIL TO DISPLAY YOUR WEBSITE';
    }
  } else {
    $('.panel-label').textContent = 'LATEST RELEASE / --';
    featureLink.hidden = true;
  }
  // Safe screenshot paths. Reject script and data URL schemes.
  function validAssetPath(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    const input = value.trim();
    if (/^(?:\.\.?\/|images\/|assets\/)[a-z0-9_./-]+\.(?:png|jpe?g|webp|avif)$/i.test(input) && !input.includes('..')) return input;
    if (/^https:\/\//i.test(input)) { try { return new URL(input).href; } catch { return ''; } }
    return '';
  }

  // Mobile: attempt Discord deep link only on a user tap. If unavailable, use the
  // standard web profile, which may itself be handled by the installed app.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-discord-user]');
    if (!link || !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
    event.preventDefault();
    const webProfile = link.href;
    const deepLink = `discord://-/users/${link.dataset.discordUser}`;
    let switched = false;
    const onVisibility = () => { if (document.hidden) switched = true; };
    document.addEventListener('visibilitychange', onVisibility);
    window.location.href = deepLink;
    window.setTimeout(() => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (!switched && !document.hidden) window.location.href = webProfile;
    }, 1100);
  });

  // Footer and brand links always return to the actual page start.
  document.querySelectorAll('a[href="#top"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      event.preventDefault();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, left: 0, behavior: reduced ? 'instant' : 'smooth' });
      if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
    });
  });

  function cardMarkup(item) {
    const status = getStatus(item);
    const color = getColor(item);
    const progress = Math.max(0,Math.min(100,Number(item.progress)||0));
    return `<article class="project-card" style="--project-color:${color}">
      <div class="card-art" aria-hidden="true">${validAssetPath(item.thumbnail) ? `<img class="card-thumbnail" src="${escapeHtml(validAssetPath(item.thumbnail))}" alt="" loading="lazy" />` : `<span class="card-grid"></span><span class="card-orb"></span><span class="card-icon">${escapeHtml(item.icon || '✦')}</span>`}<span class="card-id">${escapeHtml(item.id || '')}</span></div>
      <div class="card-body"><div class="card-topline"><span class="status-pill status-${status}"><i></i>${label[status]}</span><span class="card-category">${escapeHtml(item.category || '')}</span></div>
      <h3>${escapeHtml(item.title)}</h3><p class="card-description">${escapeHtml(item.description)}</p>
      <div class="tag-list">${(item.tags || []).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      ${status === 'development' ? `<div class="card-progress"><div class="progress-label"><span>Development progress</span><b>${progress}%</b></div><div class="progress-track"><span style="width:${progress}%"></span></div></div>` : ''}
      <div class="card-actions">${status === 'live' && validUrl(item.url) ? `<a href="${escapeHtml(validUrl(item.url))}" target="_blank" rel="noopener noreferrer" class="card-primary-link">Visit website <span>↗</span></a>` : `<span class="card-muted">${status === 'upcoming' ? 'Not released yet' : 'Work in progress'}</span>`}<button class="details-button" type="button" data-project-id="${escapeHtml(item.id)}" aria-label="More about ${escapeHtml(item.title)}">Details <span>→</span></button></div>
      </div></article>`;
  }

  function renderProjects() {
    const query = search.value.trim().toLowerCase();
    const shown = projects.filter(p => (currentFilter === 'all' || getStatus(p) === currentFilter) && [p.title,p.description,p.category,...(p.tags || [])].join(' ').toLowerCase().includes(query));
    grid.innerHTML = shown.map(cardMarkup).join('');
    $('#empty-state').hidden = shown.length > 0;
    const fresh = !projects.length && !query && currentFilter === 'all';
    const filteredEmpty = !fresh && shown.length === 0;
    $('#empty-title').textContent = fresh ? 'No projects yet' : 'Nothing matches your search';
    $('#empty-description').textContent = fresh ? 'New projects will appear here soon. Stay tuned!' : 'Try another search or switch filters.';
    $('#clear-filters').hidden = !filteredEmpty;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filters.forEach(b => {b.classList.toggle('active',b === button);b.setAttribute('aria-pressed',String(b===button));});
    renderProjects();
  }));
  search.addEventListener('input',renderProjects);
  $('#clear-filters').addEventListener('click',() => {search.value = '';filters[0].click();});
  grid.addEventListener('click', event => {const button = event.target.closest('[data-project-id]');if (button) openDetails(button.dataset.projectId);});

  function openDetails(id) {
    const item = projectById(id);
    if (!item) return;
    const status = getStatus(item);
    const progress = Math.max(0,Math.min(100,Number(item.progress)||0));
    const date = fmtDate(item.releaseDate);
    $('#modal-content').innerHTML = `<div class="modal-visual" style="--project-color:${getColor(item)}">${validAssetPath(item.thumbnail) ? `<img class="modal-thumbnail" src="${escapeHtml(validAssetPath(item.thumbnail))}" alt="Screenshot preview of ${escapeHtml(item.title)}" />` : `<span>${escapeHtml(item.icon || '✦')}</span>`}</div><div class="modal-body"><span class="status-pill status-${status}"><i></i>${label[status]}</span><p class="modal-category">${escapeHtml(item.category || '')}</p><h2 id="modal-title">${escapeHtml(item.title)}</h2><p class="modal-description">${escapeHtml(item.longDescription || item.description)}</p><div class="tag-list">${(item.tags || []).map(tag=>`<span>${escapeHtml(tag)}</span>`).join('')}</div>${status === 'development' ? `<div class="modal-progress">Development progress: <strong>${progress}%</strong><div class="progress-track"><span style="width:${progress}%"></span></div></div>`:''}${date ? `<p class="release-date">${status === 'live'?'Released':'Target release'}: ${escapeHtml(date)}</p>`:''}${status === 'live' && validUrl(item.url) ? `<a class="button button-primary modal-visit" href="${escapeHtml(validUrl(item.url))}" target="_blank" rel="noopener noreferrer">Open website ↗</a>` : `<p class="modal-note">${status === 'upcoming' ? 'This project hasn’t launched yet. Check back for updates.' : 'This project is being built. Stay tuned for its release.'}</p>`}</div>`;
    if (!modal.open) modal.showModal();
  }
  $('#modal-close').addEventListener('click',()=>modal.close());
  modal.addEventListener('click',event=>{if(event.target===modal) modal.close();});

  function renderRoadmap() {
    const inRoadmap = projects.filter(p=>getStatus(p)!=='live').sort((a,b)=>{
      const x=getStatus(a)==='development'?0:1;const y=getStatus(b)==='development'?0:1;
      if(x!==y)return x-y;
      return (a.releaseDate||'9999').localeCompare(b.releaseDate||'9999');
    });
    $('#roadmap-list').innerHTML = inRoadmap.length ? inRoadmap.map((p,index)=>{
      const status=getStatus(p);
      const date=fmtDate(p.releaseDate);
      return `<div class="timeline-item" style="--project-color:${getColor(p)}"><div class="timeline-dot">${escapeHtml(p.icon || '✦')}</div><div class="timeline-content"><div class="timeline-top"><span class="timeline-index">0${index+1} / ${status==='development'?'IN THE WORKSHOP':'ON THE HORIZON'}</span><span class="timeline-state">${date || (status==='development'?'Currently building':'Release TBD')}</span></div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p><div class="timeline-tags">${(p.tags||[]).slice(0,3).map(tag=>`<span>${escapeHtml(tag)}</span>`).join('')}</div></div></div>`;
    }).join('') : `<div class="roadmap-empty">No projects yet. Upcoming releases will appear here.</div>`;
  }
  renderProjects();renderRoadmap();

  // One-time scroll reveal with a graceful fallback for older browsers.
  const revealTargets = document.querySelectorAll('.section-heading, .stats, .about-card, .project-toolbar, .project-card, .timeline-item');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold: 0.08, rootMargin: '0px 0px 40px 0px'});
    revealTargets.forEach(el => { el.classList.add('reveal-ready'); observer.observe(el); });
  }
  // Subtle card movement; leave touchscreen and reduced-motion modes alone.
  if (window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) {
    grid.addEventListener('pointermove', event => {
      const card = event.target.closest('.project-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height * 100).toFixed(1)}%`);
    });
  }
})();
