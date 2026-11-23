// 14.11: «дыхание» чакр + вихрь искр (варіанти 7 і 2 з відео).
// Усі чакри «дихають» (плавно розширюються й стискаються, вершина конуса лишається на місці — біля Иды/Пингалы).
// Іскри летять по спіралі в площині розтруба: у чакр, що обертаються так само, як «Сердце» в мужском варианте, —
// з центру назовні (випромінюються); у чакр, що обертаються в протилежний бік, — ззовні до центру (втягуються).
// Напрям визначається з фактичного обертання (тож перемикач «Мужское / Женское» змінює й напрям іскор).
(()=>{
const BREATH_A=0.06,BREATH_T=3.2;     // амплітуда й період «дихання»
const NS=18,SPARK_T=2.4,MAXS=16*NS;    // іскор на чакру, життя іскри (с)
function nOutFor(n){return /_1_/.test(n)?[0,-1,0]:/_7_/.test(n)?[0,1,0]:/спина/.test(n)?[0,0,-1]:[0,0,1];}
function ico(sub){const t=(1+Math.sqrt(5))/2;let v=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(p=>{const l=Math.hypot(...p);return p.map(x=>x/l);});
 let f=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
 for(let s=0;s<sub;s++){const c={},nf=[];const mid=(a,b)=>{const k=a<b?a+'_'+b:b+'_'+a;if(c[k]!=null)return c[k];const p=v[a].map((x,i)=>(x+v[b][i])/2),l=Math.hypot(...p);v.push(p.map(x=>x/l));return c[k]=v.length-1;};
  f.forEach(([a,b,cc])=>{const ab=mid(a,b),bc=mid(b,cc),ca=mid(cc,a);nf.push([a,ab,ca],[b,bc,ab],[cc,ca,bc],[ab,bc,ca]);});f=nf;}
 return{v,f};}
let rnd=7;const R=()=>{rnd=(rnd*16807)%2147483647;return rnd/2147483647;};
function setup(scene){
 const grp=scene.getObjectByName('Group_Astral');if(!grp)return false;
 const ch=[];grp.children.forEach(o=>{if(/Чакра/.test(o.name)&&o.isMesh)ch.push(o);});
 if(!ch.length)return false;
 const V=scene.position.constructor,Q=ch[0].quaternion.constructor;
 grp.updateMatrixWorld(true);
 const C=ch.map(o=>{const n=nOutFor(o.name),g=o.geometry;g.computeBoundingBox();
  // вершина й розтруб: крайні точки геометрії вздовж осі назовні (у координатах групи)
  const p=g.attributes.position,v=new V();let mn=1e9,mx=-1e9,rad=0;const pts=[];
  for(let i=0;i<p.count;i+=Math.max(1,(p.count/400)|0)){v.fromBufferAttribute(p,i).applyMatrix4(o.matrix);pts.push(v.clone());const d=v.x*n[0]+v.y*n[1]+v.z*n[2];mn=Math.min(mn,d);mx=Math.max(mx,d);}
  const pos=o.position.clone(),ax=new V(n[0],n[1],n[2]);
  const pc=pos.x*n[0]+pos.y*n[1]+pos.z*n[2];
  const apex=pos.clone().addScaledVector(ax,mn-pc),mouth=pos.clone().addScaledVector(ax,mx-pc);
  pts.forEach(q=>{const d=q.clone().sub(pos);d.addScaledVector(ax,-d.dot(ax));rad=Math.max(rad,d.length());});
  const e1=new V(...(Math.abs(n[1])>0.9?[1,0,0]:[0,1,0]));e1.addScaledVector(ax,-e1.dot(ax)).normalize();const e2=new V().crossVectors(ax,e1);
  const sp=[];for(let k=0;k<NS;k++)sp.push({u0:R(),th:R()*Math.PI*2,sz:0.6+0.6*R()});
  return{o,ax,apex,mouth,rad,pos0:pos,s0:o.scale.clone(),e1,e2,q0:o.quaternion.clone(),sense:1,sp};});
 // іскри — один меш з маленьких кульок (центр і радіус у атрибуті aC), адитивне світіння
 let base=null;ch.forEach(o=>{if(!base){const m=Array.isArray(o.material)?o.material[0]:o.material;if(m&&m.isMeshStandardMaterial)base=m;}});
 const G0=ch[0].geometry,BG=G0.constructor,BA=G0.attributes.position.constructor,MESH=ch[0].constructor;
 const sp=ico(1),NV=sp.v.length,NI=sp.f.length*3;
 const pos=new Float32Array(MAXS*NV*3),idx=new Uint32Array(MAXS*NI);
 for(let b=0;b<MAXS;b++){for(let j=0;j<NV;j++)pos.set(sp.v[j],(b*NV+j)*3);for(let j=0;j<sp.f.length;j++){const f=sp.f[j];idx.set([b*NV+f[0],b*NV+f[1],b*NV+f[2]],b*NI+3*j);}}
 const geo=new BG();geo.setAttribute('position',new BA(pos,3));geo.setAttribute('normal',new BA(pos.slice(),3));
 const aC=new BA(new Float32Array(MAXS*NV*4),4);aC.setUsage(35048);geo.setAttribute('aC',aC);
 const aCol=new BA(new Float32Array(MAXS*NV*3),3);aCol.setUsage(35048);geo.setAttribute('color',aCol);
 geo.setIndex(new BA(idx,1));geo.setDrawRange(0,0);
 const m=base.clone();['map','emissiveMap','normalMap','roughnessMap','metalnessMap','aoMap','alphaMap','bumpMap','lightMap','envMap'].forEach(k=>{if(k in m)m[k]=null;});
 m.vertexColors=true;m.transparent=true;m.opacity=1;m.blending=2;m.depthWrite=false;m.depthTest=true;m.side=0;m.visible=true;m.toneMapped=false;
 m.customProgramCacheKey=()=>'ttChakraSparks';
 m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aC;').replace('#include <begin_vertex>','vec3 transformed = aC.xyz + position * aC.w;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n{ float f=clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0); gl_FragColor=vec4(vColor*(0.35+0.9*f),1.0); }');};
 m.needsUpdate=true;
 const mesh=new MESH(geo,m);mesh.frustumCulled=false;mesh.renderOrder=8;mesh.name='tt3d_chakra_sparks';grp.add(mesh);
 const colOf=o=>{const mm=Array.isArray(o.material)?o.material[0]:o.material;const c=mm.emissive||mm.color;const k=1/Math.max(c.r,c.g,c.b,1e-3);return[c.r*k,c.g*k,c.b*k];};
 const visible=o=>{let p=o;while(p){if(p.visible===false)return false;p=p.parent;}const mm=Array.isArray(o.material)?o.material[0]:o.material;return mm.visible!==false;};
 const dq=new Q(),qi=new Q(),tmp=new V();
 const t0=performance.now();
 const loop=now=>{requestAnimationFrame(loop);const t=(now-t0)/1000;
  const k=1+BREATH_A*Math.sin(2*Math.PI*t/BREATH_T);
  const Ca=aC.array,Kc=aCol.array;let nb=0;
  C.forEach(c=>{const o=c.o;
   // фактичний напрям обертання навколо осі назовні
   qi.copy(c.q0).invert();dq.copy(o.quaternion).multiply(qi);const s=dq.x*c.ax.x+dq.y*c.ax.y+dq.z*c.ax.z;
   if(Math.abs(s)>1e-5)c.sense=Math.sign(s)*Math.sign(dq.w||1);c.q0.copy(o.quaternion);
   // дихання: масштаб навколо вершини конуса
   o.scale.copy(c.s0).multiplyScalar(k);o.position.copy(c.apex).addScaledVector(tmp.copy(c.pos0).sub(c.apex),k);
   if(!visible(o)||nb+NS>MAXS)return;
   const col=colOf(o),out=c.sense>0;  // як «Сердце» в мужском — назовні
   const ctr=tmp.copy(c.apex).addScaledVector(tmp.clone().copy(c.mouth).sub(c.apex),k).addScaledVector(c.ax,0.004);
   const Rm=c.rad*k;
   c.sp.forEach(p=>{const u=(p.u0+t/SPARK_T)%1;const life=out?u:1-u;const r=Rm*(0.08+1.15*life);
    const th=p.th+c.sense*(2.6*life+t*0.6);
    const x=ctr.x+(c.e1.x*Math.cos(th)+c.e2.x*Math.sin(th))*r,y=ctr.y+(c.e1.y*Math.cos(th)+c.e2.y*Math.sin(th))*r,z=ctr.z+(c.e1.z*Math.cos(th)+c.e2.z*Math.sin(th))*r;
    const a=Math.pow(Math.sin(Math.PI*u),1.2);const rs=0.006*p.sz*(0.7+0.5*(1-life));
    for(let j=0;j<NV;j++){const q=nb*NV+j;Ca[q*4]=x;Ca[q*4+1]=y;Ca[q*4+2]=z;Ca[q*4+3]=rs;Kc[q*3]=col[0]*a;Kc[q*3+1]=col[1]*a;Kc[q*3+2]=col[2]*a;}
    nb++;});});
  aC.needsUpdate=true;aCol.needsUpdate=true;geo.setDrawRange(0,nb*NI);};
 requestAnimationFrame(loop);
 window.__ttChakraFx=true;return true;}
(function wait(){const el=document.querySelector('.tt3d'),api=el&&el.__tt3dApi;
 if(window.__ttAstralDone&&api&&api.scene&&setup(api.scene))return;setTimeout(wait,300);})();
})();
