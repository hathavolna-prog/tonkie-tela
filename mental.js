// Ментальне тіло: нова аура, опори ніг через коліна, світні вузли сили (зміни поверх моделі на сторінці)
(()=>{
const san=s=>s.replace(/\s/g,'_').replace(/[\[\]\.:\/]/g,'');
let K=null; // конструктори three.js, взяті зі сцени
function ico(sub){const t=(1+Math.sqrt(5))/2;let v=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(p=>{const l=Math.hypot(...p);return p.map(x=>x/l);});
 let f=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
 for(let s=0;s<sub;s++){const c={},nf=[];const mid=(a,b)=>{const k=a<b?a+'_'+b:b+'_'+a;if(c[k]!=null)return c[k];const p=v[a].map((x,i)=>(x+v[b][i])/2),l=Math.hypot(...p);v.push(p.map(x=>x/l));return c[k]=v.length-1;};
  f.forEach(([a,b,cc])=>{const ab=mid(a,b),bc=mid(b,cc),ca=mid(cc,a);nf.push([a,ab,ca],[b,bc,ab],[cc,ca,bc],[ab,bc,ca]);});f=nf;}
 return{v,f};}

// ---------- 1. Ментальна аура: за контуром, який намалював користувач (13.11) ----------
// широка «округла» форма: верх 2,28 м, низ одразу під стопами (−0,115), найширше ±1,065 м на висоті ~0,97 м
// межі ментальної аури (23:30: менша з боків і зверху — форма яйця; було top 1,31 → верх 2,28, rx 1,065)
const AURA={yc:1.05,top:1.155,bot:1.165,rx:0.985,pT:2.15,pB:2.2}; // 14.11: правильне «яйце» за обведенням користувача — майже еліпс, бока на відстані витягнутих рук   // верх y 2,205, низ y −0,115, найширше ±1,0 м
function reshapeAura(o){
 // нова гладка поверхня (замість старої сітки з нерівностями): суперeліпсоїд обертання, аналітичні нормалі
 const {yc,top,bot,rx,pT,pB}=AURA,rz=0.90,cz=0.0435,NU=160,NV=120;
 const P=[],N=[],I=[];
 for(let i=0;i<=NV;i++){const th=-Math.PI/2+Math.PI*i/NV,s=Math.sin(th),c=Math.cos(th);
  const up=s>=0,p=up?pT:pB,ry=up?top:bot,e=2/p;
  const rho=Math.pow(Math.max(0,c),e),t=Math.sign(s)*Math.pow(Math.abs(s),e),y=yc+ry*t;
  for(let j=0;j<=NU;j++){const f=2*Math.PI*j/NU,cf=Math.cos(f),sf=Math.sin(f);
   P.push(rx*rho*cf,y,cz+rz*rho*sf);
   // нормаль = градієнт неявної функції (ρ/r)^p + (Δy/ry)^p
   const g=Math.pow(rho,p-1),h=Math.pow(Math.abs(t),p-1)*Math.sign(t);
   let nx=g*cf/rx,ny=h/ry,nz=g*sf/rz;const l=Math.hypot(nx,ny,nz)||1;N.push(nx/l,ny/l,nz/l);}}
 for(let i=0;i<NV;i++)for(let j=0;j<NU;j++){const a=i*(NU+1)+j,b=a+1,c=a+NU+1,d=c+1;I.push(a,b,c,b,d,c);}
 o.traverse(m=>{if(!m.isMesh)return;const g=new K.BG();
  g.setAttribute('position',new K.BA(new Float32Array(P),3));g.setAttribute('normal',new K.BA(new Float32Array(N),3));
  g.setIndex(new K.BA(new Uint32Array(I),1));g.computeBoundingSphere&&g.computeBoundingSphere();g.computeBoundingBox&&g.computeBoundingBox();m.geometry=g;});
}
// стояк — від нижньої до верхньої межі ментальної аури
// +EXT: у перспективі камери межа аури (силует) видна вище/нижче за саму точку поверхні на осі — подовжуємо, щоб стояк візуально доходив до межі
const STOYAK_EXT_TOP=0.012,STOYAK_EXT_BOT=0.05;
function trimStoyak(o){const y0=AURA.yc-AURA.bot-STOYAK_EXT_BOT,y1=AURA.yc+AURA.top+STOYAK_EXT_TOP;
 o.traverse(m=>{if(!m.isMesh)return;const pa=m.geometry.getAttribute('position');let a=1e9,b=-1e9;
 for(let i=0;i<pa.count;i++){const y=pa.getY(i);a=Math.min(a,y);b=Math.max(b,y);}
 for(let i=0;i<pa.count;i++)pa.setY(i,y0+(pa.getY(i)-a)/(b-a)*(y1-y0));
 pa.needsUpdate=true;m.geometry.computeBoundingSphere&&m.geometry.computeBoundingSphere();m.geometry.computeBoundingBox&&m.geometry.computeBoundingBox();});}

// ---------- 2. Опори ніг: від ядра сили прямо до колін, від колін — до стоп; плавний вигин у колінах ----------
function polyline(pts,fillet){ // ламана з округленням кутів
 const out=[pts[0]];
 for(let i=1;i<pts.length-1;i++){const p=pts[i],a=pts[i-1],b=pts[i+1];
  const d1=p.map((x,j)=>x-a[j]),d2=b.map((x,j)=>x-p[j]),l1=Math.hypot(...d1),l2=Math.hypot(...d2);
  const r=Math.min(fillet,l1*0.4,l2*0.4),A=p.map((x,j)=>x-d1[j]/l1*r),B=p.map((x,j)=>x+d2[j]/l2*r);
  out.push(A);for(let t=1;t<16;t++){const u=t/16;out.push(A.map((x,j)=>(1-u)*(1-u)*x+2*u*(1-u)*p[j]+u*u*B[j]));}out.push(B);}
 out.push(pts[pts.length-1]);
 // рівномірно перерозподілити
 const c=[0];for(let i=1;i<out.length;i++)c.push(c[i-1]+Math.hypot(...out[i].map((x,j)=>x-out[i-1][j])));
 const L=c[c.length-1],n=Math.max(8,Math.round(L/0.01)),res=[];
 for(let s=0,i=0;s<=n;s++){const d=L*s/n;while(i<c.length-2&&c[i+1]<d)i++;const t=(d-c[i])/((c[i+1]-c[i])||1);res.push(out[i].map((x,j)=>x+(out[i+1][j]-x)*t));}
 return res;}
function tube(path,r,seg,P,N,I){ // додає трубку в масиви P,N,I
 const base=P.length/3;let prevN=null;
 for(let i=0;i<path.length;i++){
  const a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)];let T=b.map((x,j)=>x-a[j]);const tl=Math.hypot(...T);T=T.map(x=>x/tl);
  let n0=prevN||(Math.abs(T[1])<0.9?[0,1,0]:[1,0,0]);const dt=n0[0]*T[0]+n0[1]*T[1]+n0[2]*T[2];
  let Nn=n0.map((x,j)=>x-dt*T[j]);const nl=Math.hypot(...Nn);Nn=Nn.map(x=>x/nl);prevN=Nn;
  const B=[T[1]*Nn[2]-T[2]*Nn[1],T[2]*Nn[0]-T[0]*Nn[2],T[0]*Nn[1]-T[1]*Nn[0]];
  for(let k=0;k<seg;k++){const an=k/seg*Math.PI*2,c=Math.cos(an),s=Math.sin(an);const d=[0,1,2].map(j=>c*Nn[j]+s*B[j]);
   P.push(path[i][0]+r*d[0],path[i][1]+r*d[1],path[i][2]+r*d[2]);N.push(...d);}}
 for(let i=0;i<path.length-1;i++)for(let k=0;k<seg;k++){const a=base+i*seg+k,b=base+i*seg+(k+1)%seg,c=a+seg,d=b+seg;I.push(a,b,c,b,d,c);}
 // заглушки на кінцях
 [[0,1],[path.length-1,-1]].forEach(([i,sg])=>{const ci=P.length/3;P.push(...path[i]);const t=path[i].map((x,j)=>x-path[i+(sg>0?1:-1)][j]);const l=Math.hypot(...t);N.push(...t.map(x=>x/l));
  for(let k=0;k<seg;k++){const a=base+i*seg+k,b=base+i*seg+(k+1)%seg;if(sg>0)I.push(ci,a,b);else I.push(ci,b,a);}});
}
function rebuildLegSupports(o){
 const m=o.isMesh?o:null;if(!m)return;const g=m.geometry,pa=g.getAttribute('position'),na=g.getAttribute('normal'),idx=g.index;
 const P=[],N=[],I=[],map=new Map();
 const keep=v=>pa.getY(v)<0.095; // частину на стопах лишаємо як є
 for(let t=0;t<idx.count;t+=3){const a=idx.getX(t),b=idx.getX(t+1),c=idx.getX(t+2);if(!(keep(a)&&keep(b)&&keep(c)))continue;
  [a,b,c].forEach(v=>{if(!map.has(v)){map.set(v,P.length/3);P.push(pa.getX(v),pa.getY(v),pa.getZ(v));N.push(na?na.getX(v):0,na?na.getY(v):1,na?na.getZ(v):0);}I.push(map.get(v));});}
 const core=[0,1.0628,0.0435],r=0.0095;
 for(const sx of [1,-1]){const knee=[0.165*sx,0.49,0.02],ankle=[0.203*sx,0.093,0.02];
  tube(polyline([core,knee,ankle],0.07),r,14,P,N,I);}
 const ng=new K.BG();ng.setAttribute('position',new K.BA(new Float32Array(P),3));ng.setAttribute('normal',new K.BA(new Float32Array(N),3));
 ng.setIndex(new K.BA(new Uint32Array(I),1));ng.computeBoundingSphere&&ng.computeBoundingSphere();m.geometry=ng;}

