import {trackScale,strideRate} from '../dist/gait.mjs';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {makeHero,animateHero} from '../dist/character.mjs';
test('all six playable appearances construct finite indexed geometry',()=>{for(const outfit of ['krishna','festival','peacock','cowherd','radha','royal']){const g=makeHero(outfit);let vertices=0;g.traverse(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position.array;vertices+=a.length/3;assert.ok(a.every(Number.isFinite));const index=m.geometry.index?.array;if(index)assert.ok(index.every(v=>v<a.length/3));});assert.ok(vertices>10000);}});
test('each runner plants alternating feet, tracks the road, and clears the ground in swing',()=>{
 for(const id of ['krishna','festival','peacock','cowherd','radha','royal','danav']){
  const hero=makeHero(id), [left,right]=hero.userData.limbs;
  for(const speed of [12,18,24]){
   const foot=(phase,limb)=>{
    hero.userData.phase=phase;
    animateHero(hero,0,{dt:0,speed});
    assert.equal(hero.userData.phase,phase);
    return limb.foot.getWorldPosition(limb.foot.position.clone());
   };
   const strike=foot(.04,left), stance=foot(.21,left), swing=foot(.67,left);
   assert.ok(Math.abs(strike.y-.1)<.025 && Math.abs(stance.y-.1)<.025,id);
   const expected=.17*speed*trackScale/strideRate(speed);
   assert.ok(Math.abs(stance.z-strike.z-expected)<.035,id);
   assert.ok(swing.y>stance.y+.28,id);
   assert.ok(Math.abs(foot(.54,right).y-strike.y)<.015,id);
  }
 }
});
test('slide lowers hips without squashing or pitching the head at the floor',()=>{const g=makeHero();animateHero(g,1,{glide:2,dt:1/60});assert.equal(g.userData.wing.visible,true);for(let i=0;i<30;i++)animateHero(g,2,{slide:1,dt:1/60});assert.equal(g.userData.wing.visible,false);assert.deepEqual(g.userData.body.scale.toArray(),[1,1,1]);assert.ok(g.userData.body.position.y<-.5);assert.ok(Math.abs(g.userData.body.rotation.x+g.userData.head.rotation.x)<.02);for(let i=0;i<30;i++)animateHero(g,3,{dt:1/60});assert.ok(g.userData.slideBlend<.001);});

test('each costume animates a bound anatomical mesh and weighted garments',()=>{
 for(const outfit of ['krishna','festival','peacock','cowherd','radha','royal']){
  const hero=makeHero(outfit), figure=hero.getObjectByName('Figure');
  assert.ok(figure.isSkinnedMesh);
  let garments=0;
  hero.traverse(mesh=>{
   if(mesh!==figure && mesh.isSkinnedMesh){
    assert.equal(mesh.skeleton,figure.skeleton);
    garments++;
   }
  });
  assert.ok(garments>0);
  for(const limb of hero.userData.limbs)assert.ok(figure.skeleton.bones.includes(limb.arm));
 }
});
