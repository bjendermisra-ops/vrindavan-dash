import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {clone} from './vendor/SkeletonUtils.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {profile, oval, curve, ring, pivot} from './figure-parts.mjs';

async function loadFigure(name) {
 const url = new URL('./assets/' + name + '.glb', import.meta.url);
 let bytes;
 if (url.protocol === 'file:' && typeof document === 'undefined') {
  bytes = new Uint8Array(await (await import('node:fs/promises')).readFile(url)).buffer;
 } else {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not load ' + name + ' model');
  bytes = await response.arrayBuffer();
 }
 return (await new GLTFLoader().parseAsync(bytes, '')).scene;
}

const [krishna, radha] = await Promise.all([loadFigure('krishna'), loadFigure('radha')]);
const gold = '#ca9a44';
const silks = {
 krishna: '#e4ae36', festival: '#df792e', peacock: '#207a70',
 cowherd: '#e9dfbc', radha: '#b84b71', royal: '#304c89'
};

// Open-ended, tapered hair ribbons with a rounded cross-section and a side part.
function hair(head, female) {
 const verts=[], indices=[], shades=[];
 const color = new T.Color();
 for (let lock=0;lock<48;lock++) {
  const phi = lock / 48 * Math.PI * 2;
  const front = Math.max(0,-Math.sin(phi));
  const end = 2.25 - front*1.22 + .18*Math.sin(phi*4+.4);
  for(let j=0;j<=16;j++) {
   const u=j/16, theta=.06+u*end, a=phi+.63*(1-u)+.13*Math.sin(u*10+phi*3)*u;
   const radius=.022*Math.pow(Math.sin(Math.PI*(.02+.96*u)),.46);
   const point=[(.129+.021*u*u)*Math.sin(theta)*Math.cos(a),2.23+.166*Math.cos(theta)-.158*u*u*(1-front),-.062+(.16+.032*u*u)*Math.sin(theta)*Math.sin(a)];
   for(let k=0;k<8;k++){
    const angle=k*Math.PI/4, sweep=radius*Math.cos(angle), lift=radius*.47*Math.sin(angle);
    verts.push(point[0]-sweep*Math.sin(a)+lift*Math.cos(a),point[1]+lift*.45,point[2]+sweep*Math.cos(a)+lift*Math.sin(a));
    color.set(lock%5===0?'#372b29':'#231e23').multiplyScalar(.76+.23*(1+Math.sin(angle)));
    shades.push(color.r,color.g,color.b);
    if(j){const p=(lock*17+j)*8+k, next=(lock*17+j)*8+(k+1)%8;indices.push(p,next,p-8,next,next-8,p-8);}
   }
  }
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('color',new T.Float32BufferAttribute(shades,3));geo.setIndex(indices);geo.computeVertexNormals();
 const locks=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.79}));head.add(locks);
 if(female) for(let i=0;i<8;i++){const t=i/8;oval(head,'#251d20',[.012*Math.sin(i*2),2.14-t*.45,.075],[.05*(1-t*.65),.057,.038]);}
}

function face(head,female) {
 const y=female?2.204:2.210;
 for(const side of [-1,1]){
  curve(head,'#31262a',[[side*.020,y+.026,-.211],[side*.044,y+.029,-.206],[side*.062,y+.026,-.197],[side*.075,y+.021,-.183]],.0032);
  ring(head,gold,[side*.111,2.142,-.054],.015,.0028,0);
 }
 if(female) oval(head,'#982e39',[0,2.248,-.208],[.005,.007,.0025]);
 else {
  curve(head,'#f1e9cf',[[-.011,2.274,-.206],[-.008,2.25,-.211],[0,2.236,-.213],[.008,2.25,-.211],[.011,2.274,-.206]],.0026);
  curve(head,gold,[[0,2.276,-.207],[0,2.254,-.213]],.002);
 }
}

