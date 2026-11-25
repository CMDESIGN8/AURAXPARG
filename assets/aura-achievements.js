/* AURA XP — logros permanentes de finalización START / PRO / ELITE.
   La colección es independiente del progreso reiniciable de cada programa. */
(function(){
  'use strict';
  const STORAGE_KEY='auraxp-achievements-v1';
  const PROGRAMS={
    start:{progressKey:'auraxp-start-7day-progress-v1',days:7,name:'START 7',badge:'START ROOKIE',subtitle:'FIRST STEP',tone:'cyan',message:'Construiste tu base. El primer paso de tu evolución ya es parte de tu historia.'},
    pro:{progressKey:'auraxp-pro-21day-progress-v2',days:21,name:'PRO 21',badge:'PRO EVOLVED',subtitle:'PLAYER EVOLUTION',tone:'blue',message:'Tres semanas de constancia. Tus recursos empiezan a conectarse como jugador.'},
    elite:{progressKey:'auraxp-elite-30day-progress-v1',days:30,name:'ELITE 30',badge:'ELITE PLAYER',subtitle:'GAME MASTER',tone:'gold',message:'Un mes de trabajo completado. Integraste tus habilidades y cerraste el desafío.'}
  };
  const ORDER=['start','pro','elite'];
  const svg=(id,tone,locked=false)=> {
    const palettes={cyan:['#08c9f4','#b7ff3c','#e9fbff'],blue:['#08c9f4','#426bff','#eafaff'],gold:['#ffd36a','#fff1ad','#fff8df']};
    const p=palettes[tone]||palettes.cyan;
    return '<svg class="aura-badge-art'+(locked?' is-locked':'')+'" viewBox="0 0 220 240" role="img" aria-label="'+(locked?'Insignia bloqueada':'Insignia '+id)+'"><defs><linearGradient id="metal-'+id+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+p[0]+'"/><stop offset=".52" stop-color="'+p[2]+'"/><stop offset="1" stop-color="'+p[1]+'"/></linearGradient><radialGradient id="glow-'+id+'"><stop stop-color="'+p[0]+'" stop-opacity=".48"/><stop offset="1" stop-color="'+p[0]+'" stop-opacity="0"/></radialGradient></defs><circle cx="110" cy="104" r="94" fill="url(#glow-'+id+')" opacity=".8"/><path d="M110 10 190 42 181 151 110 218 39 151 30 42Z" fill="#07111d" stroke="url(#metal-'+id+')" stroke-width="5"/><path d="M110 22 178 49 170 145 110 202 50 145 42 49Z" fill="#0b1b2b" stroke="'+p[0]+'" stroke-opacity=".5" stroke-width="1.5"/><path d="M110 34 165 56 159 137 110 184 61 137 55 56Z" fill="none" stroke="url(#metal-'+id+')" stroke-width="2"/><path d="m110 48 12 29 31 3-23 21 7 31-27-16-27 16 7-31-23-21 31-3Z" fill="url(#metal-'+id+')" opacity=".94"/><path d="M72 154h76" stroke="'+p[0]+'" stroke-width="2" opacity=".75"/><text x="110" y="174" text-anchor="middle" fill="#f4f8fc" font-family="Arial,sans-serif" font-size="10" font-weight="900" letter-spacing="3">AURA XP</text><text x="110" y="192" text-anchor="middle" fill="'+p[1]+'" font-family="Arial,sans-serif" font-size="8" font-weight="700" letter-spacing="2">ACHIEVEMENT</text></svg>';
  };
  function readProgress(program){
    try{
      const value=JSON.parse(localStorage.getItem(program.progressKey)||'{}');
      if(!value||typeof value!=='object'||Array.isArray(value))return 0;
      let count=0;
      for(let day=1;day<=program.days;day++)if(value[String(day)]===true||value[String(day)]===1||value[String(day)]==='true')count++;
      return count;
    }catch(error){return 0;}
  }
  function readAwards(){
    try{
      const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
      return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
    }catch(error){return {};}
  }
  let awards=readAwards();
  let modal,collection,emblemMount,hasShown=false;
  function saveAwards(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(awards));return true;}
    catch(error){console.warn('AURA XP: no se pudo guardar la colección de logros.',error);return false;}
  }
  function unlock(id,show){
    if(awards[id])return false;
    const award={unlockedAt:new Date().toISOString()};
    awards[id]=award;
    if(!saveAwards()){delete awards[id];return false;}
    renderCollection();
    if(show)openModal(id);
    return true;
  }
  function check(showNew){
    awards=readAwards();
    ORDER.forEach(id=>{
      const program=PROGRAMS[id];
      if(readProgress(program)===program.days&&!awards[id])unlock(id,showNew&&!hasShown);
    });
  }
  function closeModal(){
    if(!modal)return;
    modal.classList.remove('is-open');
    document.body.classList.remove('aura-award-open');
  }
  function openModal(id){
    if(!modal||!PROGRAMS[id])return;
    const p=PROGRAMS[id];
    modal.querySelector('[data-award-art]').innerHTML=svg(id,p.tone);
    modal.querySelector('[data-award-program]').textContent=p.name+' COMPLETADO';
    modal.querySelector('[data-award-title]').textContent=p.badge;
    modal.querySelector('[data-award-subtitle]').textContent=p.subtitle;
    modal.querySelector('[data-award-message]').textContent=p.message;
    modal.classList.add('is-open');
    document.body.classList.add('aura-award-open');
    hasShown=true;
  }

  function renderEmblem(){
    if(!emblemMount)return;
    awards=readAwards();
    const id=ORDER.includes(awards.equipped)&&awards[awards.equipped]?awards.equipped:null;
    if(!id){emblemMount.innerHTML='<div class="aura-equipped-empty"><span>PLAYER EMBLEM</span><b>SIN EMBLEMA</b><small>DESBLOQUEÁ UNA INSIGNIA Y EQUIPALA ACÁ</small></div>';return;}
    const p=PROGRAMS[id];
    emblemMount.innerHTML='<div class="aura-equipped-card"><div class="aura-equipped-art">'+svg(id,p.tone)+'</div><div class="aura-equipped-copy"><span>✦ EMBLEMA EQUIPADO</span><b>'+p.badge+'</b><small>'+p.name+' · '+p.subtitle+'</small></div></div>';
  }
  function equip(id){
    awards=readAwards();
    if(!ORDER.includes(id)||!awards[id])return;
    awards.equipped=id;
    if(saveAwards()){renderCollection();renderEmblem();}
  }
  function renderCollection(){
    if(!collection)return;
    awards=readAwards();
    collection.innerHTML='<div class="aura-achievements-head"><div><span class="aura-achievements-kicker">AURA XP // TROPHY ROOM</span><h2>MI COLECCIÓN <em>DE LOGROS.</em></h2><p>Los hitos que desbloqueás entrenando quedan guardados. Reiniciar un plan no borra tus insignias.</p></div><strong class="aura-achievements-count">'+ORDER.filter(id=>awards[id]).length+' / 3 <small>UNLOCKED</small></strong></div><div class="aura-achievements-grid">'+ORDER.map(id=>{
      const p=PROGRAMS[id],won=!!awards[id];
      const equipped=awards.equipped===id;
      return '<article class="aura-achievement-card '+(won?'is-unlocked':'is-locked')+(equipped?' is-equipped':'')+'"><div class="aura-achievement-visual">'+svg(id,p.tone,!won)+'</div><div class="aura-achievement-info"><span>'+(equipped?'✦ EN TU PERFIL':won?'✦ DESBLOQUEADA':'🔒 BLOQUEADA')+'</span><b>'+p.badge+'</b><small>'+p.name+' · '+p.subtitle+'</small>'+(won?'<button type="button" class="aura-equip-button" data-equip-badge="'+id+'" '+(equipped?'disabled':'')+'>'+(equipped?'EQUIPADA':'EQUIPAR INSIGNIA')+'</button>':'')+'</div></article>';
    }).join('')+'</div>';
  }
  function mount(){
    const progress=document.querySelector('[data-aura-evolution]');
    emblemMount=document.querySelector('[data-aura-equipped-badge]');
    const target=document.querySelector('[data-aura-achievements-mount]')||progress;
    if(!target)return;
    const style=document.createElement('style');
    style.textContent=`
      .aura-achievements{width:min(100%,1040px);margin:0 auto 30px;padding:clamp(16px,3vw,25px);border:1px solid rgba(8,201,244,.22);background:linear-gradient(145deg,rgba(8,201,244,.045),rgba(5,12,22,.96) 48%,rgba(183,255,60,.025));color:#f4f8fc}
      .aura-achievements-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px}.aura-achievements-kicker{font-size:8px;letter-spacing:.18em;font-weight:900;color:#08c9f4}.aura-achievements-head h2{font-size:clamp(20px,3vw,29px);line-height:1;letter-spacing:-.05em;margin:7px 0}.aura-achievements-head h2 em{font-style:normal;color:#08c9f4}.aura-achievements-head p{font-size:10px;color:#91a4b6;max-width:560px}.aura-achievements-count{text-align:right;white-space:nowrap;font-size:23px;line-height:1;color:#b7ff3c}.aura-achievements-count small{display:block;margin-top:5px;font-size:7px;letter-spacing:.14em;color:#91a4b6}
      .aura-equipped-emblem{margin:12px 0 0;min-width:0}.aura-equipped-card{display:flex;align-items:center;gap:10px;padding:7px 12px;border:1px solid rgba(8,201,244,.3);background:linear-gradient(120deg,rgba(8,201,244,.09),rgba(8,16,27,.82));min-width:190px}.aura-equipped-art{width:48px;flex:0 0 48px;filter:drop-shadow(0 0 10px rgba(8,201,244,.25))}.aura-equipped-copy span,.aura-equipped-empty span{display:block;font-size:7px;font-weight:900;letter-spacing:.14em;color:#b7ff3c}.aura-equipped-copy b,.aura-equipped-empty b{display:block;font-size:10px;line-height:1.2}.aura-equipped-copy small,.aura-equipped-empty small{display:block;margin-top:3px;font-size:7px;color:#91a4b6;letter-spacing:.06em}.aura-equipped-empty{padding:9px 12px;border:1px dashed rgba(255,255,255,.17);min-width:190px}.aura-equip-button{display:block;margin-top:8px;padding:7px 9px;border:1px solid rgba(8,201,244,.45);background:rgba(8,201,244,.08);color:#08c9f4;font:900 7px Montserrat,Arial,sans-serif;letter-spacing:.1em;cursor:pointer}.aura-equip-button:disabled{border-color:rgba(183,255,60,.3);color:#b7ff3c;cursor:default}.aura-achievement-card.is-equipped{border-color:rgba(183,255,60,.6);box-shadow:inset 0 0 24px rgba(183,255,60,.06)}
      .aura-achievements-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.aura-achievement-card{min-width:0;display:flex;align-items:center;gap:10px;padding:11px;background:linear-gradient(145deg,#102338,#09131f);border:1px solid rgba(255,255,255,.09)}.aura-achievement-card.is-unlocked{border-color:rgba(8,201,244,.4);box-shadow:inset 0 0 22px rgba(8,201,244,.045)}.aura-achievement-visual{width:76px;flex:0 0 76px}.aura-badge-art{display:block;width:100%;height:auto;filter:drop-shadow(0 0 12px rgba(8,201,244,.18))}.aura-badge-art.is-locked{filter:grayscale(1);opacity:.3}.aura-achievement-info{min-width:0}.aura-achievement-info span{display:block;font-size:7px;letter-spacing:.1em;font-weight:900;color:#b7ff3c;margin-bottom:5px}.aura-achievement-card.is-locked .aura-achievement-info span{color:#8292a2}.aura-achievement-info b{display:block;font-size:10px;line-height:1.2;letter-spacing:.03em}.aura-achievement-info small{display:block;margin-top:5px;color:#91a4b6;font-size:7px;line-height:1.4;letter-spacing:.05em}
      .aura-award-modal{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:18px;background:rgba(1,5,11,.88);backdrop-filter:blur(12px);opacity:0;visibility:hidden;transition:opacity .28s,visibility .28s}.aura-award-modal.is-open{opacity:1;visibility:visible}.aura-award-dialog{position:relative;width:min(100%,490px);padding:27px 24px 24px;text-align:center;overflow:hidden;border:1px solid rgba(8,201,244,.55);background:radial-gradient(ellipse at 50% 0,rgba(8,201,244,.2),transparent 58%),linear-gradient(145deg,#102338,#050b13 72%);box-shadow:0 0 70px rgba(8,201,244,.16),0 24px 90px rgba(0,0,0,.6);transform:translateY(18px) scale(.96);transition:transform .35s cubic-bezier(.2,.8,.2,1)}.is-open .aura-award-dialog{transform:translateY(0) scale(1)}.aura-award-dialog:before,.aura-award-dialog:after{content:"";position:absolute;width:240px;height:240px;border:1px solid rgba(8,201,244,.14);border-radius:50%;left:50%;top:75px;transform:translateX(-50%);box-shadow:0 0 0 18px rgba(8,201,244,.025),0 0 0 38px rgba(8,201,244,.018);pointer-events:none}.aura-award-dialog:after{width:190px;height:190px;top:100px;border-color:rgba(183,255,60,.16);box-shadow:none}.aura-award-close{position:absolute;right:12px;top:10px;border:1px solid rgba(255,255,255,.16);background:rgba(0,0,0,.25);color:#fff;width:32px;height:32px;cursor:pointer;font-size:18px;z-index:2}.aura-award-kicker{font-size:9px;font-weight:900;letter-spacing:.22em;color:#b7ff3c}.aura-award-art{position:relative;z-index:1;width:min(62%,230px);margin:5px auto -2px;filter:drop-shadow(0 0 20px rgba(8,201,244,.38));animation:auraBadgeReveal .85s cubic-bezier(.2,.8,.2,1) both}.aura-award-art .aura-badge-art{width:100%}.aura-award-program{position:relative;z-index:1;font-size:8px;font-weight:900;letter-spacing:.2em;color:#08c9f4}.aura-award-title{position:relative;z-index:1;font-size:clamp(27px,7vw,39px);font-weight:950;letter-spacing:-.055em;line-height:1.02;margin:7px 0}.aura-award-subtitle{font-size:9px;font-weight:900;letter-spacing:.16em;color:#b7ff3c}.aura-award-message{max-width:360px;margin:13px auto 20px;font-size:11px;line-height:1.6;color:#b9c8d6}.aura-award-cta{position:relative;z-index:1;width:100%;padding:14px;border:0;background:linear-gradient(90deg,#08c9f4,#b7ff3c);color:#06111a;font:900 10px Montserrat,Arial,sans-serif;letter-spacing:.12em;cursor:pointer}.aura-award-foot{margin-top:12px;color:#72869a;font-size:7px;letter-spacing:.1em}
      body.aura-award-open{overflow:hidden}@keyframes auraBadgeReveal{0%{opacity:0;transform:translateY(22px) scale(.55) rotate(-9deg);filter:drop-shadow(0 0 0 transparent)}65%{opacity:1;transform:translateY(-5px) scale(1.06) rotate(2deg)}100%{transform:translateY(0) scale(1) rotate(0);filter:drop-shadow(0 0 20px rgba(8,201,244,.38)}}@media(max-width:650px){.aura-achievements{width:100%;max-width:100%;min-width:0;padding:14px 12px;margin:0 auto 22px;overflow:hidden}.aura-achievements *{min-width:0;max-width:100%;box-sizing:border-box}.aura-achievements-head{display:flex;flex-direction:column;align-items:stretch;gap:10px;margin-bottom:14px}.aura-achievements-head>div{width:100%;min-width:0}.aura-achievements-head h2{font-size:clamp(18px,5.6vw,23px);overflow-wrap:anywhere}.aura-achievements-head p{width:100%;max-width:100%;font-size:10px;line-height:1.5;overflow-wrap:anywhere}.aura-achievements-count{align-self:flex-start;text-align:left;font-size:19px}.aura-achievements-grid{grid-template-columns:minmax(0,1fr);gap:8px;width:100%}.aura-achievement-card{display:grid!important;grid-template-columns:72px minmax(0,1fr)!important;grid-template-rows:auto!important;align-items:center!important;gap:10px!important;width:100%!important;height:auto!important;min-height:112px!important;padding:12px!important;overflow:visible!important;position:relative!important}.aura-achievement-visual{display:block!important;position:relative!important;z-index:1!important;width:72px!important;max-width:72px!important;min-width:72px!important;flex:none!important;align-self:center!important}.aura-achievement-visual .aura-badge-art{display:block!important;width:100%!important;height:auto!important;max-height:none!important;object-fit:contain!important}.aura-achievement-info{display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:flex-start!important;position:relative!important;z-index:2!important;width:100%!important;min-width:0!important;overflow:visible!important;overflow-wrap:anywhere!important;text-align:left!important}.aura-achievement-info span,.aura-achievement-info b,.aura-achievement-info small{position:relative!important;z-index:2!important;display:block!important;width:100%!important;white-space:normal!important;overflow:visible!important;visibility:visible!important;opacity:1!important}.aura-achievement-info b{font-size:11px!important;line-height:1.3!important}.aura-achievement-info small{font-size:8px!important;line-height:1.45!important}.aura-equip-button{position:relative!important;z-index:3!important}.aura-achievement-info span,.aura-achievement-info b,.aura-achievement-info small{max-width:100%;overflow-wrap:anywhere;word-break:normal}.aura-achievement-info b{font-size:10px;line-height:1.3}.aura-achievement-info small{font-size:8px;line-height:1.45}.aura-equip-button{width:100%;max-width:100%;white-space:normal;line-height:1.35;padding:8px 7px;font-size:8px}.aura-equipped-emblem{width:100%;margin:8px 0 0}.aura-equipped-card{width:100%;min-width:0;padding:7px 9px}.aura-equipped-empty{width:100%;min-width:0;overflow-wrap:anywhere}.aura-award-dialog{padding:24px 18px 19px}.aura-award-art{width:min(58%,205px)}}@media(prefers-reduced-motion:reduce){.aura-award-art,.aura-award-dialog{animation:none;transition:none}}
    `;
    document.head.appendChild(style);
    collection=document.createElement('section');
    collection.className='aura-achievements';
    collection.setAttribute('aria-label','Colección de logros AURA XP');
    if(target.hasAttribute('data-aura-achievements-mount'))target.appendChild(collection);
    else target.insertAdjacentElement('afterend',collection);
    modal=document.createElement('div');
    modal.className='aura-award-modal';
    modal.innerHTML='<div class="aura-award-dialog" role="dialog" aria-modal="true" aria-labelledby="auraAwardTitle"><button class="aura-award-close" type="button" aria-label="Cerrar">×</button><div class="aura-award-kicker">✦ ACHIEVEMENT UNLOCKED ✦</div><div class="aura-award-art" data-award-art></div><div class="aura-award-program" data-award-program></div><h2 class="aura-award-title" id="auraAwardTitle" data-award-title></h2><div class="aura-award-subtitle" data-award-subtitle></div><p class="aura-award-message" data-award-message></p><button class="aura-award-cta" type="button">VER MI COLECCIÓN</button><div class="aura-award-foot">ESTE LOGRO ES TUYO. ENTRENÁ EL PRÓXIMO NIVEL.</div></div>';
    document.body.appendChild(modal);
    modal.querySelector('.aura-award-close').addEventListener('click',closeModal);
    modal.querySelector('.aura-award-cta').addEventListener('click',()=>{closeModal();collection.scrollIntoView({behavior:'smooth',block:'center'});});
    modal.addEventListener('click',event=>{if(event.target===modal)closeModal();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();});
    renderCollection();
    renderEmblem();
    collection.addEventListener('click',event=>{
      const button=event.target.closest('[data-equip-badge]');
      if(button&&!button.disabled)equip(button.getAttribute('data-equip-badge'));
    });
  }
  function init(){
    mount();
    check(true);
    window.addEventListener('aura:progress-updated',()=>check(true));
    window.addEventListener('storage',()=>{check(false);renderCollection();renderEmblem();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
