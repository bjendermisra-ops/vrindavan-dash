import {makeHero,animateHero} from './character.mjs';
import {MathUtils,Vector3} from './vendor/three.module.js';

export function makeDanav(){
 const actor=makeHero('danav');
 actor.scale.set(1.1,1.04,1.06);
 const arm=actor.userData.limbs[0];
 // Offset from elbow to palm in the MakeHuman bind pose.
 actor.userData.grip=arm.fore;
 actor.userData.palm=new Vector3(-.21,-.20,-.28);
 return actor;
}

export function animateDanav(actor,t,catchTime=0,{dt=0,reaching=0,running=true}={}){
 animateHero(actor,t,{dt,running,speed:15});
 const {limbs,head}=actor.userData, arm=limbs[0];
 // The hand opens toward the necklace, then carries it near the ribs.
 arm.arm.rotation.x=MathUtils.lerp(.12,.80,reaching);
 arm.arm.rotation.z=.50-.23*reaching;
 arm.fore.rotation.x=MathUtils.lerp(.62,.12,reaching);
 head.rotation.y=catchTime?.30:reaching*.16;
}

export function handPosition(actor,out){
 return actor.userData.grip.localToWorld(out.copy(actor.userData.palm));
}
