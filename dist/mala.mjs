import {Vector3} from './vendor/three.module.js';

// A closed cord with one pinned bead in the palm. Its segment lengths come
// from the necklace as worn. Physics is stepped at 120 Hz at every render rate.
export class MalaCord {
 constructor(count){
  this.points=Array.from({length:count},()=>new Vector3());
  this.previous=this.points.map(()=>new Vector3());
  this.rest=this.points.map((_,i)=>{
   const a=i/count*Math.PI*2;
   return new Vector3(.173*Math.sin(a),1.885-.089*Math.cos(a),-.065-.155*Math.cos(a));
  });
  this.lengths=this.rest.map((v,i)=>v.distanceTo(this.rest[(i+1)%count]));
  this.delta=new Vector3();this.velocity=new Vector3();this.anchor=new Vector3();
  this.remainder=0;this.ready=false;
 }
 wear(body){
  body.updateWorldMatrix(true,false);
  this.rest.forEach((v,i)=>{
   this.points[i].copy(v).applyMatrix4(body.matrixWorld);
   this.previous[i].copy(this.points[i]);
  });
  this.anchor.copy(this.points[0]);this.ready=true;this.remainder=0;
 }
 carry(target,dt){
  if(!this.ready||this.anchor.distanceToSquared(target)>4){
   this.points.forEach((p,i)=>{
    const a=i/this.points.length*2*Math.PI;
    p.copy(target);p.x+=.13*Math.sin(a);p.y-=.13*(1-Math.cos(a));
    this.previous[i].copy(p);
   });
   this.anchor.copy(target);this.remainder=0;this.ready=true;
  }
  const step=1/120;
  this.remainder+=Math.min(dt,.10);
  const steps=Math.floor(this.remainder/step);
  for(let n=0;n<steps;n++){
   this.anchor.lerp(target,1/(steps-n));
   for(let i=1;i<this.points.length;i++){
    const p=this.points[i];
    this.velocity.subVectors(p,this.previous[i]).multiplyScalar(.986);
    this.previous[i].copy(p);p.add(this.velocity);p.y-=14*step*step;
   }
   this.points[0].copy(this.anchor);
   for(let iter=0;iter<12;iter++)for(let i=0;i<this.points.length;i++){
    const j=(i+1)%this.points.length,p=this.points[i],q=this.points[j];
    this.delta.subVectors(q,p);
    const d=this.delta.length();if(d<1e-8)continue;
    this.delta.multiplyScalar((d-this.lengths[i])/d*((i!==0&&j!==0)?.5:1));
    if(i)p.add(this.delta);if(j)q.sub(this.delta);
   }
  }
  this.remainder-=steps*step;
 }
}
