// Астральне тіло: блок «Чакры (Стогны)», Лад і Леля менші на 20 %, у виді збоку Лад і Леля сховані
(()=>{
const san=s=>s.replace(/\s/g,'_').replace(/[\[\]\.:\/]/g,'');
const SHOULDER=['Чакра Лада','Чакра Лада (спина)','Чакра Леля','Чакра Леля (спина)'];
let shoulderMeshes=[];

// ── Сушумна, Ида і Пингала: від вершини нижньої чакри до вершини верхньої, 6 витків ──
const Z0=0.041;            // вісь сушумни (glTF z)
const Y0=0.949,Y1=1.7581;   // низ / верх сушумни = вершини чакр «Исток» і «Колород» (низ піднято на 4 см; верх — на рівні 6 чакри)
const HR=0.023,TR=0.009;   // радіус спіралі, радіус трубки Иды/Пингалы
const ENV_F=Z0+HR+TR,ENV_B=Z0-HR-TR; // найдальші точки Иды/Пингалы спереду / ззаду
const CS=0.935;            // масштаб усіх чакр (0,85 + 10 %), у межах астральної аури
// 6 перетинів (вид спереду): низ сушумни (виходить 1 чакра), чакри 2, 3, 4, 5 і верх сушумни (виходять 6 і 7 чакри)
// 14.11 (12:55): чакри на місцях, вказаних користувачем; перехрещення Иды/Пингалы (вид спереду) — точно на рівнях чакр 2–5
const CHAKRA_Y={_2_:1.0858,_3_:1.2726,_4_:1.4145,_5_:1.5713}; // Живот −2,5 см, Ярло без змін, Сердце −2 см, Горло −2,5 см (від 12:47)
const KN=[Y0,CHAKRA_Y._2_,CHAKRA_Y._3_,CHAKRA_Y._4_,CHAKRA_Y._5_,Y1];
// кінці: як і раніше — канали плавно сходяться в сушумну (зразок — як сходяться в голові)

function phaseFn(){// плавна монотонна фаза: φ(KN[k]) = kπ
 const n=KN.length,d=[],m=[];for(let k=0;k<n-1;k++)d.push(Math.PI/(KN[k+1]-KN[k]));
 m[0]=d[0];m[n-1]=d[n-2];for(let k=1;k<n-1;k++)m[k]=2*d[k-1]*d[k]/(d[k-1]+d[k]);
 return y=>{let k=0;while(k<n-2&&y>KN[k+1])k++;const h=KN[k+1]-KN[k],t=Math.min(1,Math.max(0,(y-KN[k])/h)),t2=t*t,t3=t2*t;
  return (2*t3-3*t2+1)*k*Math.PI+(t3-2*t2+t)*h*m[k]+(-2*t3+3*t2)*(k+1)*Math.PI+(t3-t2)*h*m[k+1];};}

function helixGeo(G,off){
 const BG=G.constructor,BA=G.attributes.position.constructor,ph=phaseFn();
 const NS=420,NR=14,P=[],Nn=[],UV=[],I=[];
 const env=y=>{const a=Math.min(1,(y-Y0)/0.07,(Y1-y)/0.07);return Math.sin(Math.max(0,a)*Math.PI/2);};
 const C=y=>{const th=-Math.PI/2-ph(y)+off,r=HR*env(y);return [r*Math.cos(th),y,Z0+r*Math.sin(th)];};
 for(let i=0;i<=NS;i++){const y=Y0+(Y1-Y0)*i/NS,c=C(y),e=0.0005,a=C(Math.max(Y0,y-e)),b=C(Math.min(Y1,y+e));
  let T=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];let l=Math.hypot(...T);T=T.map(v=>v/l);
  let B=[0,T[2],-T[1]];l=Math.hypot(...B);B=B.map(v=>v/l);            // B = T × X
  const N=[B[1]*T[2]-B[2]*T[1],B[2]*T[0]-B[0]*T[2],B[0]*T[1]-B[1]*T[0]];
  const dEnd=Math.min(y-Y0,Y1-y),rr=dEnd<TR?TR*Math.sqrt(Math.max(0,1-(1-dEnd/TR)**2)):TR; // заокруглені кінці
  for(let j=0;j<=NR;j++){const an=j/NR*2*Math.PI,ca=Math.cos(an),sa=Math.sin(an);const nx=ca*N[0]+sa*B[0],ny=ca*N[1]+sa*B[1],nz=ca*N[2]+sa*B[2];
   P.push(c[0]+rr*nx,c[1]+rr*ny,c[2]+rr*nz);Nn.push(nx,ny,nz);UV.push(i/NS,j/NR);}}
 for(let i=0;i<NS;i++)for(let j=0;j<NR;j++){const a=i*(NR+1)+j,b=a+NR+1;I.push(a,b,a+1,b,b+1,a+1);}
 const g=new BG();g.setAttribute('position',new BA(new Float32Array(P),3));g.setAttribute('normal',new BA(new Float32Array(Nn),3));
 g.setAttribute('uv',new BA(new Float32Array(UV),2));g.setIndex(new BA(new Uint32Array(I),1));g.computeBoundingBox();g.computeBoundingSphere();return g;}

function reshapeChannels(scene){
 const ida=scene.getObjectByName(san('Ида (Инь)')),pin=scene.getObjectByName(san('Пингала (Ян)')),su=scene.getObjectByName('Channel_White_Center');
 if(ida){const g=helixGeo(ida.geometry,0);ida.geometry.dispose();ida.geometry=g;}
 if(pin){const g=helixGeo(pin.geometry,Math.PI);pin.geometry.dispose();pin.geometry=g;}
 if(su){const g=su.geometry,p=g.attributes.position;g.computeBoundingBox();const a=g.boundingBox.min.y,b=g.boundingBox.max.y;
  for(let i=0;i<p.count;i++)p.setY(i,Y0+(p.getY(i)-a)/(b-a)*(Y1-Y0));p.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();}
 // чакри: вершини торкаються Иды/Пингалы (спереду / ззаду), нижня й верхня виходять з кінців сушумни; усі в межах аури
 scene.getObjectByName('Group_Astral').children.forEach(o=>{const n=o.name;if(!/Чакра/.test(n))return;const back=/спина/.test(n),H=0.11*(/_5_.*спина/.test(n)?0.9:CS);
  if(/Лада|Леля/.test(n)){o.scale.multiplyScalar(CS);
   // ближче до плечей: вершини конусів заходять у плече, біля кістки (плечовий суглоб ≈ z 0,02)
   const h=0.11*0.8*CS;o.position.z=back?0.005-h:0.030+h;return;}
  o.scale.multiplyScalar(/_5_.*спина/.test(n)?0.9:CS);  // 5 чакра ззаду трохи менша — інакше торкається межі аури на шиї
  if(/_1_/.test(n))o.position.set(0,Y0-H,Z0);
  else if(/_7_/.test(n))o.position.set(0,Y1+H,Z0);
  else if(/_6_/.test(n)){o.position.y=Y1;o.position.z=back?Z0-TR-H:Z0+TR+H;}  // 6 чакра — на верхній дузі каналів (лоб), вершини торкаються каналів
  else{const k=Object.keys(CHAKRA_Y).find(k=>n.includes(k));if(k)o.position.y=CHAKRA_Y[k];  // чакри 2–5 — на перехрещеннях
   o.position.z=back?ENV_B-H:ENV_F+H;}});}

// яскраві насичені кольори чакр (без «вибілювання» тон-маппінгом, менш прозорі)
const CHAKRA_COLORS=[[/_1_/,0xff0000],[/_2_/,0xff6a00],[/_3_/,0xffe000],[/_4_/,0x00d84a],[/_5_/,0x00b8ff],[/_6_/,0x0a2cff],[/_7_/,0x8a10ff],[/Лада/,0x007a40],[/Леля/,0x78e62c]];
const CH_OPACITY=0.9,CH_EMISSIVE=0.35;
// напрям рисунка спіралі (3 витки) має відповідати напряму обертання: для всіх чакр — як у «Чела» (витки «розкручуються» назовні).
// Множник f — знак, на який треба помножити uArms моделі в мужском режимі (виміряно: q_spin.js); у женском — ще ×(−1).
const SPIRAL_F={'Чакра_1_Исток':1,'Чакра_2_Живот':1,'Чакра_2_Живот_(спина)':1,'Чакра_3_Ярло':-1,'Чакра_3_Ярло_(спина)':-1,
 'Чакра_4_Сердце':-1,'Чакра_4_Сердце_(спина)':-1,'Чакра_5_Горло':-1,'Чакра_5_Горло_(спина)':-1,'Чакра_6_Чело':1,'Чакра_6_Чело_(спина)':1,
 'Чакра_7_Колород':-1,'Чакра_Лада':1,'Чакра_Лада_(спина)':-1,'Чакра_Леля':-1,'Чакра_Леля_(спина)':1}; /* 14.11 19:50: усі задні чакри 2–6, Лад і Леля — обертання перевернуто (Лад і Леля — удруге, як було до 18:10) */
const chakraMats=[];
function armsFor(m){return m.userData.arms0*(m.userData.spF||1)*(-(window.__ttChakraDir||1));}
function applySpiralDir(){chakraMats.forEach(m=>{const U=m.userData.spU;if(U&&U.uArms&&m.userData.arms0!==undefined)U.uArms.value=armsFor(m);});}
const SP={main:1.7,lift:0.3,add:0.03}; // основний колір = емісія×main; завитки = основний×(1+lift)+add
// 4 чакра «Сердце» (14.11): завитки = колишній основний (темно-зелений), основний колір — на тон темніший
const SP_HEART={main:1.7*0.72,lift:1/0.72-1,add:0};
function recolorChakras(scene){
 scene.getObjectByName('Group_Astral').traverse(o=>{if(!o.isMesh||!/Чакра/.test(o.name))return;const c=CHAKRA_COLORS.find(([re])=>re.test(o.name));if(!c)return;
  (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.userData.spF=SPIRAL_F[o.name]||1;chakraMats.push(m);m.color.setHex(c[1]).multiplyScalar(0.25);m.emissive.setHex(c[1]);m.emissiveIntensity=CH_EMISSIVE;
   m.roughness=1;m.metalness=0;if('envMapIntensity' in m)m.envMapIntensity=0;  // без білих відблисків — колір чистий
   m.opacity=CH_OPACITY;m.toneMapped=false;
   // спіраль: темні завитки → на півтону СВІТЛІШІ за основний колір
   const sp=/_4_/.test(o.name)?SP_HEART:SP,spKey=sp===SP?'chakraSpiralLight':'chakraSpiralHeart';
   if(!m.__light){m.__light=true;const ob=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{ob&&ob.call(m,sh,r);m.userData.spU=sh.uniforms;if(sh.uniforms.uArms){if(m.userData.arms0===undefined)m.userData.arms0=sh.uniforms.uArms.value;sh.uniforms.uArms.value=armsFor(m);}
    sh.fragmentShader=sh.fragmentShader.replace('diffuseColor.rgb*=mix(1.0,1.15,st); totalEmissiveRadiance*=mix(1.0,2.3,st);',
     'vec3 emM=totalEmissiveRadiance*SP_MAIN; totalEmissiveRadiance=mix(emM*(1.0+SP_LIFT)+vec3(SP_ADD),emM,st);'.replace(/SP_MAIN/g,sp.main.toFixed(3)).replace(/SP_LIFT/g,sp.lift.toFixed(3)).replace(/SP_ADD/g,sp.add.toFixed(3)));};
    m.customProgramCacheKey=()=>spKey;}
   m.needsUpdate=true;});
  o.renderOrder=6;});}  // малюються після аури — сірий шар аури не приглушує кольори

