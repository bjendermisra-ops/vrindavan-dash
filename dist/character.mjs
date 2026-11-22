import {surface} from './materials.mjs';
import * as T from './vendor/three.module.js';
// Original authored surfaces and articulated animation; no external model dependency.
const materials={};
function material(c,metal=0){const key=c+metal;return materials[key]??=new T.MeshStandardMaterial({color:c,map:['#ffce39','#189d89','#e74555','#184aad','#f3e7c9','#ed6b9c','#f5a42a','#ffbd59'].includes(c)?surface('silk'):null,roughness:metal?.48:.93,metalness:metal});}
function add(parent,geo,color,p=[0,0,0],scale=[1,1,1],metal=0){const m=new T.Mesh(geo,material(color,metal));m.position.set(...p);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const ellipsoid=new T.SphereGeometry(1,28,20);
function oval(g,c,p,s){return add(g,ellipsoid,c,p,s)}
function profile(g,c,rings,p=[0,0,0],pleats=0){const N=40,v=[],uv=[],idx=[];for(let j=0;j<rings.length;j++){const [y,rx,rz]=rings[j];for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,r=1+pleats*Math.sin(a*12);v.push(Math.cos(a)*rx*r,y,Math.sin(a)*rz*r);uv.push(i/N,j/(rings.length-1));if(j&&i){const k=j*(N+1)+i;if(rings[1][0]>rings[0][0])idx.push(k,k-N-2,k-1,k,k-N-1,k-N-2);else idx.push(k,k-1,k-N-2,k,k-N-2,k-N-1);}}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return add(g,geo,c,p);}
function curve(g,c,points,r=.015,metal=0){return add(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.max(12,points.length*4),r,6,false),c,[0,0,0],[1,1,1],metal);}
function ring(g,c,p,r,t=.014,rot=Math.PI/2){const m=add(g,new T.TorusGeometry(r,t,7,28),c,p,[1,1,1],.65);m.rotation.x=rot;return m;}
function pivot(g,p){const v=new T.Group();v.position.set(...p);g.add(v);return v;}
export function makeHero(outfit='krishna'){
 const g=new T.Group(),body=pivot(g,[0,0,0]);const isRadha=outfit==='radha',skin=isRadha?'#ce906d':'#789cea',light=isRadha?'#d99978':'#83a4ed',gold='#ffc957',cloth=outfit==='royal'?'#184aad':outfit==='peacock'?'#189d89':outfit==='cowherd'?'#f3e7c9':isRadha?'#ed6b9c':outfit==='festival'?'#f5a42a':'#ffce39',sashColor=outfit==='peacock'?'#184aad':isRadha?'#ffbd59':'#e74555';
 // Continuous torso surface, sculpted shoulders and gently tapered waist.
 profile(body,skin,[[.96,.16,.12],[1.02,.23,.16],[1.17,.23,.16],[1.38,.30,.18],[1.55,.32,.175],[1.65,.24,.15],[1.69,.12,.10],[1.76,.10,.09]]);
 profile(body,cloth,[[.81,.25,.21],[.88,.33,.24],[1,.31,.21],[1.06,.25,.17]],undefined,.035);
 const head=pivot(body,[0,1.99,-.005]);head.scale.set(1.08,1.06,1.04);
 const face=ellipsoid.clone(),pos=face.attributes.position;
 for(let i=0;i<pos.count;i++){let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);const jaw=y<-.15?1-(-y-.15)*.24:1;pos.setXYZ(i,x*.335*jaw,y*.365,z*.302-(z<0?Math.exp(-(((y+.12)/.32)**2))*.014:0));}face.computeVertexNormals();add(head,face,skin);
 for(const side of [-1,1]){
 oval(head,skin,[side*.324,-.025,0],[.069,.10,.048]);oval(head,light,[side*.35,-.023,-.027],[.028,.057,.017]);ring(head,gold,[side*.342,-.13,-.012],.041,.009,0);
 const eye=pivot(head,[side*.127,.026,-.265]);eye.rotation.y=side*-.21;
 oval(eye,'#edf4ff',[0,0,0],[.092,.079,.013]);oval(eye,'#573126',[0,-.002,-.013],[.049,.059,.008]);oval(eye,'#111a32',[0,-.002,-.021],[.028,.043,.005]);oval(eye,'#ffffff',[-.015,.019,-.026],[.009,.012,.003]);
 curve(eye,skin,[[-.087,0,0],[-.065,.064,-.005],[0,.081,-.003],[.065,.063,-.005],[.087,0,0]],.012);curve(eye,skin,[[-.087,0,0],[-.045,-.069,-.003],[.035,-.073,-.003],[.087,0,0]],.009);
 curve(head,'#20203c',[[side*.055,.146,-.275],[side*.13,.162,-.282],[side*.205,.14,-.251]],.014);
 }
 oval(head,skin,[0,-.06,-.294],[.044,.053,.028]);curve(head,'#7b3b62',[[-.071,-.17,-.269],[0,-.185,-.291],[.071,-.17,-.269]],.011);curve(head,'#aec7ff',[[-.046,-.202,-.265],[0,-.209,-.274],[.045,-.201,-.266]],.007);
 if(!isRadha){curve(head,'#fff4d8',[[-.027,.22,-.253],[-.02,.12,-.297],[0,.095,-.306],[.02,.12,-.297],[.027,.22,-.253]],.007);curve(head,'#f2b73f',[[0,.23,-.252],[0,.151,-.291]],.006);}
 // Hair cap and sculpted spiral locks: fine tubular curls instead of a cluster of balls.
 const hairGeo=new T.SphereGeometry(1,30,18,0,Math.PI*2,0,Math.PI*.63);add(head,hairGeo,'#11162d',[0,.09,.035],[.355,.32,.32]);
 for(let j=0;j<64;j++){const a=j*2.39996,theta=.18+(j%11)/11*1.55;const cx=Math.cos(a)*Math.sin(theta)*.347,cy=.09+Math.cos(theta)*.31,cz=.035+Math.sin(a)*Math.sin(theta)*.31;const lock=pivot(head,[cx,cy,cz]);lock.lookAt(new T.Vector3(cx*2,cy*2,cz*2));const points=[];for(let k=0;k<10;k++){const b=k/9*Math.PI*1.6;points.push([Math.cos(b)*.026,Math.sin(b)*.026,.012]);}curve(lock,j%4?'#17182b':'#26273b',points,.021);}
 for(let j=0;j<5;j++)curve(head,'#17182b',[[-.22+j*.11,.235,-.215],[-.235+j*.11,.193,-.261],[-.21+j*.11,.169,-.272],[-.193+j*.11,.198,-.258]],.026);
 const plume=pivot(head,[.10,.32,.04]);plume.rotation.z=-.3;plume.visible=!isRadha&&outfit!=='cowherd';curve(plume,gold,[[0,0,0],[.02,.24,0],[0,.48,0]],.007);
 oval(plume,'#199c6d',[0,.32,0],[.095,.18,.018]);oval(plume,'#e8c759',[0,.35,-.02],[.065,.09,.01]);oval(plume,'#1874a7',[0,.35,-.031],[.046,.068,.008]);oval(plume,'#18286a',[0,.35,-.04],[.025,.041,.006]);
 for(let i=0;i<7;i++)curve(plume,'#69c07c',[[-.015,.19+i*.028,-.018],[-.073,.26+i*.018,-.018]],.003);
 if(outfit==='royal'){profile(head,gold,[[.20,.33,.28],[.34,.30,.26],[.39,.27,.24]]);for(let i=0;i<9;i++){const a=i/9*Math.PI*2;oval(head,gold,[Math.cos(a)*.28,.43+Math.max(0,-Math.sin(a))*.05,Math.sin(a)*.24],[.05,.12,.035]);}oval(head,'#2388bf',[0,.37,-.28],[.06,.075,.018]);for(let side of [-1,1])oval(body,gold,[side*.31,1.55,0],[.14,.09,.19]);profile(body,'#184aad',[[1.1,.24,.17],[1.45,.31,.19],[1.6,.25,.17]]);}
 if(outfit==='festival'){for(let i=0;i<4;i++){const wrap=ring(head,'#ffce39',[0,.18+i*.047,.025],.34-i*.025,.043);wrap.rotation.z=(i%2?1:-1)*.09;}oval(head,'#e74555',[.23,.27,-.13],[.09,.12,.05]);ring(head,gold,[.20,.27,-.2],.045,.016,0);}
 if(outfit==='peacock'){for(let i=0;i<7;i++){const x=(i-3)*.075;oval(head,gold,[x,.26+(.1-Math.abs(x)*.3),-.23],[.043,.105,.018]);}oval(head,'#189d89',[0,.31,-.255],[.038,.048,.012]);}
 if(outfit==='cowherd'){for(let i=0;i<19;i++){const a=i/18*Math.PI;oval(body,i%2?'#fff3d5':'#ffbd35',[Math.cos(a)*.255,1.59-Math.sin(a)*.32,-.21],[.035,.04,.032]);}ring(head,'#e74555',[0,.15,.02],.335,.025);}
 if(isRadha){profile(body,cloth,[[.33,.35,.29],[.45,.40,.31],[.70,.34,.26],[.96,.26,.20]],undefined,.055);profile(body,'#e86299',[[1.06,.24,.17],[1.25,.26,.18],[1.5,.32,.19],[1.61,.23,.15]]);ring(body,gold,[0,.39,0],.36,.025);oval(head,'#9e2546',[0,.15,-.285],[.015,.024,.007]);for(let i=0;i<8;i++)oval(head,'#191727',[0,-.12-i*.10,.26],[.065,.075,.048]);for(let side of [-1,1])for(let i=0;i<4;i++)oval(head,i%2?'#fff1d1':'#f39eb4',[side*.27,.19-i*.045,-.15],[.03,.035,.025]);}
 // Necklace chains and a central pendant.
 for(const depth of [.05,.14]){const points=[];for(let i=0;i<=20;i++){const a=i/20*Math.PI;points.push([Math.cos(a)*.21,1.60-Math.sin(a)*(.13+depth),-.15-Math.sin(a)*.04]);}curve(body,gold,points,.012,.6);}ring(body,gold,[0,1.31,-.204],.042,.012,0);oval(body,'#ee6154',[0,1.31,-.205],[.024,.027,.012]);
 profile(body,sashColor,[[.97,.30,.22],[1.04,.29,.205],[1.09,.25,.18]],undefined,.02);ring(body,gold,[0,1.04,0],.285,.013);oval(body,gold,[.12,1.045,-.204],[.055,.05,.022]);
 // Legs have hip/knee joints, fabric folds, ankles and bare feet.
 const limbs=[];
 for(const side of [-1,1]){
 const leg=pivot(body,[side*.153,.94,0]);profile(leg,cloth,[[0,.135,.16],[-.08,.16,.17],[-.25,.155,.16],[-.40,.115,.125],[-.44,.10,.10]],undefined,.07);
 const shin=pivot(leg,[0,-.43,0]);profile(shin,skin,[[0,.092,.092],[-.08,.098,.10],[-.23,.065,.07],[-.34,.057,.055]]);ring(shin,gold,[0,-.29,0],.067,.016);oval(shin,skin,[0,-.385,-.068],[.083,.067,.17]);
 for(let k=0;k<4;k++)oval(shin,light,[(k-1.5)*.033,-.383,-.195],[.017,.026,.032]);
 const arm=pivot(body,[side*.30,1.57,0]);profile(arm,skin,[[.03,.07,.075],[-.04,.11,.105],[-.17,.09,.085],[-.30,.065,.063]]);ring(arm,gold,[0,-.1,0],.102,.016);
 const fore=pivot(arm,[0,-.29,0]);profile(fore,skin,[[0,.064,.063],[-.08,.072,.069],[-.20,.05,.048],[-.26,.045,.045]]);ring(fore,gold,[0,-.22,0],.053,.014);oval(fore,skin,[0,-.30,-.012],[.065,.077,.046]);oval(fore,light,[-side*.053,-.29,-.025],[.025,.045,.025]);limbs.push({leg,shin,arm,fore,side});
 }
 const tails=[];for(const side of [-1,1]){const tail=pivot(body,[side*.21,1.02,.10]);const geo=new T.PlaneGeometry(.17,.63,4,12);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setZ(i,Math.sin(y*18)*.018);p.setY(i,y-.30);}geo.computeVertexNormals();const m=add(tail,geo,sashColor);m.material=material(sashColor).clone();m.material.side=T.DoubleSide;tails.push(tail);}
 const wing=new T.Group();wing.visible=false;body.add(wing);for(let side of [-1,1])for(let i=0;i<7;i++){const p=oval(wing,i%2?'#20b9b2':'#146ab3',[side*(.4+i*.14),1.5-i*.07,.20],[.13,.48,.055]);p.rotation.z=side*(.65+i*.11);oval(wing,'#e5c862',[side*(.43+i*.14),1.72-i*.09,.14],[.045,.07,.018]);}
 g.userData={body,head,limbs,tails,wing,phase:0,slideBlend:0};return g;
}
export function animateHero(g,t,{jump=0,slide=0,glide=0,glideHeight=glide?1.2:0,running=true,dt=0,speed=12}={}){
 const {body,head,limbs,tails,wing}=g.userData;
 if(running)g.userData.phase+=dt*(16+Math.min(8,(speed-12)*.6));
 const phase=g.userData.phase,air=jump>.03;const targetSlide=slide>0?1:0;g.userData.slideBlend=T.MathUtils.damp(g.userData.slideBlend??0,targetSlide,24,dt);const crouch=g.userData.slideBlend;const blend=(normal,sliding)=>T.MathUtils.lerp(normal,sliding,crouch);
 body.position.y=jump+glideHeight+blend(running&&!air&&!glide?.045+.065*(1-Math.cos(phase*2)):0,-.60);
 body.rotation.x=blend(glide?-.28:running?-.17:0,.50);
 body.position.z=-.1*crouch;body.scale.set(1,1,1);
 body.rotation.y=running&&!air?Math.sin(phase)*.055:0;
 head.rotation.x=blend(running?.1:Math.sin(t*.8)*.025,-.50);head.rotation.y=running?Math.sin(phase)*-.035:Math.sin(t*.5)*.10;
 wing.visible=glideHeight>.08;wing.scale.setScalar(Math.min(1,glideHeight/.8));
 for(const a of limbs){const p=phase+(a.side===1?Math.PI:0),s=Math.sin(p);
 a.leg.rotation.x=blend(glide?.15:air?(a.side===1?-.85:.5):running?s*.95:.02,1.05);
 // Feet-first slide: lower the hips without folding the head toward the road.
 a.shin.rotation.x=blend(glide?-.65:air?-1.1:running?-.12-Math.max(0,-s)*1.65:-.04,-.35);
 a.arm.rotation.x=blend(glide?-1.2:air?-1.15:running?-s*.8:-.08,.3);
 a.arm.rotation.z=glide?a.side*1.05:slide?a.side*.08:a.side*.12;
 a.fore.rotation.x=blend(glide?.3:running?1.1+Math.max(0,-s)*.25:.18,.8);
 }
 tails.forEach((tail,i)=>{tail.rotation.x=running?-.8+Math.sin(t*13-i)*.2:Math.sin(t*2+i)*.07;tail.rotation.z=(i?1:-1)*.2+Math.sin(t*9-i)*.13;});
}

export {profile,oval,curve,ring,pivot};
