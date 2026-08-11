(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  const PLANES = [
    {code:'00-A', c:['#171511','#242019','#e8dfcf','#f4eddf','#8d412e','#243e52','#cbb468','#a99f8d'], serif:"Georgia,'Times New Roman',serif", sans:'Arial,Helvetica,sans-serif', note:'Results may vary by dimension.'},
    {code:'04-B', c:['#101820','#18252e','#e6e2d8','#f4f0e7','#a34f35','#365a70','#c4ab62','#9ea7aa'], serif:"Palatino,'Palatino Linotype',serif", sans:"'Trebuchet MS',Arial,sans-serif", note:'For external use only.'},
    {code:'11-C', c:['#1a1714','#27211c','#e1d5bd','#f0e6d2','#713c2c','#39464d','#b79b53','#aa9a82'], serif:"Baskerville,'Times New Roman',serif", sans:'Verdana,Arial,sans-serif', note:'Please retain this card for evidentiary purposes.'},
    {code:'27-F', c:['#141216','#211e24','#ded8d0','#eee9e3','#845064','#2f4059','#bfae73','#a29ca7'], serif:'Garamond,Georgia,serif', sans:'Tahoma,Arial,sans-serif', note:'No warranty expressed, implied, or available in this dimension.'},
    {code:'31-K', c:['#151816','#202822','#e3dfcf','#f3f0e2','#92502d','#304d47','#c0aa62','#9f9f8f'], serif:"'Times New Roman',Times,serif", sans:"'Arial Narrow',Arial,sans-serif", note:'Void in jurisdictions governed by common sense.'},
    {code:'66-Q', c:['#181310','#291e18','#e7d9c8','#f6eadb','#a0442b','#3c4454','#c6a45a','#aa9989'], serif:'Cambria,Georgia,serif', sans:'Calibri,Arial,sans-serif', note:'Some assembly of reality required.'}
  ];

  function selectPlane(force=false) {
    if (!force) {
      const saved = sessionStorage.getItem('al-reality-plane');
      const hit = PLANES.find(p => p.code === saved);
      if (hit) return hit;
    }
    const last = localStorage.getItem('al-last-plane');
    const pool = PLANES.filter(p => p.code !== last);
    const p = (pool.length ? pool : PLANES)[Math.floor(Math.random() * (pool.length || PLANES.length))];
    sessionStorage.setItem('al-reality-plane', p.code);
    localStorage.setItem('al-last-plane', p.code);
    return p;
  }

  let plane = selectPlane();
  function applyPlane(p) {
    plane = p;
    document.documentElement.dataset.reality = p.code;
    const [ink,ink2,paper,paper2,rust,blue,gold,muted] = p.c;
    const vars = {'--ink':ink,'--ink2':ink2,'--paper':paper,'--paper2':paper2,'--rust':rust,'--blue':blue,'--gold':gold,'--muted':muted,'--serif':p.serif,'--sans':p.sans};
    Object.entries(vars).forEach(([k,v]) => document.documentElement.style.setProperty(k,v));
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = ink;
    const name = $('#reality-name');
    if (name) name.textContent = `PLANE ${p.code}`;
    $$('.dimension-slip').forEach(el => el.textContent = p.note);
  }
  applyPlane(plane);

  const style = document.createElement('style');
  style.textContent = `
    .reality-controls{display:flex;align-items:center;gap:7px;white-space:nowrap}.reality-stamp,.sfx-toggle{font:700 .56rem/1 var(--mono);letter-spacing:.09em;text-transform:uppercase}.reality-stamp{color:var(--muted);opacity:.78}.sfx-toggle{border:1px solid var(--line);background:transparent;color:inherit;padding:7px 8px;min-height:30px}.sfx-toggle:hover,.sfx-toggle:focus-visible{background:var(--gold);color:var(--ink)}
    .dimension-slip{margin-top:9px;color:var(--muted);font:700 .56rem/1.4 var(--mono);letter-spacing:.08em;text-transform:uppercase}.reality-console{display:flex;align-items:center;gap:13px;flex-wrap:wrap;margin:24px 0 0;padding:12px 14px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.1);max-width:720px}.reality-console strong{font:700 .72rem/1.2 var(--mono);letter-spacing:.08em}
    .case-file{border-left:2px solid var(--gold);padding:10px 14px;margin:16px 0 8px;background:rgba(0,0,0,.09)}.case-file p{margin:8px 0 0;font:italic 1.08rem/1.45 var(--serif)}.drawer{position:relative;padding:15px 10px;display:flex;flex-direction:column;justify-content:center;gap:9px;transition:.18s var(--ease)}.drawer .drawer-number{font:700 .56rem/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;opacity:.58}.drawer .drawer-label{font:700 1rem/1.15 var(--serif)}.drawer.correct{background:var(--gold)!important;color:var(--ink)!important;transform:translateY(3px)}.drawer.wrong{opacity:.38}.drawer:disabled{cursor:default}
    html[data-reality="11-C"] .art-card:nth-child(7n+3),html[data-reality="66-Q"] .feature-card:nth-child(2){transform:rotate(-.18deg)}html[data-reality="27-F"] .home-art .label{transform:rotate(.3deg)}html[data-reality="31-K"] .door:nth-child(4){border-style:dashed}
    @media(max-width:900px){.reality-stamp{display:none}.reality-controls{margin-left:auto}.header-row{gap:10px}}
  `;
  document.head.appendChild(style);

  const headerRow = $('.header-row');
  if (headerRow && !$('.reality-controls')) {
    const controls = document.createElement('div');
    controls.className = 'reality-controls';
    controls.innerHTML = `<span class="reality-stamp">PLANE ${plane.code}</span><button class="sfx-toggle" type="button" aria-pressed="false">SFX ON</button>`;
    headerRow.appendChild(controls);
  }

  const foot = $('.footer-meta');
  if (foot && !$('.dimension-slip')) {
    const slip = document.createElement('div');
    slip.className = 'dimension-slip';
    slip.textContent = plane.note;
    foot.appendChild(slip);
  }

  let ctx = null;
  let muted = localStorage.getItem('al-sfx-muted') === '1';
  const sfxButton = $('.sfx-toggle');
  function syncSfxButton(){
    if (!sfxButton) return;
    sfxButton.textContent = muted ? 'SFX OFF' : 'SFX ON';
    sfxButton.setAttribute('aria-pressed', String(muted));
  }
  syncSfxButton();
  sfxButton?.addEventListener('click', () => {
    muted = !muted;
    localStorage.setItem('al-sfx-muted', muted ? '1' : '0');
    syncSfxButton();
    if (!muted) sfx('tick');
  });

  function audio(){
    if (muted) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
    return ctx;
  }
  function tone(f,d=.07,g=.022,type='sine',delay=0,end=null){
    const a=audio(); if(!a)return;
    const n=a.currentTime+delay,o=a.createOscillator(),v=a.createGain();
    o.type=type; o.frequency.setValueAtTime(f,n);
    if(end)o.frequency.exponentialRampToValueAtTime(Math.max(1,end),n+d);
    v.gain.setValueAtTime(.0001,n); v.gain.exponentialRampToValueAtTime(g,n+.008); v.gain.exponentialRampToValueAtTime(.0001,n+d);
    o.connect(v).connect(a.destination); o.start(n); o.stop(n+d+.02);
  }
  function noise(d=.06,g=.012){
    const a=audio(); if(!a)return;
    const b=a.createBuffer(1,Math.max(1,Math.floor(a.sampleRate*d)),a.sampleRate),x=b.getChannelData(0);
    for(let i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*(1-i/x.length);
    const s=a.createBufferSource(),v=a.createGain(); s.buffer=b; v.gain.value=g; s.connect(v).connect(a.destination); s.start();
  }
  function sfx(k='tick'){
    if(muted)return;
    if(k==='tick')tone(250,.035,.014,'square');
    if(k==='drawer'){noise(.07,.014);tone(105,.08,.018,'triangle',0,75);}
    if(k==='relic'){tone(720,.07,.021);tone(1040,.09,.015,'sine',.05);}
    if(k==='success'){tone(430,.08,.02);tone(650,.09,.018,'sine',.06);tone(860,.11,.016,'sine',.12);}
    if(k==='wrong')tone(120,.1,.017,'triangle',0,88);
    if(k==='shift'){tone(300,.07,.015);tone(450,.08,.015,'sine',.05);tone(675,.1,.012,'sine',.1);}
  }

  $$('a.button, button.button').forEach(el => el.addEventListener('click', () => {
    if (!el.matches('#shift-reality,#oracle-button')) sfx('tick');
  }));

  const toast = $('#egg-toast');
  const toastText = $('#egg-toast-text');
  let toastTimer;
  function showToast(text,label='NOTE'){
    if(!toast || !toastText)return;
    const m=$('.micro',toast); if(m)m.textContent=label;
    toastText.textContent=text;
    clearTimeout(toastTimer); toast.classList.add('show');
    toastTimer=setTimeout(()=>toast.classList.remove('show'),4200);
  }

  const RELICS=['key','bottlecap','toothpick','thread','button'];
  const relicLabels={key:'ITEM 01-A / BENT KEY',bottlecap:'ITEM 02-C / BOTTLE CAP',toothpick:'ITEM 03-F / TOOTHPICK',thread:'ITEM 04-B / THREAD',button:'ITEM 05-D / BUTTON'};
  function getRelics(){try{return new Set(JSON.parse(localStorage.getItem('al-relics')||'[]'));}catch{return new Set();}}
  function saveRelics(set){localStorage.setItem('al-relics',JSON.stringify([...set]));}
  function getScore(){return Number(sessionStorage.getItem('al-case-score')||0);}
  function syncLedger(){
    const found=getRelics();
    $$('[data-relic-meter]').forEach(el=>el.innerHTML=`FOUND <strong>${found.size}/5</strong>`);
    $$('.relic').forEach(el=>el.classList.toggle('collected',found.has(el.dataset.relic)));
    $$('.relic-slot').forEach(el=>{const ok=found.has(el.dataset.slot);el.classList.toggle('found',ok);el.textContent=ok?el.dataset.slot:'???';});
    const score=$('#game-score'); if(score)score.textContent=getScore();
    const secret=$('#secret-room'); if(secret)secret.classList.toggle('unlocked',found.size===5&&getScore()>=3);
  }
  $$('.relic').forEach(el=>el.addEventListener('click',()=>{
    const id=el.dataset.relic,found=getRelics();
    if(!id||found.has(id))return;
    found.add(id);saveRelics(found);syncLedger();sfx('relic');
    showToast(relicLabels[id]||id.toUpperCase(),'EVIDENCE RECOVERED');
  }));
  syncLedger();

  const notes=[
    'No refunds on existential damage.',
    'Objects in studio may be stranger than they appear.',
    'Some assembly of reality required.',
    'Please retain this card for evidentiary purposes.',
    'Results may vary by dimension.',
    'For external use only.'
  ];
  if(!sessionStorage.getItem('al-note-shown')){
    setTimeout(()=>{
      showToast(notes[Math.floor(Math.random()*notes.length)],'NOTICE');
      sessionStorage.setItem('al-note-shown','1');
    },19000+Math.floor(Math.random()*9000));
  }
  $('#oracle-button')?.addEventListener('click',()=>{sfx('tick');showToast(notes[Math.floor(Math.random()*notes.length)],'RANDOM NOTE');});

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
  function getCaseSet(){
    try{
      const saved=JSON.parse(sessionStorage.getItem('al-case-set')||'null');
      if(Array.isArray(saved)&&saved.length===3)return saved;
    }catch{}
    const set=shuffle(CASES.map((_,i)=>i)).slice(0,3);
    sessionStorage.setItem('al-case-set',JSON.stringify(set));
    return set;
  }
  function renderCase(){
    const root=$('#case-game'); if(!root)return;
    const score=getScore(),set=getCaseSet();
    const clue=$('#case-clue'),num=$('#case-number'),drawers=$('#case-drawers'),msg=$('#game-message');
    if(score>=3){
      if(num)num.textContent='CASE SET COMPLETE';
      if(clue)clue.textContent='Three records resolved.';
      if(drawers)drawers.innerHTML='';
      if(msg)msg.textContent=getRelics().size===5?'Back room access is open.':'Recover all five hidden objects to open the back room.';
      syncLedger(); return;
    }
    const c=CASES[set[score]];
    if(num)num.textContent=`CASE ${String(score+1).padStart(2,'0')} / 03`;
    if(clue)clue.textContent=c.clue;
    if(msg)msg.textContent='Choose the matching record.';
    if(!drawers)return;
    drawers.innerHTML='';
    shuffle([c.correct,...c.wrong]).forEach((label,i)=>{
      const b=document.createElement('button');
      b.className='drawer'; b.type='button';
      b.innerHTML=`<span class="drawer-number">Drawer ${['I','II','III'][i]}</span><span class="drawer-label">${label}</span>`;
      b.addEventListener('click',()=>{
        sfx('drawer');
        if(label===c.correct){
          b.classList.add('correct');
          $$('.drawer',drawers).forEach(x=>x.disabled=true);
          const next=score+1; sessionStorage.setItem('al-case-score',String(next));
          if(msg)msg.textContent='MATCH.';
          sfx('success'); syncLedger(); setTimeout(renderCase,650);
        }else{
          b.classList.add('wrong'); b.disabled=true;
          if(msg)msg.textContent='NO MATCH.';
          sfx('wrong');
        }
      });
      drawers.appendChild(b);
    });
  }
  renderCase();

  $('#shift-reality')?.addEventListener('click',()=>{
    sfx('shift');
    sessionStorage.removeItem('al-reality-plane');
    sessionStorage.removeItem('al-case-set');
    sessionStorage.removeItem('al-case-score');
    applyPlane(selectPlane(true));
    const stamp=$('.reality-stamp'); if(stamp)stamp.textContent=`PLANE ${plane.code}`;
    renderCase();syncLedger();
  });
})();