function headwear(head,outfit) {
 const band=ring(head,gold,[0,2.296,-.067],.11,.005);
 band.scale.y=1.26;
 if(outfit==='festival'){
  for(let i=0;i<4;i++){const wrap=oval(head,i%2?'#cb6228':'#eb9842',[0,2.31+i*.016,-.066],[.146-i*.004,.042,.159-i*.003]);wrap.rotation.z=(i%2?1:-1)*.12;}
 }
 if(['royal','peacock'].includes(outfit)){
  profile(head,gold,[[0,.13,.151],[.035,.124,.144],[.065,.108,.135]],[0,2.286,-.067]);
  for(let i=0;i<11;i++){const a=(i/10)*Math.PI;oval(head,gold,[.122*Math.cos(a),2.35+.022*Math.sin(a),-.065-.14*Math.sin(a)],[.017,.036,.010]);}
  oval(head,outfit==='royal'?'#375497':'#207667',[0,2.344,-.216],[.018,.027,.008]);
 }
 if(outfit==='cowherd'||outfit==='radha')return;
 const plume=pivot(head,[.071,2.326,-.077]);plume.rotation.z=-.51;plume.scale.set(1.6,1.18,1);
 curve(plume,gold,[[0,0,0],[.008,.11,0],[.014,.228,0]],.0024);
 for(let i=0;i<15;i++){const u=i/14,w=.038*Math.sin(Math.PI*(.08+.91*u));for(const s of [-1,1])curve(plume,i%3?'#458569':'#829256',[[.007,.052+u*.134,0],[s*w,.079+u*.128,0],[s*w*.88,.094+u*.128,0]],.002);}
 oval(plume,'#ad9a54',[.009,.16,-.004],[.025,.038,.005]);oval(plume,'#257d84',[.009,.16,-.009],[.017,.027,.003]);oval(plume,'#263e68',[.009,.16,-.012],[.010,.017,.002]);
}

// Bind pleated panels to the same hip and knee bones as the figure.
function drape(figure, rows, side, color, skirt=false) {
 const verts=[],indices=[],joints=[],weights=[],shades=[];
 const bones=figure.skeleton.bones, boneIndex=name=>bones.findIndex(b=>b.name===name);
 const palette=new T.Color(color), border=new T.Color('#cb9c54');
 for(let j=0;j<rows.length;j++){
  const [y,cx,rx,rz,cz]=rows[j];
  for(let i=0;i<=64;i++){
   const a=i/64*Math.PI*2,fold=Math.cos(a*(skirt?22:12)+y*4+1.7*Math.sin(a*2+y*3)), ripple=1+fold*.048;
   const x=cx*side+Math.cos(a)*rx*ripple;
   verts.push(x,y,cz+Math.sin(a)*rz*ripple);
   const sideBone=side||Math.sign(x), suffix=sideBone<0?'l':'r';
   const hip=T.MathUtils.smoothstep(y,1.10,1.44), shin=1-T.MathUtils.smoothstep(y,.53,.81);
   const opposite=suffix==='l'?'r':'l', cross=side?0:.5*(1-T.MathUtils.smoothstep(Math.abs(x),0,.12));
   joints.push(boneIndex('Body'),boneIndex('Leg'+suffix),boneIndex('Shin'+suffix),boneIndex((shin>.5?'Shin':'Leg')+opposite));
   weights.push(hip,(1-hip)*(1-shin)*(1-cross),(1-hip)*shin*(1-cross),(1-hip)*cross);
   const c=(j===rows.length-2?border:palette).clone().multiplyScalar(.87+.12*fold);shades.push(c.r,c.g,c.b);
   if(i&&j){const k=j*65+i;indices.push(k,k-66,k-1,k,k-65,k-66);}
  }
 }
 const geo=new T.BufferGeometry();
 for(const [name,values] of [['position',verts],['color',shades]])geo.setAttribute(name,new T.Float32BufferAttribute(values,3));
 geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(joints,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));geo.setIndex(indices);geo.computeVertexNormals();
 const cloth=new T.SkinnedMesh(geo,new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.78}));
 figure.parent.add(cloth);cloth.bind(figure.skeleton,figure.bindMatrix);cloth.frustumCulled=false;cloth.castShadow=true;cloth.receiveShadow=true;
}