// ---------- 3. Вузли сили: світний об'єм кольору вузла + дуже яскрава точка на осі ----------
// прозорість елементів ментального тіла — щоб крізь них було видно фізичне тіло
const NODE_A='0.37',SPHERE_A=0.55,SAT=1.2; // прозорість −15 % (23:20): сфери α≈0,22, вузли α 0,37 // SAT — насиченість кольору Тями, Снаги, Живи й вузлів (+20 %)
function glowMat(base,col,kind){const m=base.clone();['map','emissiveMap','normalMap','roughnessMap','metalnessMap','aoMap','alphaMap','bumpMap','lightMap','envMap'].forEach(k=>{if(k in m)m[k]=null;});
 m.transparent=true;m.opacity=1;m.blending=2;m.depthWrite=false;m.depthTest=true;m.side=0;m.visible=true;m.vertexColors=false;
 const c=col.map(x=>x.toFixed(3)).join(',');m.customProgramCacheKey=()=>'mental_'+kind+'_'+c;
 const body=kind==='body'
  ?'{ float f=clamp(abs(dot(normalize(normal),normalize(vViewPosition))),0.0,1.0); vec3 c=vec3('+c+'); gl_FragColor=vec4(c*pow(f,1.6)*0.62,1.0); }' /* 14.11: м'яке світіння у формі шайби — яскраве в середині, згасає до країв, без чіткої межі */
  :kind==='core'
  ?'{ float f=clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0); gl_FragColor=vec4(vec3('+c+')*(0.35+0.55*f),1.0); }'
  :kind==='fill'
  ?'{ float f=clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0); gl_FragColor=vec4(vec3('+c+')*pow(f,1.2)*0.75,1.0); }'
  :'{ float f=clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0); gl_FragColor=vec4(vec3('+c+')*pow(f,2.5)*0.16,1.0); }';
 m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n'+body);};
 m.needsUpdate=true;return m;}
