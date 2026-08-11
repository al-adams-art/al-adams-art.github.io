(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = (v='') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const data = window.AL_ADAMS_SITE || {artworks:[],links:{}};

  const PLANES = [
    {code:'00-A',c:['#171511','#242019','#e8dfcf','#f4eddf','#8d412e','#243e52','#cbb468','#a99f8d'],serif:"Georgia,'Times New Roman',serif",sans:'Arial,Helvetica,sans-serif',labels:{archive:'Archive',shop:'Shop',commissions:'Commissions',about:'About',cabinet:'The Cabinet'},archiveHeading:'THE ARCHIVE',archiveEyebrow:'Visual record',order:['archive','shop','commissions','about','cabinet']},
    {code:'04-B',c:['#101820','#18252e','#e6e2d8','#f4f0e7','#a34f35','#365a70','#c4ab62','#9ea7aa'],serif:"Palatino,'Palatino Linotype',serif",sans:"'Trebuchet MS',Arial,sans-serif",labels:{archive:'Records',shop:'Available',commissions:'Commissions',about:'About',cabinet:'The Cabinet'},archiveHeading:'RECORDS',archiveEyebrow:'Public index',order:['archive','shop','commissions','about','cabinet']},
    {code:'11-C',c:['#1a1714','#27211c','#e1d5bd','#f0e6d2','#713c2c','#39464d','#b79b53','#aa9a82'],serif:"Baskerville,'Times New Roman',serif",sans:'Verdana,Arial,sans-serif',labels:{archive:'Archive',shop:'Shop',commissions:'Commissions',about:'Notes',cabinet:'The Cabinet'},archiveHeading:'THE ARCHIVE',archiveEyebrow:'Visual record',order:['archive','shop','commissions','cabinet','about']},
    {code:'27-F',c:['#141216','#211e24','#ded8d0','#eee9e3','#845064','#2f4059','#bfae73','#a29ca7'],serif:'Garamond,Georgia,serif',sans:'Tahoma,Arial,sans-serif',labels:{archive:'Index',shop:'Shop',commissions:'Requests',about:'About',cabinet:'The Cabinet'},archiveHeading:'INDEX',archiveEyebrow:'Filed work',order:['archive','shop','commissions','about','cabinet']},
    {code:'31-K',c:['#151816','#202822','#e3dfcf','#f3f0e2','#92502d','#304d47','#c0aa62','#9f9f8f'],serif:"'Times New Roman',Times,serif",sans:"'Arial Narrow',Arial,sans-serif",labels:{archive:'Records',shop:'Shop',commissions:'Commissions',about:'About',cabinet:'Cabinet'},archiveHeading:'RECORDS',archiveEyebrow:'Current file',order:['archive','commissions','shop','about','cabinet']},
    {code:'66-Q',c:['#181310','#291e18','#e7d9c8','#f6eadb','#a0442b','#3c4454','#c6a45a','#aa9989'],serif:'Cambria,Georgia,serif',sans:'Calibri,Arial,sans-serif',labels:{archive:'Archive',shop:'Shop',commissions:'Commissions',about:'About',cabinet:'Cabinet'},archiveHeading:'THE ARCHIVE',archiveEyebrow:'Visual record',order:['archive','shop','about','commissions','cabinet']}
  ];

  function randomInt(max){
    try { const a=new Uint32Array(1); crypto.getRandomValues(a); return a[0]%max; }
    catch { return Math.floor(Math.random()*max); }
  }
  function newFileId(){
    const a=String(randomInt(100)).padStart(2,'0');
    const b=String(randomInt(1000)).padStart(3,'0');
    const c=String.fromCharCode(65+randomInt(26));
    return `${a}-${b}-${c}`;
  }
  function loadVisitor(){
    let v;
    try { v=JSON.parse(localStorage.getItem('al-visitor-file')||'null'); } catch {}
    if(!v || typeof v!=='object') v={id:newFileId(),created:Date.now(),visits:0,pages:[],artworks:[],planes:[],casesResolved:0};
    v.pages=Array.isArray(v.pages)?v.pages:[];
    v.artworks=Array.isArray(v.artworks)?v.artworks:[];
    v.planes=Array.isArray(v.planes)?v.planes:[];
    v.visits=Number(v.visits)||0;
    v.casesResolved=Number(v.casesResolved)||0;
    if(!sessionStorage.getItem('al-visit-counted')){
      v.visits+=1;
      sessionStorage.setItem('al-visit-counted','1');
    }
    const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    if(!v.pages.includes(page)) v.pages.push(page);
    if(page==='work.html'){
      const id=new URLSearchParams(location.search).get('id');
      if(id && !v.artworks.includes(id)) v.artworks.push(id);
    }
    localStorage.setItem('al-visitor-file',JSON.stringify(v));
    return v;
  }
  const visitor=loadVisitor();
  function saveVisitor(){ localStorage.setItem('al-visitor-file',JSON.stringify(visitor)); }

  function selectPlane(force=false){
    if(!force){
      const saved=sessionStorage.getItem('al-reality-plane');
      const hit=PLANES.find(p=>p.code===saved);
      if(hit) return hit;
    }
    const last=localStorage.getItem('al-last-plane');
    const pool=PLANES.filter(p=>p.code!==last);
    const p=(pool.length?pool:PLANES)[randomInt(pool.length||PLANES.length)];
    sessionStorage.setItem('al-reality-plane',p.code);
    localStorage.setItem('al-last-plane',p.code);
    return p;
  }

  let plane=selectPlane();
  function applyPlane(p){
    plane=p;
    document.documentElement.dataset.reality=p.code;
    const [ink,ink2,paper,paper2,rust,blue,gold,muted]=p.c;
    const vars={'--ink':ink,'--ink2':ink2,'--paper':paper,'--paper2':paper2,'--rust':rust,'--blue':blue,'--gold':gold,'--muted':muted,'--serif':p.serif,'--sans':p.sans};
    Object.entries(vars).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));
    const meta=$('meta[name="theme-color"]'); if(meta) meta.content=ink;
    if(!visitor.planes.includes(p.code)){ visitor.planes.push(p.code); saveVisitor(); }
    const name=$('#reality-name'); if(name) name.textContent=`INDEX ${p.code}`;
    const nav=$('.nav');
    if(nav){
      p.order.forEach((key,i)=>{const a=$(`a[data-page="${key}"]`,nav);if(a){a.textContent=p.labels[key];a.style.order=i;}});
    }
    if(document.body.dataset.page==='archive'){
      const h=$('.page-hero h1'); if(h) h.textContent=p.archiveHeading;
      const e=$('.page-hero .eyebrow'); if(e) e.textContent=p.archiveEyebrow;
    }
    renderVisitor();
    syncPlaneDrawer();
  }

  const style=document.createElement('style');
  style.textContent=`
    .reality-controls{display:flex;align-items:center;gap:8px;white-space:nowrap}.file-stamp,.sfx-toggle{font:700 .56rem/1 var(--mono);letter-spacing:.09em;text-transform:uppercase}.file-stamp{color:var(--muted);opacity:.72}.sfx-toggle{border:1px solid var(--line);background:transparent;color:inherit;padding:7px 8px;min-height:30px}.sfx-toggle:hover,.sfx-toggle:focus-visible{background:var(--gold);color:var(--ink)}
    .visitor-stamp{margin-top:7px;color:var(--muted);opacity:.8}.visitor-file-card{margin:34px 0 0;padding:18px;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.12);display:grid;grid-template-columns:minmax(180px,.75fr) 2fr;gap:22px;align-items:end}.visitor-file-card h2{font:700 clamp(1.65rem,4vw,2.6rem)/1 var(--mono);letter-spacing:.06em;margin:8px 0 0}.visitor-file-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0}.visitor-file-grid div{border-left:1px solid rgba(255,255,255,.18);padding-left:12px}.visitor-file-grid dt{font:700 .58rem/1.2 var(--mono);letter-spacing:.08em;text-transform:uppercase;opacity:.65}.visitor-file-grid dd{margin:7px 0 0;font:700 1.2rem/1 var(--serif)}
    .reality-console{display:flex;align-items:center;gap:13px;flex-wrap:wrap;margin:18px 0 0;padding:10px 0;max-width:720px}.reality-console strong{font:700 .72rem/1.2 var(--mono);letter-spacing:.08em}.drawer-bank{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:30px 0 12px}.cabinet-drawer{min-height:86px;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.1);color:inherit;text-align:left;padding:13px 15px;display:grid;grid-template-columns:44px 1fr;align-items:center;gap:12px;cursor:pointer;transition:.16s ease}.cabinet-drawer:hover,.cabinet-drawer:focus-visible,.cabinet-drawer.active{background:var(--gold);color:var(--ink);transform:translateY(-1px)}.cabinet-drawer span{font:700 .62rem/1 var(--mono);letter-spacing:.1em;opacity:.65}.cabinet-drawer strong{font:700 clamp(1rem,2vw,1.3rem)/1 var(--serif);letter-spacing:.02em}.cabinet-drawer.locked strong:after{content:' / LOCKED';font:700 .55rem/1 var(--mono);letter-spacing:.08em;opacity:.65}.cabinet-drawer.plane-only{grid-column:span 2}.drawer-panel{border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.13);padding:22px;margin-bottom:38px;min-height:190px}.drawer-panel h2{font:700 clamp(1.8rem,4vw,3rem)/1 var(--serif);margin:9px 0 14px}.drawer-panel p{max-width:760px}.drawer-list{display:grid;gap:8px;margin:18px 0}.drawer-list a,.drawer-list .row{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-top:1px solid rgba(255,255,255,.15);color:inherit;text-decoration:none}.drawer-list a:hover strong{text-decoration:underline}.relic-list{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:16px 0}.relic-slot{border:1px solid rgba(255,255,255,.18);padding:12px 8px;text-align:center;font:700 .62rem/1.2 var(--mono);text-transform:uppercase}.relic-slot.found{background:var(--gold);color:var(--ink)}
    .case-file{border-left:2px solid var(--gold);padding:10px 14px;margin:16px 0 8px;background:rgba(0,0,0,.09)}.case-file p{margin:8px 0 0;font:italic 1.08rem/1.45 var(--serif)}.drawers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.drawer{position:relative;padding:15px 10px;display:flex;flex-direction:column;justify-content:center;gap:9px;transition:.18s var(--ease);border:1px solid rgba(255,255,255,.2);background:transparent;color:inherit}.drawer .drawer-number{font:700 .56rem/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;opacity:.58}.drawer .drawer-label{font:700 1rem/1.15 var(--serif)}.drawer.correct{background:var(--gold)!important;color:var(--ink)!important;transform:translateY(3px)}.drawer.wrong{opacity:.38}.drawer:disabled{cursor:default}.game-message{margin-top:10px;font:700 .6rem/1.3 var(--mono);letter-spacing:.08em;text-transform:uppercase}
    .hidden-records{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:18px 0}.hidden-record{border:1px solid rgba(255,255,255,.18);padding:12px;color:inherit;text-decoration:none}.hidden-record strong{display:block;margin-top:5px;font:700 1rem/1.2 var(--serif)}
    html[data-reality="11-C"] .archive-grid .art-card:nth-child(7n+3){transform:rotate(-.18deg)}html[data-reality="27-F"] .site-header{border-bottom-style:dashed}html[data-reality="31-K"] .archive-controls .filter:nth-child(2){border-radius:0}html[data-reality="66-Q"] .footer-name{letter-spacing:.06em}
    @media(max-width:900px){.file-stamp{display:none}.reality-controls{margin-left:auto}.header-row{gap:10px}.visitor-file-card{grid-template-columns:1fr}.visitor-file-grid{grid-template-columns:repeat(2,1fr)}.drawer-bank{grid-template-columns:1fr}.cabinet-drawer.plane-only{grid-column:auto}.drawers,.hidden-records{grid-template-columns:1fr}.relic-list{grid-template-columns:repeat(2,1fr)}}
  `;
  document.head.appendChild(style);

  const headerRow=$('.header-row');
  if(headerRow && !$('.reality-controls')){
    const controls=document.createElement('div');
    controls.className='reality-controls';
    controls.innerHTML=`<span class="file-stamp">FILE ${esc(visitor.id)}</span><button class="sfx-toggle" type="button" aria-pressed="false">SFX ON</button>`;
    headerRow.appendChild(controls);
  }

  function renderVisitor(){
    $$('[data-visitor-id]').forEach(el=>el.textContent=`FILE ${visitor.id}`);
    $$('[data-visit-count]').forEach(el=>el.textContent=visitor.visits);
    $$('[data-record-count]').forEach(el=>el.textContent=visitor.artworks.length);
    $$('[data-plane-count]').forEach(el=>el.textContent=visitor.planes.length);
    $$('[data-relic-count]').forEach(el=>el.textContent=`${getRelics().size}/5`);
    const stamp=$('.file-stamp'); if(stamp) stamp.textContent=`FILE ${visitor.id}`;
    const foot=$('.footer-meta');
    if(foot && !$('.visitor-stamp',foot)){
      const s=document.createElement('div');s.className='visitor-stamp';foot.appendChild(s);
    }
    const fs=$('.visitor-stamp',foot); if(fs) fs.textContent=`FILE ${visitor.id} · VISIT ${visitor.visits}`;
  }

  let ctx=null;
  let muted=localStorage.getItem('al-sfx-muted')==='1';
  const sfxButton=$('.sfx-toggle');
  function syncSfxButton(){ if(!sfxButton)return;sfxButton.textContent=muted?'SFX OFF':'SFX ON';sfxButton.setAttribute('aria-pressed',String(muted)); }
  syncSfxButton();
  sfxButton?.addEventListener('click',()=>{muted=!muted;localStorage.setItem('al-sfx-muted',muted?'1':'0');syncSfxButton();if(!muted)sfx('tick');});
  function audio(){if(muted)return null;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;if(!ctx)ctx=new AC();if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx;}
  function tone(f,d=.07,g=.022,type='sine',delay=0,end=null){const a=audio();if(!a)return;const n=a.currentTime+delay,o=a.createOscillator(),v=a.createGain();o.type=type;o.frequency.setValueAtTime(f,n);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(1,end),n+d);v.gain.setValueAtTime(.0001,n);v.gain.exponentialRampToValueAtTime(g,n+.008);v.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(v).connect(a.destination);o.start(n);o.stop(n+d+.02);}
  function noise(d=.06,g=.012){const a=audio();if(!a)return;const b=a.createBuffer(1,Math.max(1,Math.floor(a.sampleRate*d)),a.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*(1-i/x.length);const s=a.createBufferSource(),v=a.createGain();s.buffer=b;v.gain.value=g;s.connect(v).connect(a.destination);s.start();}
  function sfx(k='tick'){if(muted)return;if(k==='tick')tone(250,.035,.014,'square');if(k==='drawer'){noise(.07,.014);tone(105,.08,.018,'triangle',0,75);}if(k==='relic'){tone(720,.07,.021);tone(1040,.09,.015,'sine',.05);}if(k==='success'){tone(430,.08,.02);tone(650,.09,.018,'sine',.06);tone(860,.11,.016,'sine',.12);}if(k==='wrong')tone(120,.1,.017,'triangle',0,88);if(k==='shift'){tone(300,.07,.015);tone(450,.08,.015,'sine',.05);tone(675,.1,.012,'sine',.1);}}
  document.addEventListener('click',e=>{const b=e.target.closest('a.button,button.button');if(b&&!b.matches('#shift-reality'))sfx('tick');},true);

  const toast=$('#egg-toast'),toastText=$('#egg-toast-text');let toastTimer;
  function showToast(text,label='NOTE'){if(!toast||!toastText)return;const m=$('.micro',toast);if(m)m.textContent=label;toastText.textContent=text;clearTimeout(toastTimer);toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),3600);}

  const relicLabels={key:'BENT KEY',bottlecap:'BOTTLE CAP',toothpick:'TOOTHPICK',thread:'THREAD',button:'BUTTON'};
  function getRelics(){try{return new Set(JSON.parse(localStorage.getItem('al-relics')||'[]'));}catch{return new Set();}}
  function saveRelics(set){localStorage.setItem('al-relics',JSON.stringify([...set]));}
  function syncLedger(){
    const found=getRelics();
    $$('[data-relic-meter]').forEach(el=>el.innerHTML=`FOUND <strong>${found.size}/5</strong>`);
    $$('.relic').forEach(el=>el.classList.toggle('collected',found.has(el.dataset.relic)));
    $$('.relic-slot').forEach(el=>{const id=el.dataset.slot,ok=found.has(id);el.classList.toggle('found',ok);el.textContent=ok?relicLabels[id]:'NOT RECOVERED';});
    renderVisitor();syncRestrictedState();
  }
  $$('.relic').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.relic,found=getRelics();if(!id||found.has(id))return;found.add(id);saveRelics(found);syncLedger();sfx('relic');showToast(relicLabels[id]||id.toUpperCase(),'RECOVERED');}));

  const CASES=[
    {clue:'This archive record began as a broken porcelain figurine recovered from a dumpster.',correct:'Kenny Leggins',wrong:['Open Late','Holy Smokes']},
    {clue:'This object was used as a paintbrush when the scale became small enough.',correct:'Toothpick',wrong:['Thread','Button']},
    {clue:'This archive record is a miniature interior.',correct:'Open Late',wrong:['Storm Coming','Sibling Rivalry']},
    {clue:'This record is an open metal case containing an organized collection of small found objects.',correct:'The Department of Small Important Things',wrong:['Curious Collections of Crap','Jar of Things That Seemed Important']},
    {clue:'This hidden object once served as a clothing fastener.',correct:'Button',wrong:['Bottle cap','Key']},
    {clue:'This hidden object can join materials that previously had no relationship.',correct:'Thread',wrong:['Key','Bottle cap']},
    {clue:'This hidden object began as a closure for a beverage container.',correct:'Bottle cap',wrong:['Button','Toothpick']},
    {clue:'This recent altered-book record combines a checkerboard field with a sheep image.',correct:'Sheep Skeet',wrong:['Sibling Rivalry','Holy Smokes']},
    {clue:'This recent altered-book record takes its title from conflict inside a family.',correct:'Sibling Rivalry',wrong:['Sheep Skeet','Open Late']}
  ];
  function shuffle(a){return [...a].sort(()=>Math.random()-.5);}
  function getCaseState(){
    let s;try{s=JSON.parse(localStorage.getItem('al-case-state')||'null');}catch{}
    if(!s||!Array.isArray(s.set)||s.set.length!==3) s={set:shuffle(CASES.map((_,i)=>i)).slice(0,3),pos:0,total:0,done:false};
    s.pos=Number(s.pos)||0;s.total=Number(s.total)||0;s.done=!!s.done;
    localStorage.setItem('al-case-state',JSON.stringify(s));return s;
  }
  function saveCaseState(s){localStorage.setItem('al-case-state',JSON.stringify(s));visitor.casesResolved=Math.max(visitor.casesResolved,s.total);saveVisitor();}
  function renderCaseGame(root){
    const s=getCaseState();
    if(s.done||s.pos>=3){root.innerHTML=`<span class="micro">Casework</span><h2>THREE RECORDS RESOLVED</h2><p>The casework requirement is complete.</p>`;syncRestrictedState();return;}
    const c=CASES[s.set[s.pos]];
    root.innerHTML=`<span class="micro">Casework / ${s.pos}/3 resolved</span><h2>MATCH THE RECORD</h2><div class="case-file"><span class="micro">CASE ${String(s.pos+1).padStart(2,'0')} / 03</span><p>${esc(c.clue)}</p></div><div class="drawers" id="case-drawers"></div><div class="game-message" id="game-message">Choose the matching record.</div>`;
    const drawers=$('#case-drawers',root),msg=$('#game-message',root);
    shuffle([c.correct,...c.wrong]).forEach((label,i)=>{const b=document.createElement('button');b.className='drawer';b.type='button';b.innerHTML=`<span class="drawer-number">Drawer ${['I','II','III'][i]}</span><span class="drawer-label">${esc(label)}</span>`;b.addEventListener('click',()=>{sfx('drawer');if(label===c.correct){b.classList.add('correct');$$('.drawer',drawers).forEach(x=>x.disabled=true);s.pos+=1;s.total+=1;if(s.pos>=3)s.done=true;saveCaseState(s);if(msg)msg.textContent='MATCH.';sfx('success');setTimeout(()=>renderCaseGame(root),600);}else{b.classList.add('wrong');b.disabled=true;if(msg)msg.textContent='NO MATCH.';sfx('wrong');}});drawers.appendChild(b);});
  }
  function restrictedOpen(){return getRelics().size===5&&getCaseState().done;}
  function afterHoursOpen(){return visitor.visits>=2||visitor.planes.length>=2;}
  function syncRestrictedState(){const b=$('[data-cabinet-drawer="restricted"]');if(b)b.classList.toggle('locked',!restrictedOpen());const a=$('[data-cabinet-drawer="after"]');if(a)a.classList.toggle('locked',!afterHoursOpen());}

  function hashString(s){let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return Math.abs(h>>>0);}
  function chosenArt(count=3,salt=''){const arts=data.artworks||[];if(!arts.length)return[];const start=hashString(visitor.id+plane.code+salt)%arts.length;const out=[];for(let i=0;i<count;i++)out.push(arts[(start+i*7)%arts.length]);return out;}
  function artLinks(arts){return `<div class="hidden-records">${arts.map(a=>`<a class="hidden-record" href="work.html?id=${encodeURIComponent(a.id)}"><span class="micro">${esc(a.id)} / ${esc(a.category)}</span><strong>${esc(a.title)}</strong></a>`).join('')}</div>`;}

  function renderLost(panel){const found=getRelics();panel.innerHTML=`<span class="micro">Drawer 01</span><h2>LOST PROPERTY</h2><p>Recovered objects remain attached to this browser file.</p><div class="relic-list">${Object.keys(relicLabels).map(id=>`<div class="relic-slot ${found.has(id)?'found':''}" data-slot="${id}">${found.has(id)?relicLabels[id]:'NOT RECOVERED'}</div>`).join('')}</div><a class="button small" href="lost-property.html">Open full ledger</a>`;}
  function renderCross(panel){panel.innerHTML=`<span class="micro">Drawer 03</span><h2>CROSS-INDEX</h2><p>Three existing records have been cross-filed under this visitor file and current index.</p>${artLinks(chosenArt(3,'cross'))}`;}
  function renderMail(panel){const mail=(data.links&&data.links.email)||'the.official.a.l.adams@gmail.com';panel.innerHTML=`<span class="micro">Drawer 04</span><h2>CORRESPONDENCE</h2><p>Public correspondence is not stored in the Cabinet.</p><a class="button small" href="mailto:${esc(mail)}">Email A. L. Adams</a>`;}
  function renderGaps(panel){const gaps=(data.artworks||[]).filter(a=>!a.year||!a.medium||!a.dimensions).slice(0,6);panel.innerHTML=`<span class="micro">Drawer 05</span><h2>CATALOGUE GAPS</h2><p>Records with one or more catalogue fields still pending.</p><div class="drawer-list">${gaps.map(a=>`<a href="work.html?id=${encodeURIComponent(a.id)}"><strong>${esc(a.title)}</strong><span class="micro">${esc(a.id)}</span></a>`).join('')}</div>`;}
  function renderAfter(panel){if(!afterHoursOpen()){panel.innerHTML=`<span class="micro">Drawer 06</span><h2>AFTER HOURS</h2><p>No entry is filed under this index yet.</p>`;return;}panel.innerHTML=`<span class="micro">Drawer 06</span><h2>AFTER HOURS</h2><p>This drawer is not linked from the public navigation.</p><a class="button small" href="after-hours.html">Open after-hours index</a>`;}
  function renderRestricted(panel){if(!restrictedOpen()){const f=getRelics().size,s=getCaseState();panel.innerHTML=`<span class="micro">Drawer 07</span><h2>RESTRICTED</h2><p>Access requires five recovered objects and three resolved case files.</p><div class="drawer-list"><div class="row"><strong>Recovered objects</strong><span>${f}/5</span></div><div class="row"><strong>Case files</strong><span>${Math.min(s.pos,3)}/3</span></div></div>`;return;}panel.innerHTML=`<span class="micro">Drawer 07</span><h2>RESTRICTED</h2><p>Access condition satisfied.</p><a class="button small" href="records-00.html">Open unlisted record</a>`;}
  function renderPlaneOnly(panel){panel.innerHTML=`<span class="micro">No drawer number</span><h2>UNFILED</h2><p>No accession label is attached to this drawer.</p>${artLinks(chosenArt(1,'unfiled'))}`;}

  function openCabinetDrawer(key,button){
    const panel=$('#drawer-panel');if(!panel)return;
    $$('.cabinet-drawer').forEach(b=>b.classList.toggle('active',b===button));sfx('drawer');
    if(key==='lost')renderLost(panel);
    if(key==='cases')renderCaseGame(panel);
    if(key==='cross')renderCross(panel);
    if(key==='mail')renderMail(panel);
    if(key==='gaps')renderGaps(panel);
    if(key==='after')renderAfter(panel);
    if(key==='restricted')renderRestricted(panel);
    if(key==='unfiled')renderPlaneOnly(panel);
  }
  function bindCabinet(){
    $$('[data-cabinet-drawer]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>openCabinetDrawer(b.dataset.cabinetDrawer,b));});
    syncRestrictedState();
  }
  function syncPlaneDrawer(){
    const bank=$('.drawer-bank');if(!bank)return;
    const shouldShow=['11-C','66-Q'].includes(plane.code)||visitor.visits>=4;
    let b=$('[data-cabinet-drawer="unfiled"]',bank);
    if(shouldShow&&!b){b=document.createElement('button');b.className='cabinet-drawer plane-only';b.type='button';b.dataset.cabinetDrawer='unfiled';b.innerHTML='<span>—</span><strong>&nbsp;</strong>';bank.appendChild(b);}
    if(!shouldShow&&b)b.remove();
    bindCabinet();
  }

  function renderLostPropertyPage(){const root=$('#lost-property-list');if(!root)return;const found=getRelics();root.innerHTML=Object.keys(relicLabels).map((id,i)=>`<div class="row"><span class="micro">ITEM ${String(i+1).padStart(2,'0')}</span><strong>${found.has(id)?relicLabels[id]:'NOT RECOVERED'}</strong></div>`).join('');}
  function renderAfterHoursPage(){const root=$('#after-hours-records');if(root)root.innerHTML=artLinks(chosenArt(3,'after-hours'));}
  function renderRestrictedPage(){const root=$('#restricted-root');if(!root)return;if(!restrictedOpen()){root.innerHTML=`<span class="eyebrow">Access denied</span><h1>RECORD 00</h1><p>The access condition has not been satisfied in this browser file.</p><a class="button" href="cabinet.html">Return to Cabinet</a>`;return;}root.innerHTML=`<span class="eyebrow">Unlisted record</span><h1>RECORD 00</h1><p>This page is outside the public navigation.</p>${artLinks(chosenArt(3,'restricted'))}<a class="button" href="cabinet.html">Return to Cabinet</a>`;}

  $('#shift-reality')?.addEventListener('click',()=>{sfx('shift');sessionStorage.removeItem('al-reality-plane');applyPlane(selectPlane(true));const panel=$('#drawer-panel');if(panel)panel.innerHTML='<span class="micro">Drawer status</span><h2>SELECT A DRAWER</h2>';$$('.cabinet-drawer').forEach(b=>b.classList.remove('active'));});

  applyPlane(plane);
  bindCabinet();
  syncLedger();
  renderLostPropertyPage();
  renderAfterHoursPage();
  renderRestrictedPage();
})();