// A single folded uttariya runs from the back of the belt over the shoulder.
function shoulderDrape(body,color) {
 const path=new T.CatmullRomCurve3([
  [-.16,1.41,.137],[-.135,1.64,.151],[.06,1.88,.145],[.16,1.991,.014],
  [.16,1.99,-.084],[.12,1.888,-.191],[-.012,1.755,-.235],
  [-.105,1.61,-.216],[-.171,1.466,-.196],[-.155,1.37,-.208]
 ].map(p=>new T.Vector3(...p)));
 const points=[],colors=[],indices=[];
 const silk=new T.Color(color),border=new T.Color('#d3a950');
 for(let j=0;j<=40;j++){
  const t=j/40,p=path.getPoint(t);
  for(let i=0;i<=12;i++){
   const u=i/12,dx=(u-.5)*.133, fold=.006*Math.cos(u*Math.PI*6+t*2);
   points.push(p.x+dx,p.y-dx*.32+fold*.3,p.z+fold*(t<.35?1:-1));
   const c=(i===1||i===11?border:silk).clone().multiplyScalar(.88+.11*Math.cos(u*Math.PI*6));colors.push(c.r,c.g,c.b);
   if(i&&j){const k=j*13+i;indices.push(k,k-14,k-1,k,k-13,k-14);}
  }
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
 const fabric=new T.Mesh(geometry,new T.MeshStandardMaterial({side:T.DoubleSide,vertexColors:true,roughness:.75}));fabric.castShadow=true;body.add(fabric);
}

function costume(model,body,limbs,outfit) {
 const female=outfit==='radha', cloth=silks[outfit], sash=female?'#cc9a54':'#a53e39', figure=model.getObjectByName('Figure');
 if(female){
  drape(figure,[[1.46,0,.217,.202,-.04],[1.33,0,.257,.223,-.03],[1.14,0,.295,.245,-.03],[.87,0,.323,.252,-.038],[.57,0,.367,.26,-.04],[.34,0,.378,.275,-.04],[.315,0,.378,.275,-.04]],0,cloth,true);
 }else{
  for(const side of [-1,1])drape(figure,[[1.32,.133,.144,.176,-.017],[1.21,.145,.163,.194,-.018],[1.08,.161,.18,.197,-.032],[.89,.182,.174,.178,-.041],[.68,.202,.14,.142,-.033],[.53,.225,.112,.126,-.011],[.43,.234,.095,.104,.004],[.405,.235,.096,.105,.004]],side,cloth);
  drape(figure,[[1.46,0,.202,.186,-.047],[1.39,0,.229,.199,-.034],[1.29,0,.254,.215,-.028],[1.18,0,.271,.215,-.026],[1.12,0,.273,.211,-.027],[1.105,0,.273,.211,-.027]],0,cloth,true);
 }
 profile(body,sash,[[1.377,.246,.211],[1.407,.244,.211],[1.453,.218,.202],[1.477,.195,.183]],[0,0,-.044],.018);
 const tails=[];
 for(const side of [-1,1]){
  const tail=pivot(body,[side*.154,1.42,-.167]);tail.rotation.z=side*.21;
  profile(tail,sash,[[0,.052,.021],[-.13,.062,.023],[-.28,.047,.020],[-.435,.042,.017]],undefined,.10);tails.push(tail);
 }
 if(!female){
  shoulderDrape(body,outfit==='peacock'?'#254d77':outfit==='cowherd'?'#ba7650':sash);
  const flute=pivot(body,[.19,1.45,-.149]);flute.rotation.z=-.43;
  curve(flute,'#966331',[[0,-.14,0],[0,.21,0]],.014);
  for(const y of [-.12,.16,.194])ring(flute,gold,[0,y,0],.014,.0025);
  for(let i=0;i<5;i++)oval(flute,'#4a3727',[0,-.06+i*.039,-.013],[.003,.004,.0015]);
 }
 const necklace=[[ -.108,1.963,-.059],[-.115,1.895,-.132],[-.087,1.847,-.16],[0,1.785,-.196],[.087,1.847,-.16],[.115,1.895,-.132],[.108,1.963,-.059]];
 curve(body,gold,necklace,.005);oval(body,gold,[0,1.771,-.199],[.016,.022,.005]);
 if(outfit==='cowherd'||female){
  const path=new T.CatmullRomCurve3(necklace.map(p=>new T.Vector3(...p)));
  for(let i=0;i<=22;i++){const p=path.getPoint(i/22);oval(body,i%3?'#eee1c4':'#d6914a',p.toArray(),[.015,.016,.013]);}
 }
 for(const limb of limbs){
  const band=ring(limb.arm,gold,[limb.side*.049,-.055,0],.069,.006);
  band.rotation.z=limb.side*.70;
 }
 return tails;
}

// Hair strands, feather details and jewellery move together with the head.
function batchOrnaments(group) {
 group.updateWorldMatrix(true,true);
 const local=new T.Matrix4().copy(group.matrixWorld).invert(), batches=new Map();
 group.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const {metalness,roughness,side}=mesh.material,key=[metalness,roughness,side].join('/');
  if(!batches.has(key))batches.set(key,{pieces:[],material:new T.MeshStandardMaterial({metalness,roughness,side,vertexColors:true})});
  const geo=mesh.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(local,mesh.matrixWorld));
  geo.deleteAttribute('uv');
  if(!geo.attributes.color){
   const colors=new Float32Array(geo.attributes.position.count*3);
   for(let i=0;i<colors.length;i+=3)mesh.material.color.toArray(colors,i);
   geo.setAttribute('color',new T.BufferAttribute(colors,3));
  }
  batches.get(key).pieces.push(geo);
 });
 group.clear();
 for(const {pieces,material} of batches.values()){
  const mesh=new T.Mesh(mergeGeometries(pieces),material);
  mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
 }
}