window.__ttChakraDir=-1; // типово мужское обертання
let camRef=null;
function setup(scene,renderer){
 if(!scene.getObjectByName('Group_Astral'))return false;
 SHOULDER.forEach(n=>{const o=scene.getObjectByName(san(n));if(!o)return;o.scale.multiplyScalar(0.8);
  o.traverse(m=>{if(m.isMesh)shoulderMeshes.push(m);});});
 reshapeChannels(scene);
 recolorChakras(scene);
 // Лад і Леля залежно від того, звідки дивиться камера: спереду — лише передні (інакше передня й задня чакри накладаються
 // зі зсувом перспективи й здаються овальними), ззаду — лише задні, збоку — сховані, згори — усі.
 if(renderer&&!renderer.__ttCamHook){renderer.__ttCamHook=true;const r0=renderer.render;renderer.render=function(s,c){if(c&&c.isPerspectiveCamera)camRef=c;return r0.apply(this,arguments);};}
 const pairMeshes=[];scene.getObjectByName('Group_Astral').traverse(m=>{if(m.isMesh&&/Чакра_[2-6]_/.test(m.name))pairMeshes.push(m);});
 const V=scene.position.constructor,dv=new V();
 const loop=()=>{if(camRef){camRef.getWorldDirection(dv);const h=Math.hypot(dv.x,dv.z),c=h>1e-6?-dv.z/h:0,top=Math.abs(dv.y)>0.85;
   shoulderMeshes.forEach(m=>{const back=/спина/.test(m.name);const vis=top||(c>0.5&&!back)||(c<-0.5&&back);
    (Array.isArray(m.material)?m.material:[m.material]).forEach(x=>{if(x.visible!==vis)x.visible=vis;});});
   // чакри 2–6: спереду видно лише передні, ззаду — лише задні; збоку та згори — обидві
   pairMeshes.forEach(m=>{const back=/спина/.test(m.name);const vis=top||Math.abs(c)<=0.5||(c>0.5&&!back)||(c<-0.5&&back);
    (Array.isArray(m.material)?m.material:[m.material]).forEach(x=>{if(x.visible!==vis)x.visible=vis;});});}
  requestAnimationFrame(loop);};loop();
 window.__ttAstralDone=true;
 return true;}

