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
export {add, profile, oval, curve, ring, pivot};
