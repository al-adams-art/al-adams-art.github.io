(() => {
  const data = window.AL_ADAMS_SITE;
  if (!data) return;
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const PLANES=[
    {code:'00-A',name:'LOCAL / MOSTLY STABLE',c:['#171511','#242019','#e8dfcf','#f4eddf','#8d412e','#243e52','#cbb468','#a99f8d'],serif:"Georgia,'Times New Roman',serif",sans:'Arial,Helvetica,sans-serif',note:'Results may vary by dimension.'},
    {code:'04-B',name:'BLUE-SHIFTED CIVILIAN COPY',c:['#101820','#18252e','#e6e2d8','#f4f0e7','#a34f35','#365a70','#c4ab62','#9ea7aa'],serif:"Palatino,'Palatino Linotype',serif",sans:"'Trebuchet MS',Arial,sans-serif",note:'Approved for limited civilian handling.'},
    {code:'11-C',name:'ARCHIVAL COPY / MARGINALLY WRONG',c:['#1a1714','#27211c','#e1d5bd','#f0e6d2','#713c2c','#39464d','#b79b53','#aa9a82'],serif:"Baskerville,'Times New Roman',serif",sans:'Verdana,Arial,sans-serif',note:'Please retain this page for evidentiary purposes.'},
    {code:'27-F',name:'LOW-LIGHT REALITY PLANE',c:['#141216','#211e24','#ded8d0','#eee9e3','#845064','#2f4059','#bfae73','#a29ca7'],serif:'Garamond,Georgia,serif',sans:'Tahoma,Arial,sans-serif',note:'No warranty expressed, implied, or available in this dimension.'},
    {code:'31-K',name:'DEPARTMENTAL DUPLICATE',c:['#151816','#202822','#e3dfcf','#f3f0e2','#92502d','#304d47','#c0aa62','#9f9f8f'],serif:"'Times New Roman',Times,serif",sans:"'Arial Narrow',Arial,sans-serif",note:'Void in jurisdictions governed by common sense.'},
    {code:'66-Q',name:'UNFILED / STILL OPERATIONAL',c:['#181310','#291e18','#e7d9c8','#f6eadb','#a0442b','#3c4454','#c6a45a','#aa9989'],serif:'Cambria,Georgia,serif',sans:'Calibri,Arial,sans-serif',note:'Some assembly of reality required.'}
  ];
  function pick(force=false){
    if(!force){const saved=sessionStorage.getItem('al-reality-plane'), hit=PLANES.find(p=>p.code===saved); if(hit)return hit;}
    const last=localStorage.getItem('al-last-plane'); let pool=PLANES.filter(p=>p.code!==last); if(!pool.length)pool=PLANES;
    const p=pool[Math.floor(Math.random()*pool.length)]; sessionStorage.setItem('al-reality-plane',p.code); localStorage.setItem('al-last-plane',p.code); return p;
  }
  let plane=pick();
  function applyPlane(p){
    plane=p; document.documentElement.dataset.reality=p.code;
    const [ink,ink2,paper,paper2,rust,blue,gold,muted]=p.c;
    const vars={'--ink':ink,'--ink2':ink2,'--paper':paper,'--paper2':paper2,'--rust':rust,'--blue':blue,'--gold':gold,'--muted':muted,'--serif':p.serif,'--sans':p.sans};
    Object.entries(vars).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));
    const meta=$('meta[name="theme-color"]'); if(meta)meta.content=ink;
  }
  applyPlane(plane);

  const style=document.createElement('style'); style.textContent=`
    .reality-controls{display:flex;align-items:center;gap:7px;white-space:nowrap}.reality-stamp,.sfx-toggle{font:700 .56rem/1 var(--mono);letter-spacing:.09em;text-transform:uppercase}.reality-stamp{color:var(--muted);opacity:.82}.sfx-toggle{border:1px solid var(--line);background:transparent;color:inherit;padding:7px 8px;min-height:30px}.sfx-toggle:hover,.sfx-toggle:focus-visible{background:var(--gold);color:var(--ink)}
    .dimension-slip{margin-top:10px;max-width:390px;color:var(--muted);font:700 .57rem/1.4 var(--mono);letter-spacing:.08em;text-transform:uppercase}.reality-console{display:flex;align-items:center;gap:13px;flex-wrap:wrap;margin:24px 0 0;padding:12px 14px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.12);max-width:780px}.reality-console strong{font:700 .78rem/1.2 var(--mono);letter-spacing:.08em}
    .case-file{border-left:3px solid var(--gold);padding:10px 14px;margin:16px 0 8px;background:rgba(0,0,0,.11)}.case-file p{margin:8px 0 0;font:italic 1.12rem/1.45 var(--serif)}.drawer{position:relative;padding:15px 10px;display:flex;flex-direction:column;justify-content:center;gap:9px;transition:.18s var(--ease)}.drawer .drawer-number{font:700 .56rem/1 var(--mono);letter-spacing:.1em;text-transform:uppercase;opacity:.58}.drawer .drawer-label{font:700 1rem/1.15 var(--serif)}.drawer.correct{background:var(--gold)!important;color:var(--ink)!important;transform:translateY(4px)}.drawer.wrong{animation:drawer-shake .25s linear 1;background:rgba(141,65,46,.35)!important}@keyframes drawer-shake{0%,100%{transform:translateX(0)}33%{transform:translateX(-3px)}66%{transform:translateX(3px)}}
    html[data-reality="11-C"] .art-card:nth-child(7n+3),html[data-reality="66-Q"] .feature-card:nth-child(2){transform:rotate(-.22deg)}html[data-reality="27-F"] .home-art .label{transform:rotate(.35deg)}html[data-reality="31-K"] .door:nth-child(4){border-style:dashed}.recent-intake{color:var(--rust)}
    @media(max-width:900px){.reality-stamp{display:none}.reality-controls{margin-left:auto}.header-row{gap:10px}}
  `; document.head.appendChild(style);

  let ctx=null, muted=localStorage.getItem('al-sfx-muted')==='1';
  function audio(){if(muted)return null; const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;if(!ctx)ctx=new AC();if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx;}
  function tone(f,d=.07,g=.025,type='sine',delay=0,end=null){const a=audio();if(!a)return;const n=a.currentTime+delay,o=a.createOscillator(),v=a.createGain();o.type=type;o.frequency.setValueAtTime(f,n);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(1,end),n+d);v.gain.setValueAtTime(.0001,n);v.gain.exponentialRampToValueAtTime(g,n+.008);v.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(v).connect(a.destination);o.start(n);o.stop(n+d+.02);}
  function noise(d=.06,g=.015){const a=audio();if(!a)return;const b=a.createBuffer(1,Math.max(1,Math.floor(a.sampleRate*d)),a.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*(1-i/x.length);const s=a.createBufferSource(),v=a.createGain();s.buffer=b;v.gain.value=g;s.connect(v).connect(a.destination);s.start();}
  function sfx(k='tick'){if(muted)return;if(k==='tick')tone(260,.035,.017,'square');if(k==='drawer'){noise(.08,.018);tone(105,.09,.02,'triangle',0,72);}if(k==='relic'){tone(740,.08,.025);tone(1110,.11,.017,'sine',.055);}if(k==='success'){tone(440,.09,.024);tone(660,.1,.022,'sine',.07);tone(880,.12,.02,'sine',.14);}if(k==='wrong')tone(115,.12,.021,'sawtooth',0,82);if(k==='oracle'){noise(.13,.015);tone(240,.16,.015,'sine',.03,390);}if(k==='shift'){tone(310,.08,.017);tone(465,.09,.017,'sine',.06);tone(697,.12,.014,'sine',.12);}}

  const RELICS=['key','bottlecap','toothpick','thread','button'];
  const evidence={
    key:['ITEM 01-A / BENT KEY','Recovered from a location unwilling to cooperate. Purpose disputed. Ownership increasingly theoretical.'],
    bottlecap:['ITEM 02-C / BOTTLE CAP','Former beverage-security device. Current importance exceeds original assignment.'],
    toothpick:['ITEM 03-F / TOOTHPICK','Previously promoted to paintbrush under adverse scale conditions. Tool classification remains valid.'],
    thread:['ITEM 04-B / THREAD','Structural material capable of joining objects with no prior relationship.'],
    button:['ITEM 05-D / BUTTON','Garment-affiliation unknown. Separation appears permanent. Please retain for evidentiary purposes.']
  };
  function relics(){try{return new Set(JSON.parse(localStorage.getItem('al-relics')||'[]'));}catch(e){return new Set();}}
  function caseScore(){return Number(sessionStorage.getItem('al-case-score')||0)}
  function syncLedger(){const f=relics();$$('[data-relic-meter]').forEach(el=>el.innerHTML=`FOUND <strong>${f.size}/5</strong>`);$$('.relic-slot').forEach(el=>{const ok=f.has(el.dataset.slot);el.classList.toggle('found',ok);el.textContent=ok?el.dataset.slot:'???';});const secret=$('#secret-room');if(secret)secret.classList.toggle('unlocked',f.size===5&&caseScore()>=3);}
  function toast(text,label='FOUND NOTE'){const box=$('#egg-toast'),t=$('#egg-toast-text');if(!box||!t)return;const m=$('.micro',box);if(m)m.textContent=label;t.textContent=text;box.classList.add('show');clearTimeout(window.__alToast);window.__alToast=setTimeout(()=>box.classList.remove('show'),4800);}

  const DT=['No refunds on existential damage.','Objects in studio may be stranger than they appear.','Creative decisions made under questionable supervision.','Please retain this card for evidentiary purposes.','Some assembly of reality required.','This seemed like a good idea at the time.','Keep away from open flames.','Void in jurisdictions governed by common sense.','No warranty expressed, implied, or available in this dimension.','If found, deny everything.','Drawn from questionable conclusions.','Drawn under adverse conditions.','Results may vary by dimension.','For external use only.','Do not operate heavy machinery while interpreting symbolism.','May contain traces of nuts.','Use only as directed.','Not tested on the mentally stable.','May become sentient if ignored.','Approved for limited civilian handling.','Not for resale to respectable institutions.','For best results, follow instructions in the order they become physically available on this reality plane.'];

  const CASES=[
    ['The intake record says the object arrived broken from a dumpster, was painted, altered, and later issued a wig. Which archive file fits the statement?',['Kenny Leggins','Open Late','Storm Coming'],'Kenny Leggins','File matched. Provenance remains more dignified than the object.'],
    ['The Department describes an open metal case containing small tools, printed pieces, beads, and miniature parts. Which record should be pulled?',['The Department of Small Important Things','Jar of Things That Seemed Important','Failure in the Moonlight'],'The Department of Small Important Things','Correct file. The Department would like credit for having a Department.'],
    ['One recovered item was promoted to paintbrush because the actual painting was too small for ordinary equipment. Which item has the strongest claim?',['toothpick','button','thread'],'toothpick','Correct. Tool classification revised after management stopped laughing.'],
    ['The object was manufactured to fasten clothing, became separated from the garment, and now exists mainly because someone noticed it. Select the evidence.',['button','key','bottlecap'],'button','Correct. Original garment remains uncooperative.'],
    ['The item formerly sealed a beverage and now occupies more archival attention than the beverage ever received. Select the evidence.',['bottlecap','thread','toothpick'],'bottlecap','Correct. Civilization continues under review.'],
    ['The object opens what is closed, possesses teeth, and has never once explained what it belongs to. Select the evidence.',['key','button','thread'],'key','Correct. Ownership remains increasingly theoretical.'],
    ['The evidence weighs less than the paperwork describing it and can join two things that were previously not on speaking terms. Select the evidence.',['thread','bottlecap','key'],'thread','Correct. Structural ambition confirmed.'],
    ['Which archive record is a detailed miniature interior with a pastry counter, tiny furniture, flowers, brick walls, and warm interior lighting?',['Open Late','Surf the Rainbow','Further Curious Collections of Crap'],'Open Late','Correct. Tiny pastry jurisdiction established.'],
    ['Two glass-jar records are in the archive. Which title most explicitly admits the contents only seemed important?',['Jar of Things That Seemed Important','Something Built a Nest Here','Curious Collections of Crap'],'Jar of Things That Seemed Important','Correct. Importance remains provisional.']
  ];
  const shuffle=a=>{a=[...a];for(let i=a.length-1;i;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a};
  function order(){try{const o=JSON.parse(sessionStorage.getItem('al-case-order')||'null');if(Array.isArray(o)&&o.length===3)return o;}catch(e){}const o=shuffle(CASES.map((_,i)=>i)).slice(0,3);sessionStorage.setItem('al-case-order',JSON.stringify(o));return o;}

  function initGame(){const game=$('#case-game');if(!game)return;const seq=order(),scoreEl=$('#game-score'),num=$('#case-number'),clue=$('#case-clue'),drawers=$('#case-drawers'),msg=$('#game-message');let score=caseScore();
    function render(){if(scoreEl)scoreEl.textContent=score;syncLedger();if(score>=3){num.textContent='CASEWORK COMPLETE';clue.textContent=relics().size===5?'Evidence and casework agree. The back room is now accessible.':`Casework complete. Back-room access still requires the full evidence ledger (${relics().size}/5 recovered).`;drawers.innerHTML='';msg.textContent='No further drawer opening has been authorized. This has never stopped anybody before.';return;}const c=CASES[seq[score]];num.textContent=`CASE FILE ${String(score+1).padStart(2,'0')} / PLANE ${plane.code}`;clue.textContent=c[0];msg.textContent='Read the clue. Open one drawer. Regret remains complimentary.';drawers.innerHTML=shuffle(c[1]).map((o,i)=>`<button class="drawer" type="button" data-answer="${esc(o)}"><span class="drawer-number">Drawer ${['I','II','III'][i]}</span><span class="drawer-label">${esc(o)}</span></button>`).join('');$$('.drawer',drawers).forEach(d=>d.addEventListener('click',()=>{sfx('drawer');if(d.dataset.answer===c[2]){$$('.drawer',drawers).forEach(x=>x.disabled=true);d.classList.add('correct');score++;sessionStorage.setItem('al-case-score',score);msg.textContent=c[3];sfx('success');syncLedger();setTimeout(render,900);}else{d.classList.add('wrong');msg.textContent='No match. The drawer contained dust, one receipt, and administrative confidence unsupported by evidence.';sfx('wrong');setTimeout(()=>d.classList.remove('wrong'),350);}}));}render();}

  function init(){
    const row=$('.header-row');if(row&&!$('.reality-controls')){const d=document.createElement('div');d.className='reality-controls';d.innerHTML=`<span class="reality-stamp">PLANE ${plane.code}</span><button class="sfx-toggle" type="button">SFX ${muted?'OFF':'ON'}</button>`;row.insertBefore(d,$('.relic-meter',row)||null);$('.sfx-toggle',d).onclick=e=>{muted=!muted;localStorage.setItem('al-sfx-muted',muted?'1':'0');e.currentTarget.textContent=`SFX ${muted?'OFF':'ON'}`;if(!muted)sfx('success');};}
    const foot=$('.site-footer .footer-row > div:first-child');if(foot&&!$('.dimension-slip',foot)){const d=document.createElement('div');d.className='dimension-slip';d.textContent=plane.note;foot.appendChild(d);}
    const rn=$('#reality-name');if(rn)rn.textContent=`${plane.code} / ${plane.name}`;
    $$('.relic').forEach(el=>el.addEventListener('click',e=>{e.stopImmediatePropagation();const id=el.dataset.relic,f=relics();if(!id||f.has(id))return;f.add(id);localStorage.setItem('al-relics',JSON.stringify([...f]));el.classList.add('collected');syncLedger();const [label,text]=evidence[id]||['EVIDENCE INTAKE',`Recovered: ${id}.`];toast(text,label);sfx('relic');},true));syncLedger();
    const featured=$('#featured-art');if(featured){const works=data.artworks.filter(a=>a.featured).slice(0,3);if(works.length===3)featured.innerHTML=works.map(a=>`<a class="feature-card" href="work.html?id=${encodeURIComponent(a.id)}"><img src="${esc(a.image)}" alt="${esc(a.alt)}" loading="lazy"><div class="copy"><span class="micro">RECENT INTAKE / ${esc(a.category)}</span><strong>${esc(a.title)}</strong><span class="micro">Open record →</span></div></a>`).join('');}
    const grid=$('#archive-grid');if(grid){$$('.art-card',grid).forEach(card=>{const m=card.getAttribute('href')?.match(/id=(AL-\d+)/);if(m&&Number(m[1].slice(3))>=13){const micro=$('.micro',card);if(micro&&!micro.textContent.includes('RECENT')){const s=document.createElement('span');s.className='recent-intake';s.textContent=' / RECENT INTAKE';micro.appendChild(s);}}});}
    const shop=$('#shop-grid');if(shop){[...shop.children].forEach((card,i)=>{if(data.artworks[i]?.availability==='archive')card.remove();});}
    $('#oracle-button')?.addEventListener('click',e=>{e.stopImmediatePropagation();toast(DT[Math.floor(Math.random()*DT.length)],'DUMPSTER ORACLE');sfx('oracle');},true);
    $('#shift-reality')?.addEventListener('click',()=>{sfx('shift');sessionStorage.removeItem('al-reality-plane');sessionStorage.removeItem('al-case-score');sessionStorage.removeItem('al-case-order');const p=pick(true);applyPlane(p);toast(`Reassignment approved. Local reality is now ${p.code}.`,'JURISDICTION UPDATE');setTimeout(()=>location.reload(),650);});
    document.addEventListener('pointerdown',e=>{if(e.target.closest('a,.button,.filter,.nav-toggle')&&!e.target.closest('.drawer,.sfx-toggle,#shift-reality,#oracle-button'))sfx('tick');},{passive:true});
    initGame();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