// список «Элементы» астрального тіла: окремий блок «Чакры (Стогни)» з галочкою для всіх чакр
function buildChakraBlock(){
 const box=document.querySelector('.tt3d .tt-els[data-els="astral"]');if(!box)return false;
 const labels=[...box.querySelectorAll('label.tt-el')];if(!labels.length)return false;
 if(box.querySelector('.as-block'))return true;
 const isCh=l=>/чакра/i.test(l.textContent);
 const top=labels.filter(l=>!isCh(l)),ch=labels.filter(isCh),tools=box.querySelector('.tt-tools');
 const g1=document.createElement('div');g1.className='as-grid';top.forEach(l=>g1.append(l));
 const blk=document.createElement('div');blk.className='as-block';
 const head=document.createElement('label');head.className='tt-el as-head';const mi=document.createElement('input');mi.type='checkbox';mi.checked=true;
 const ms=document.createElement('span');ms.textContent='Чакры (Стогны)';head.append(mi,ms);
 const g2=document.createElement('div');g2.className='as-grid as-sub';ch.forEach(l=>g2.append(l));
 // порядок «зверху вниз»: спершу перший стовпчик, потім другий
 g1.style.setProperty('--r',Math.ceil(top.length/2));g2.style.setProperty('--r',Math.ceil(ch.length/2));
 // напрям обертання чакр: типово МУЖСКОЕ (−1); женское — як було в моделі (1) (Лад завжди протилежно до решти)
 const dir=document.createElement('div');dir.className='as-dir';
 dir.innerHTML='<span class="as-dir-cap">Вращение чакр</span><div class="fl-seg as-seg"><button type="button" data-d="male" aria-pressed="true">Мужское</button><button type="button" data-d="female" aria-pressed="false">Женское</button></div>';
 dir.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{window.__ttChakraDir=b.dataset.d==='male'?-1:1;applySpiralDir();
  dir.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
 blk.append(head,dir,g2);
 const inputs=ch.map(l=>l.querySelector('input'));
 const sync=()=>{const on=inputs.filter(i=>i.checked).length;mi.checked=on===inputs.length;mi.indeterminate=on>0&&on<inputs.length;};
 let bulk=false;
 // одне натискання на «Чакры (Стогны)» вмикає або вимикає всі чакри разом
 mi.addEventListener('change',()=>{const v=mi.checked;bulk=true;inputs.forEach(i=>{if(i.checked!==v){i.checked=v;i.dispatchEvent(new Event('change',{bubbles:true}));}});bulk=false;sync();});
 inputs.forEach(i=>i.addEventListener('change',()=>{if(!bulk)sync();}));
 // «Отметить все / Снять все» теж оновлюють головну галочку
 if(tools)tools.addEventListener('click',()=>setTimeout(sync,0));
 box.classList.add('as-els');box.prepend(g1);g1.after(blk);if(tools)box.append(tools);
 sync();return true;}

function start(){const el=document.querySelector('.tt3d');
 const tryScene=()=>{const api=el&&el.__tt3dApi;if(api&&api.scene&&setup(api.scene,api.renderer))return;setTimeout(tryScene,300);};tryScene();
 const tryList=()=>{if(!buildChakraBlock())setTimeout(tryList,300);};tryList();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
