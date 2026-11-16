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
  $('#footer-name').textContent = config.creator || 'Your Name';
  $('#year').textContent = new Date().getFullYear();
  const socials = $('#social-links');
  (config.socials || []).forEach(s => {
    const url = validUrl(s.url);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.textContent = `${s.label || 'Link'} ↗`;
    if (url.startsWith('http')) {a.target = '_blank'; a.rel = 'noopener noreferrer';}
    socials.append(a);
  });

  const counts = {all: projects.length, live: 0, development: 0, upcoming: 0};
  projects.forEach(p => counts[getStatus(p)]++);
  for (const key of Object.keys(counts)) {
    const countElem = $(`#count-${key}`);
    if (countElem) countElem.textContent = counts[key];
  }
  for (const [key,id] of [['all','stat-total'],['live','stat-live'],['development','stat-progress'],['upcoming','stat-upcoming']]) $('#'+id).textContent = String(counts[key]).padStart(2,'0');

  const featured = projects.find(p => p.featured) || projects[0];
  if (featured) {
    $('#feature-title').textContent = featured.title;
    $('#feature-description').textContent = featured.description;
    $('#feature-art').style.setProperty('--project-color', getColor(featured));
    $('#feature-art .art-core span').textContent = featured.icon || '✦';
    const link = $('#feature-link');
    link.href = '#projects';
    link.addEventListener('click', e => { e.preventDefault(); openDetails(featured.id); });
  }

  function cardMarkup(item) {
    const status = getStatus(item);
    const color = getColor(item);
    const progress = Math.max(0,Math.min(100,Number(item.progress)||0));
    return `<article class="project-card" style="--project-color:${color}">
      <div class="card-art" aria-hidden="true"><span class="card-grid"></span><span class="card-orb"></span><span class="card-icon">${escapeHtml(item.icon || '✦')}</span><span class="card-id">${escapeHtml(item.id || '')}</span></div>
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
    $('#modal-content').innerHTML = `<div class="modal-visual" style="--project-color:${getColor(item)}"><span>${escapeHtml(item.icon || '✦')}</span></div><div class="modal-body"><span class="status-pill status-${status}"><i></i>${label[status]}</span><p class="modal-category">${escapeHtml(item.category || '')}</p><h2 id="modal-title">${escapeHtml(item.title)}</h2><p class="modal-description">${escapeHtml(item.longDescription || item.description)}</p><div class="tag-list">${(item.tags || []).map(tag=>`<span>${escapeHtml(tag)}</span>`).join('')}</div>${status === 'development' ? `<div class="modal-progress">Development progress: <strong>${progress}%</strong><div class="progress-track"><span style="width:${progress}%"></span></div></div>`:''}${date ? `<p class="release-date">${status === 'live'?'Released':'Target release'}: ${escapeHtml(date)}</p>`:''}${status === 'live' && validUrl(item.url) ? `<a class="button button-primary modal-visit" href="${escapeHtml(validUrl(item.url))}" target="_blank" rel="noopener noreferrer">Open website ↗</a>` : `<p class="modal-note">${status === 'upcoming' ? 'This project hasn’t launched yet. Check back for updates.' : 'This project is being built. Stay tuned for its release.'}</p>`}</div>`;
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
    }).join('') : `<div class="roadmap-empty">The roadmap is clear for now. New ideas coming soon.</div>`;
  }
  renderProjects();renderRoadmap();
})();
