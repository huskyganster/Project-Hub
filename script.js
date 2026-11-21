/* PROJECT//HUB — gallery, project data, navigation, ambient visual effects. */
(() => {
  'use strict';
  const q = (s, root=document) => root.querySelector(s);
  const qa = (s, root=document) => [...root.querySelectorAll(s)];
  const projects = Array.isArray(window.HUB_PROJECTS) ? window.HUB_PROJECTS : [];
  const config = window.HUB_CONFIG || {};
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const html = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeURL = value => { try { const u=new URL(value); return ['http:','https:'].includes(u.protocol) ? u.href : ''; } catch {return '';} };
  const safeImage = value => typeof value === 'string' && /^(?:images|assets)\/[a-z0-9/_-]+\.(?:png|webp|jpe?g|avif)$/i.test(value) && !value.includes('..') ? value : '';
  const getStatus = p=> ['live','development','upcoming'].includes(p.status)?p.status:'upcoming';
  const statusName = {live:'LIVE / AVAILABLE',development:'IN DEVELOPMENT',upcoming:'COMING SOON'};
  const projectNumber = p => String(Math.max(0,projects.indexOf(p))+1).padStart(3,'0');
  const dateName = value => /^\d{4}-\d{2}-\d{2}$/.test(value||'') ? new Date(value+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
  const latest = projects.filter(p=>getStatus(p)==='live'&&safeURL(p.url)).sort((a,b)=>(b.releaseDate||'').localeCompare(a.releaseDate||''))[0];
  const counts = {all:projects.length,live:0,development:0,upcoming:0};
  projects.forEach(p=>counts[getStatus(p)]++);
  const setText = (id,value) => {const el=q('#'+id);if(el)el.textContent=value;};
  for(const key of Object.keys(counts)) setText('count-'+key,String(counts[key]).padStart(2,'0'));
  setText('item-count',String(projects.length).padStart(3,'0')+' ITEMS IN THE ARCHIVE');
  setText('issue-year',new Date().getFullYear());
  if (config.about) setText('about-description',config.about);

  // Featured website is chosen by release date; screenshot is the actual provided asset.
  if(latest){
    setText('feature-title',latest.title);
    setText('feature-desc',latest.description);
    setText('feature-label',projectNumber(latest));
    setText('feature-category',latest.category||'WEBSITE');
    setText('feature-date',dateName(latest.releaseDate)||'NOW LIVE');
    setText('feature-domain',(()=>{try{return new URL(latest.url).hostname.toUpperCase()}catch{return 'HUSKYGANSTER'}})());
    const target=safeURL(latest.url);
    q('#feature-action').href=target;
    q('#feature-image-link').href=target;
    q('#feature-image-link').setAttribute('aria-label','Visit '+latest.title);
    const img=q('#feature-image');
    if(safeImage(latest.thumbnail)){
      img.src=safeImage(latest.thumbnail);
      img.alt='Full website screenshot of '+latest.title;
    } else {img.removeAttribute('src');img.alt='No screenshot uploaded yet';}
  }else{
    q('#feature-layout').innerHTML='<div class="feature-copy"><div class="feature-overline">NO LIVE RELEASES YET</div><h3>THE NEXT BIG THING.</h3><p>Published projects will appear here once they are added to the archive.</p></div><div class="feature-image-link"><div class="empty-state" style="width:100%;padding:70px 20px"><span>AWAITING SIGNAL / 000</span><h3>NOTHING LIVE YET</h3></div></div>';
  }

  let observer; // Initialized before the initial project render.
  const grid=q('#project-grid'), search=q('#search'), empty=q('#empty-state');
  const filters=qa('[data-filter]');let filter='all';
  function makeCard(p){
    const status=getStatus(p),link=safeURL(p.url),image=safeImage(p.thumbnail),num=projectNumber(p);
    const progress=Math.max(0,Math.min(100,Number(p.progress)||0));
    return `<article class="project-card reveal" style="--project-color:${/^#[0-9a-f]{3,8}$/i.test(p.color||'')?p.color:'#c5fa55'}" data-card-id="${html(p.id)}"><div class="card-art">${image?`<img src="${html(image)}" alt="Preview of ${html(p.title)}" loading="lazy">`:`<span class="card-fallback">${html(p.icon||'✳')}</span>`}<span class="card-n">PROJECT / ${num}</span></div><div class="card-body"><div class="card-kicker"><span>${html(statusName[status])}</span><span>${html(p.category||'DIGITAL EXPERIENCE').toUpperCase()}</span></div><h3>${html(p.title)}</h3><p>${html(p.description||'')}</p><div class="tags">${(Array.isArray(p.tags)?p.tags:[]).map(t=>`<span>${html(t)}</span>`).join('')}</div>${status==='development'?`<div class="card-progress"><div class="card-progress-title"><span>DEVELOPMENT STATUS</span><span>${progress}%</span></div><div class="card-track"><span style="width:${progress}%"></span></div></div>`:''}<div class="card-footer">${status==='live'&&link?`<a class="card-link" href="${html(link)}" target="_blank" rel="noopener noreferrer">VISIT WEBSITE ↗</a>`:`<span class="card-muted">${status==='upcoming'?'RELEASE: TBA':'WORK IN PROGRESS'}</span>`}<button type="button" class="card-details" data-details="${html(p.id)}" aria-label="Details about ${html(p.title)}">DETAILS ↗</button></div></div></article>`;
  }
  function render(){
    const query=(search.value||'').trim().toLowerCase();
    const entries=projects.filter(p=>(filter==='all'||getStatus(p)===filter)&&[p.title,p.category,p.description,...(p.tags||[])].join(' ').toLowerCase().includes(query));
    grid.innerHTML=entries.map(makeCard).join('');
    empty.hidden=entries.length!==0;
    const isFresh=projects.length===0&&!query&&filter==='all';
    setText('empty-title',isFresh?'THE ARCHIVE IS EMPTY.':'NO MATCH FOUND.');
    setText('empty-description',isFresh?'The next projects are on their way.':'Try a different filter or search term.');
    q('#clear-filters').hidden=isFresh;
    observeReveals(grid);
  }
  filters.forEach(button=>button.addEventListener('click',()=>{
    filter=button.dataset.filter;
    filters.forEach(btn=>{const active=btn===button;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
    render();
  }));
  search.addEventListener('input',render);
  q('#clear-filters').addEventListener('click',()=>{search.value='';filters[0].click();});
  render();

  const roadmap=projects.filter(p=>getStatus(p)!=='live');
  q('#roadmap-list').innerHTML=roadmap.length?roadmap.map((p,i)=>`<article class="timeline-card reveal"><span class="timeline-index">${String(i+1).padStart(2,'0')}</span><div><h3>${html(p.title)}</h3><p>${html(p.description||'')}</p></div><span>${getStatus(p)==='development'?'IN DEVELOPMENT':'UPCOMING'}</span></article>`).join(''):'<div class="roadmap-empty reveal"><span>NO UPCOMING ENTRIES / 000</span><p>Nothing announced yet. When I start building the next thing, you’ll see it here.</p></div>';

  const modal=q('#project-modal');
  q('#project-grid').addEventListener('click',event=>{
    const button=event.target.closest('[data-details]');if(!button)return;
    const p=projects.find(item=>item.id===button.dataset.details);if(!p)return;
    const image=safeImage(p.thumbnail),url=safeURL(p.url);
    q('#modal-content').innerHTML=`<div class="modal-image">${image?`<img src="${html(image)}" alt="Preview of ${html(p.title)}">`:''}</div><div class="modal-copy"><div class="modal-label">PROJECT / ${projectNumber(p)} &nbsp; • &nbsp; ${html(statusName[getStatus(p)])}</div><h2 id="modal-title">${html(p.title)}</h2><p>${html(p.longDescription||p.description)}</p><div class="tags">${(p.tags||[]).map(t=>`<span>${html(t)}</span>`).join('')}</div>${getStatus(p)==='live'&&url?`<a class="action action-primary" href="${html(url)}" target="_blank" rel="noopener noreferrer">OPEN WEBSITE <span>↗</span></a>`:''}</div>`;
    if(typeof modal.showModal==='function')modal.showModal();else modal.setAttribute('open','');
  });
  q('#modal-close').addEventListener('click',()=>modal.close());
  modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});

  // Navigation: scroll to the actual top, works independently of hash state.
  qa('a[href="#top"]').forEach(a=>a.addEventListener('click',event=>{
    event.preventDefault();window.scrollTo({top:0,left:0,behavior:reduceMotion.matches?'instant':'smooth'});
    try { if (location.origin !== 'null') history.replaceState(null,'',location.pathname+location.search); } catch {}
  }));

  // Discord: regular HTTPS link is always the fallback; app deep link is attempted on mobile.
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[data-discord-user]');if(!a)return;
    if(!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))return;
    e.preventDefault();
    const web=a.href, id=a.dataset.discordUser;
    if(!/^\d+$/.test(id)){location.href=web;return;}
    let leftPage=false;
    const onHidden=()=>{if(document.hidden)leftPage=true;};
    document.addEventListener('visibilitychange',onHidden);
    location.href='discord://-/users/'+id;
    setTimeout(()=>{document.removeEventListener('visibilitychange',onHidden);if(!leftPage&&!document.hidden)location.href=web;},1150);
  });

  function observeReveals(root=document){
    const items=qa('.reveal:not(.is-visible)',root);
    if(!('IntersectionObserver'in window)||reduceMotion.matches){items.forEach(el=>el.classList.add('is-visible'));return;}
    if(!observer){observer=new IntersectionObserver(records=>records.forEach(r=>{
      if(r.isIntersecting){r.target.classList.add('is-visible');r.target.classList.remove('is-pending');observer.unobserve(r.target);}
    }),{threshold:.08,rootMargin:'0px 0px 55px 0px'});}
    items.forEach(el=>{el.classList.add('is-pending');observer.observe(el)});
  }
  observeReveals();
  document.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse'||reduceMotion.matches)return;
    const card=e.target.closest('.project-card');if(!card)return;
    const box=card.getBoundingClientRect();card.style.setProperty('--mx',((e.clientX-box.left)/box.width*100)+'%');card.style.setProperty('--my',((e.clientY-box.top)/box.height*100)+'%');
  },{passive:true});

  // Abstract ambient particles; deliberately low-cost, 2D and paused off-screen.
  const canvas=q('#atmosphere'),ctx=canvas.getContext?.('2d');
  if(ctx&&!reduceMotion.matches){
    let width=0,height=0,dpr=1,frame=0,raf=0;
    const particles=Array.from({length:36},(_,i)=>({x:(i*83.1)%100/100,y:(i*37.7)%100/100,r:i%8===0?1.8:.7,phase:i*2.1}));
    const resize=()=>{const rect=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);width=rect.width;height=rect.height;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
    resize();addEventListener('resize',resize,{passive:true});
    const draw=()=>{if(!document.hidden){ctx.clearRect(0,0,width,height);frame+=.008;for(const p of particles){const x=p.x*width+Math.sin(frame+p.phase)*16,y=p.y*height+Math.cos(frame*.7+p.phase)*11;ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(184,255,151,${.12+.13*(1+Math.sin(frame+p.phase))})`;ctx.fill();}}raf=requestAnimationFrame(draw);};
    draw();document.addEventListener('visibilitychange',()=>{if(document.hidden)ctx.clearRect(0,0,width,height)});
  }
})();
