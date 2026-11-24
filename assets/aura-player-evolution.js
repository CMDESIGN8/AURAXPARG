/* AURA XP — perfil de evolución compartido entre programas.
   Contrato START/PRO/ELITE: localStorage con {"1":true,"2":true,...}.
   Tras guardar desde otra página, emitir: window.dispatchEvent(new Event('aura:progress-updated')).
   Cada jornada marcada suma 50 XP locales; los atributos solo usan el mapa real de PRO. */
(function(){
  'use strict';
  const PROGRAMS={
    start:{key:'auraxp-start-7day-progress-v1',days:7},
    pro:{key:'auraxp-pro-21day-progress-v2',days:21},
    elite:{key:'auraxp-elite-30day-progress-v1',days:30}
  };
  const SKILLS={
    start:{coordination:[1,4,7],speed:[5],agility:[4,5],technique:[2,7]},
    pro:{coordination:[1,2,3,7,10,11],speed:[4,8,12,18],agility:[5,9,15,19],technique:[2,3,12,16,19,21]},
    elite:{coordination:[1,2,7,9,15,21,30],speed:[5,8,11,18,27],agility:[6,14,15,22,25,28],technique:[3,11,12,17,21,24,25,26,30]}
  };
  function read(key){
    try{
      const value=JSON.parse(localStorage.getItem(key)||'{}');
      if(!value||typeof value!=='object'||Array.isArray(value))return {};
      return value;
    }catch(error){return {};}
  }
  function count(record){
    return Object.keys(record).filter(key=>record[key]===true).length;
  }
  function refresh(){
    const progress={};
    let totalDays=0,totalXp=0;
    Object.entries(PROGRAMS).forEach(([id,program])=>{
      const saved=read(program.key),completed=count(saved);
      progress[id]={saved,completed,total:program.days,xp:completed*50};
      totalDays+=completed;totalXp+=completed*50;

    });
    const level=1+Math.floor(totalXp/250);
    const rank=level>=9?'ELITE':level>=3?'PROSPECT':'ROOKIE';
    document.querySelectorAll('[data-aura-evolution]').forEach(root=>{
      const set=(selector,value)=>{const el=root.querySelector(selector);if(el)el.textContent=value;};
      set('[data-aura-rank]',rank);
      set('[data-aura-level]','NIVEL '+String(level).padStart(2,'0'));
      set('[data-aura-xp]',String(totalXp).padStart(3,'0'));
      const currentId=root.dataset.auraProgram||'pro';
      const current=progress[currentId]||progress.pro;
      set('[data-aura-days]',current.completed+' / '+current.total);
      const currentPercent=Math.round(current.completed/current.total*100)+'%';
      set('[data-aura-program-percent]',currentPercent);
      set('[data-aura-pro-percent]',currentPercent+' DEL PROGRAMA');
      const overall=root.querySelector('[data-aura-overall]');
      if(overall)overall.style.width=Math.min(100,current.completed/current.total*100)+'%';
      const skillValues={};
      Object.entries(SKILLS[currentId]||SKILLS.pro).forEach(([skill,days])=>{
        skillValues[skill]=Math.round(days.filter(day=>current.saved[String(day)]===true).length/days.length*100);
      });
      Object.entries(skillValues).forEach(([skill,value])=>{
        set('[data-aura-skill="'+skill+'"]',value+'%');
        const bar=root.querySelector('[data-aura-bar="'+skill+'"]');
        if(bar)bar.style.width=value+'%';
      });

    });
    return {progress,totalDays,totalXp,level,rank};
  }
  window.AuraPlayerEvolution={refresh};
  window.addEventListener('storage',refresh);
  window.addEventListener('aura:progress-updated',refresh);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});
  else refresh();
})();