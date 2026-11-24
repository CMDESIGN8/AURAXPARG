/* AURA XP — perfil de evolución compartido entre programas */
(function(){
  'use strict';
  const PROGRAMS={
    start:{key:'auraxp-start-7day-progress-v1',days:7},
    pro:{key:'auraxp-pro-21day-progress-v2',days:21},
    elite:{key:'auraxp-elite-30day-progress-v1',days:30}
  };
  const SKILLS={
    coordination:[1,2,3,7,10,11],
    speed:[4,8,12,18],
    agility:[5,9,15,19],
    technique:[2,3,12,16,19,21]
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
    let totalDays=0,totalXp=0,started=0;
    Object.entries(PROGRAMS).forEach(([id,program])=>{
      const saved=read(program.key),completed=count(saved);
      progress[id]={saved,completed,total:program.days,xp:completed*50};
      totalDays+=completed;totalXp+=completed*50;
      if(completed>0)started++;
    });
    const level=1+Math.floor(totalXp/250);
    const rank=level>=9?'ELITE':level>=3?'PROSPECT':'ROOKIE';
    const skillValues={};
    Object.entries(SKILLS).forEach(([skill,days])=>{
      const saved=progress.pro.saved;
      const done=days.filter(day=>saved[String(day)]===true).length;
      skillValues[skill]=Math.round(done/days.length*100);
    });
    document.querySelectorAll('[data-aura-evolution]').forEach(root=>{
      const set=(selector,value)=>{const el=root.querySelector(selector);if(el)el.textContent=value;};
      set('[data-aura-rank]',rank);
      set('[data-aura-level]','NIVEL '+String(level).padStart(2,'0'));
      set('[data-aura-xp]',String(totalXp).padStart(3,'0'));
      set('[data-aura-days]',totalDays+' / 58');
      set('[data-aura-programs]',started+' / 3');
      Object.entries(skillValues).forEach(([skill,value])=>{
        set('[data-aura-skill="'+skill+'"]',value+'%');
        const bar=root.querySelector('[data-aura-bar="'+skill+'"]');
        if(bar)bar.style.width=value+'%';
      });
      Object.keys(PROGRAMS).forEach(id=>{
        const badge=root.querySelector('[data-aura-program-status="'+id+'"]');
        if(badge)badge.classList.toggle('is-active',progress[id].completed>0);
      });
    });
    return {progress,totalDays,totalXp,level,rank,skills:skillValues};
  }
  window.AuraPlayerEvolution={refresh};
  window.addEventListener('storage',refresh);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});
  else refresh();
})();