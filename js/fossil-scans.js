/* Real museum fossil meshes, embedded from Sketchfab. GBIF integration remains in final.js. */
(() => {
 const frame=document.getElementById('fossil-scan-frame');if(!frame)return;
 const specimens={
  trex:{id:'cf48487de55d454b8adc92dce2840a0d',name:'Tyrannosaurus rex',period:'Late Cretaceous',description:'A 3D scan of a T. rex skull cast displayed at the Museum of the Earth, Ithaca, New York.',source:'Digital Atlas of Ancient Life · CC0',url:'https://sketchfab.com/3d-models/vertebrate-tyrannosaurus-rex-skull-mote-cf48487de55d454b8adc92dce2840a0d'},
  triceratops:{id:'e79b8c766af4488081b817ab17da5059',name:'Triceratops horridus',period:'Late Cretaceous',description:'A digitized Triceratops skull from Smithsonian specimen USNM PAL500000 (Hatcher). The displayed version is a scaled, simplified scan.',source:'nzfauna / Smithsonian Digitization · source CC0',url:'https://sketchfab.com/3d-models/skull-from-triceratops-horridus-usnm-pal500000-e79b8c766af4488081b817ab17da5059'},
  stegosaurus:{id:'dc6e1c748484449587b81426d41da6cb',name:'Stegosaurus stenops',period:'Late Jurassic',description:'A detailed 3D scan of the full Stegosaurus skeleton from the Denver Museum of Nature & Science, including its tail spikes.',source:'Artec 3D · CC BY',url:'https://sketchfab.com/3d-models/stegosaurus-skeleton-dc6e1c748484449587b81426d41da6cb'}
 };
 let current='';
 function choose(kind){const m=specimens[kind];if(!m||current===kind)return;current=kind;
  frame.src=`https://sketchfab.com/models/${m.id}/embed?autostart=0&ui_infos=0&ui_controls=1&ui_watermark=1`;
  frame.title=`Interactive 3D scan: ${m.name}`;
  for(const [id,value] of [['fossil-name',m.name],['fossil-description',m.description],['fossil-period',m.period]]){const el=document.getElementById(id);if(el)el.textContent=value;}
  const source=document.getElementById('fossil-model-source');if(source){source.href=m.url;source.textContent=m.source;}
  document.querySelectorAll('.fossil-choice').forEach(btn=>{const on=btn.dataset.fossil===kind;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on));});
  const status=document.getElementById('fossil-status');if(status)status.textContent='Loading museum 3D scan…';
  window.dispatchEvent(new CustomEvent('dinoworld:fossil-selected',{detail:{species:m.name}}));
 }
 frame.addEventListener('load',()=>{const el=document.getElementById('fossil-status');if(el)el.textContent='3D viewer loaded · drag to rotate';});
 document.querySelectorAll('.fossil-choice').forEach(btn=>btn.addEventListener('click',()=>choose(btn.dataset.fossil)));
 choose('trex');
})();