function sphereGeo(sub){const sp=ico(sub),P=new Float32Array(sp.v.length*3);sp.v.forEach((p,i)=>P.set(p,i*3));
 const I=new Uint32Array(sp.f.length*3);sp.f.forEach((f,i)=>I.set(f,i*3));const g=new K.BG();g.setAttribute('position',new K.BA(P,3));g.setAttribute('normal',new K.BA(P.slice(),3));g.setIndex(new K.BA(I,1));g.computeBoundingSphere&&g.computeBoundingSphere();return g;}
function pillGeo(R,H,e){ // «таблетка»: суперелліпсоїд, круглий у плані, з пласкими боками й заокругленими краями
 const nu=48,nv=24,P=[],I=[];const sp=(x,e)=>Math.sign(x)*Math.pow(Math.abs(x),e);
 for(let i=0;i<=nv;i++){const t=-Math.PI/2+Math.PI*i/nv,ct=sp(Math.cos(t),e),st=sp(Math.sin(t),e);
  for(let j=0;j<=nu;j++){const f=2*Math.PI*j/nu;P.push(R*ct*Math.cos(f),H*st,R*ct*Math.sin(f));}}
 for(let i=0;i<nv;i++)for(let j=0;j<nu;j++){const a=i*(nu+1)+j,b=a+1,c=a+nu+1,d=c+1;I.push(a,c,b,b,c,d);}
 const g=new K.BG();g.setAttribute('position',new K.BA(new Float32Array(P),3));g.setIndex(new K.BA(new Uint32Array(I),1));g.computeVertexNormals();g.computeBoundingSphere&&g.computeBoundingSphere();return g;}