export function makeHero(outfit='krishna'){
 const female=outfit==='radha', g=new T.Group(), body=pivot(g,[0,0,0]);
 const model=clone(female?radha:krishna);body.add(model);
 const figure=model.getObjectByName('Figure');
 figure.castShadow=true;figure.receiveShadow=true;figure.frustumCulled=false;
 if(!female) {
  figure.material=figure.material.clone();
  figure.material.color.set('#c3d2ff');
 }
 const head=model.getObjectByName('Head');
 const ornaments=pivot(head,head.position.clone().negate().toArray());
 hair(ornaments,female);face(ornaments,female);headwear(ornaments,outfit);batchOrnaments(ornaments);
 const limbs=[-1,1].map(side=>{
  const suffix=side<0?'l':'r', joint=name=>model.getObjectByName(name+suffix);
  return {side,leg:joint('Leg'),shin:joint('Shin'),arm:joint('Arm'),fore:joint('Fore')};
 });
 const tails=costume(model,body,limbs,outfit);
 const wing=new T.Group();body.add(wing);wing.visible=false;
 for(const s of [-1,1])for(let i=0;i<7;i++){
  const feather=oval(wing,i%2?'#308d83':'#317085',[s*(.28+i*.12),1.78-i*.057,.14],[.095,.34,.026]);feather.rotation.z=s*(.62+i*.10);
 }
 batchOrnaments(wing);
 g.userData={body,head,limbs,tails,wing,phase:0,slideBlend:0};
 animateHero(g,0,{running:false});return g;
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
 a.arm.rotation.z=a.side*(glide?.55:-.53);
 a.fore.rotation.x=blend(glide?.15:running?.57+Math.max(0,-s)*.18:.02,.48);
 }
 tails.forEach((tail,i)=>{tail.rotation.x=running?-.8+Math.sin(t*13-i)*.2:Math.sin(t*2+i)*.07;tail.rotation.z=(i?1:-1)*.2+Math.sin(t*9-i)*.13;});
}
