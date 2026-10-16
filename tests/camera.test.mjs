import {test} from 'node:test';import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {frameCamera} from '../dist/camera.mjs';import {makeHero,animateHero} from '../dist/character.mjs';
test('portrait camera contains the complete visible hero in all lanes and actions',()=>{
 const hero=makeHero();const p=new T.Vector3();
 for(const [w,h] of [[320,740],[360,800],[412,915],[686,1304],[768,1024],[1100,700],[1920,1080],[2560,1080],[844,390],[640,360],[1024,768]]){
 const camera=new T.PerspectiveCamera(54,w/h,.1,230);
 for(const x of [-2.55,-1.2,0,1.2,2.55])for(const state of [{},{slide:1},{jump:2.2},{glide:2,glideHeight:1.5},{glide:0,glideHeight:.7},{jump:2.2,glide:2}]){
 hero.position.set(x,0,2);for(let i=0;i<25;i++)animateHero(hero,i/60,{...state,running:true,dt:1/60});hero.updateMatrixWorld(true);frameCamera(camera,{x});
 hero.traverseVisible(m=>{if(!m.isMesh)return;const a=m.geometry.attributes.position;for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld).project(camera);assert.ok(Math.abs(p.x)<.92,`${w}x${h} lane ${x} ${JSON.stringify(state)} x=${p.x}`);assert.ok(p.y>-.83&&p.y<.88,`${w}x${h} ${JSON.stringify(state)} y=${p.y}`);}});
 }
 }
});