const nodeObjs=[];
function glowNodes(scene,base){const AXIS_Z=0.044,geo=sphereGeo(3);
 ['Колород','Славь','Правь','Зарод'].forEach(n=>{const o=scene.getObjectByName(san('Узел силы — '+n));if(!o)return;
  let col=[1,1,1];o.traverse(m=>{if(m.isMesh&&m.material){const mc=m.material.color;if(mc)col=[mc.r,mc.g,mc.b];m.material=m.material.clone();m.material.visible=false;}});
  const mx=Math.max(...col);col=col.map(x=>x/mx); // насичений колір
  {const l=0.2126*col[0]+0.7152*col[1]+0.0722*col[2];col=col.map(x=>Math.min(1,Math.max(0,l+(x-l)*SAT)));} // +20 % насиченості
  const s=o.scale,inv=[1/s.x,1/s.y,1/s.z];
  // світіння у формі шайби без чіткої межі (14.11); навколо — ширший м'який ореол
  const pill=pillGeo(0.27,0.07,0.6),pillH=pillGeo(0.27,0.07,0.8);
  const body=new K.MESH(pill,glowMat(base,col,'body'));body.scale.set(inv[0],inv[1],inv[2]);body.renderOrder=6;body.name=o.name+'_body';o.add(body);
  const halo=new K.MESH(pillH,glowMat(base,col,'halo'));halo.scale.set(1.18*inv[0],1.9*inv[1],1.18*inv[2]);halo.renderOrder=7;halo.name=o.name+'_halo';o.add(halo);
  const add=(kind,rx,ry,off)=>{const me=new K.MESH(geo,glowMat(base,col,kind));me.scale.set(rx*inv[0],ry*inv[1],rx*inv[2]);
   if(off)me.position.set(0,0,off*inv[2]);me.frustumCulled=false;me.renderOrder=10;me.name=o.name+'_glow_'+kind;o.add(me);};
  nodeObjs.push(o);   // (14.11: точки на стояку всередині вузлів прибрано)
 });}

// ---------- 3б. Тяма, Снага, Жива — значно прозоріші ----------
function fadeSpheres(scene){['Тяма','Снага','Жива'].forEach(n=>{const o=scene.getObjectByName(san(n));if(!o)return;
 o.traverse(m=>{if(!m.isMesh)return;const mat=m.material;if(mat.__faded)return;mat.__faded=true;const ob=mat.onBeforeCompile;
  mat.onBeforeCompile=(sh,r)=>{ob&&ob.call(mat,sh,r);const fs=sh.fragmentShader,k=fs.lastIndexOf('}');sh.fragmentShader=fs.slice(0,k)+' gl_FragColor.rgb=min(gl_FragColor.rgb,vec3(0.9)); { float l=dot(gl_FragColor.rgb,vec3(0.2126,0.7152,0.0722)); gl_FragColor.rgb=clamp(mix(vec3(l),gl_FragColor.rgb,'+SAT.toFixed(2)+'),0.0,1.0); } gl_FragColor.a*='+SPHERE_A.toFixed(2)+';\n'+fs.slice(k);};
  mat.side=0; // лише передня поверхня — без подвійного шару кольору
  mat.customProgramCacheKey=()=>'mentalFade_'+n;mat.needsUpdate=true;});});}

// ---------- 4. Опори (рук, ніг) і стояк — чорні; стояк чітко видно крізь тіло ----------
function blackSupports(scene){['Ментальные опоры','Опоры ног','Опоры рук','Mental_Joint_Shoulder'].forEach(n=>{const o=scene.getObjectByName(san(n));if(!o)return;
 o.traverse(m=>{if(!m.isMesh)return;const mat=m.material.clone();mat.color&&mat.color.setRGB(0.012,0.012,0.016);mat.emissive&&mat.emissive.setRGB(0,0,0);
  mat.metalness=0;mat.roughness=0.6;mat.opacity=1;mat.transparent=true;mat.depthWrite=false;mat.depthTest=true;mat.needsUpdate=true;m.material=mat;
  m.renderOrder=9; /* малюється після напівпрозорого тіла — не тоне в ньому */});});}

