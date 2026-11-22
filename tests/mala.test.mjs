import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,Vector3} from '../dist/vendor/three.module.js';
import {MalaCord} from '../dist/mala.mjs';

test('the held mala follows the palm while the loop falls, settles, and keeps its length',()=>{
 for(const hz of [20,60,120]){
  const cord=new MalaCord(24);cord.wear(new Group());
  const target=cord.points[0].clone(), start=target.clone();
  for(let i=0;i<2*hz;i++){
   target.x=start.x+Math.min(i/hz,.3)*.8;
   cord.carry(target,1/hz);
  }
  assert.ok(cord.points[0].distanceTo(target)<.001);
  assert.ok(cord.points[12].y<target.y-.20);
  for(let i=0;i<24;i++)assert.ok(Math.abs(cord.points[i].distanceTo(cord.points[(i+1)%24])-cord.lengths[i])<.008);
  const prev=cord.points.map(v=>v.clone());cord.carry(target,0);
  assert.deepEqual(cord.points,prev);
  cord.carry(new Vector3(0,1,-15),1/hz);
  assert.ok(cord.points.every(v=>Math.abs(v.z+15)<.5));
 }
});

test('the intro puts the reaching palm on the worn bead before the cord transfers',async()=>{
 const {World}=await import('../dist/world.mjs');
 const {makeHero}=await import('../dist/character.mjs');
 const {makeDanav,handPosition}=await import('../dist/danav.mjs');
 const w={hero:makeHero('radha'),danav:makeDanav(),time:0,grip:new Vector3(),contact:new Vector3(),cord:new MalaCord(24),mala:new Group()};
 for(let n=0;n<24;n++)w.mala.add(new Group());
 w.hero.position.z=2;w.hero.rotation.y=Math.PI;
 const run={intro:4,distance:0,chaseFeathers:0,catches:0,catchAnimation:0};
 for(let i=0;i<=90;i++){
  run.intro=4-i/60;w.time=i/60;World.prototype.updateTheft.call(w,run,false,1/60);
 }
 const palm=handPosition(w.danav,new Vector3());
 assert.ok(w.cord.points[0].distanceTo(palm)<.02);
 const contact=w.cord.points[0].clone();
 run.intro-=1/60;World.prototype.updateTheft.call(w,run,false,1/60);
 assert.ok(w.cord.points[0].distanceTo(contact)<.03);
 run.intro=0;World.prototype.updateTheft.call(w,run,false,1/60);
 assert.ok(w.cord.points[0].distanceTo(w.grip)<.001);
});