// вузли завжди повернуті до глядача ребром (як жовтий на рівні камери) — однакові на виді спереду, без «об'ємного» нахилу
function faceNodes(renderer){let cam=null;
 if(renderer){const r0=renderer.render;renderer.render=function(s,c){if(c&&c.isPerspectiveCamera)cam=c;return r0.apply(this,arguments);};}
 if(!nodeObjs.length)return;const V=nodeObjs[0].position.constructor,Q=nodeObjs[0].quaternion.constructor;
 const q0=nodeObjs.map(o=>o.quaternion.clone()),a0=q0.map(q=>new V(0,1,0).applyQuaternion(q)),cp=new V(),wp=new V(),v=new V(),n=new V(),up=new V(0,1,0),qd=new Q(),qt=new Q();
 // ребром до глядача — лише у видах «Спереди / Сбоку / Сзади» (і під час «Вращения»); коли користувач сам крутить мишею/пальцем
 // або колесиком — вузли повертаються у свою справжню форму («шайба»)
 let faceOn=true;const cv=document.querySelector('.tt3d canvas');
 if(cv){let down=false,sx=0,sy=0;cv.addEventListener('pointerdown',e=>{down=true;sx=e.clientX;sy=e.clientY;});
  window.addEventListener('pointerup',()=>{down=false;});
  cv.addEventListener('pointermove',e=>{if(down&&Math.hypot(e.clientX-sx,e.clientY-sy)>4)faceOn=false;});
  cv.addEventListener('wheel',()=>{faceOn=false;},{passive:true});}
 document.querySelectorAll('.tt3d [data-view]').forEach(b=>b.addEventListener('click',()=>{faceOn=b.dataset.view!=='top';}));
 const sp=document.querySelector('.tt3d .tt-spin');if(sp)sp.addEventListener('click',()=>{if(sp.getAttribute('aria-pressed')==='true')faceOn=true;});
 const loop=()=>{if(cam){cam.getWorldPosition(cp);nodeObjs.forEach((o,i)=>{
   if(faceOn){o.getWorldPosition(wp);v.subVectors(wp,cp).normalize();n.copy(up).addScaledVector(v,-up.dot(v)).normalize();qd.setFromUnitVectors(a0[i],n);qt.copy(qd).multiply(q0[i]);}
   else qt.copy(q0[i]);
   o.quaternion.slerp(qt,0.18);});}   // плавний перехід
  requestAnimationFrame(loop);};loop();}

function setup(scene,renderer){
 let base=null,some=null;scene.traverse(o=>{if(o.isMesh){some=some||o;const m=Array.isArray(o.material)?o.material[0]:o.material;if(!base&&m&&m.isMeshStandardMaterial)base=m;}});
 if(!some||!base||!scene.getObjectByName('Group_Mental'))return false;
 K={BG:some.geometry.constructor,BA:some.geometry.getAttribute('position').constructor,MESH:some.constructor};
 const aura=scene.getObjectByName(san('Ментальная аура'));if(aura)reshapeAura(aura);
 const st=scene.getObjectByName(san('Ментальные опоры'));if(st)trimStoyak(st);
 // ядро сили — розміром із кулак (Ø ≈ 11 см, було 9 см)
 const core=scene.getObjectByName(san('Центр равновесия'));if(core)core.scale.multiplyScalar(11/9);
 const legs=scene.getObjectByName(san('Опоры ног'));if(legs)legs.traverse(m=>{if(m.isMesh)rebuildLegSupports(m);});
 glowNodes(scene,base);
 faceNodes(renderer);
 fadeSpheres(scene);
 blackSupports(scene);
 window.__ttMentalDone=true;
 return true;}
function start(){const el=document.querySelector('.tt3d');const tryIt=()=>{const api=el&&el.__tt3dApi;if(api&&api.scene&&setup(api.scene,api.renderer))return;setTimeout(tryIt,300);};tryIt();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
