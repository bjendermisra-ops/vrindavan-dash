import * as T from './vendor/three.module.js';
import {profile,oval,curve,ring,pivot} from './character.mjs';
// Original pot-thief character; fully articulated and deliberately non-frightening.
export function makeDanav(){
 const root=new T.Group(),body=pivot(root,[0,0,0]),skin='#8766a2',gold='#f3c568';
 profile(body,skin,[[.75,.25,.17],[1,.33,.23],[1.3,.44,.25],[1.55,.39,.22],[1.64,.18,.15]]);
 profile(body,'#184aad',[[.65,.32,.24],[.83,.36,.25],[.94,.30,.23]],undefined,.05);
 profile(body,'#e74555',[[.94,.31,.24],[1.04,.32,.24]]);
 const head=pivot(body,[0,1.88,0]);oval(head,skin,[0,0,0],[.32,.34,.28]);
 oval(head,'#51405e',[0,.19,.04],[.33,.19,.27]);
 for(const side of [-1,1]){
 oval(head,skin,[side*.33,0,0],[.14,.09,.06]);
 curve(head,'#fff0c1',[[side*.23,.19,.01],[side*.34,.36,.02],[side*.26,.48,.015]],.048);
 oval(head,'#fff5df',[side*.12,.01,-.255],[.08,.085,.035]);oval(head,'#242036',[side*.12,.01,-.286],[.035,.045,.013]);
 curve(head,'#302339',[[side*.05,.14,-.26],[side*.14,.17,-.26],[side*.23,.11,-.23]],.024);
 curve(head,'#302339',[[side*.015,-.13,-.29],[side*.15,-.15,-.29],[side*.22,-.095,-.24]],.025);
 ring(head,gold,[side*.34,-.1,0],.07,.014,0);
 }
 oval(head,'#b18ab8',[0,-.065,-.29],[.06,.07,.035]);curve(head,'#f5d9dd',[[-.09,-.23,-.22],[0,-.25,-.24],[.09,-.23,-.22]],.012);
 const limbs=[];
 for(const side of [-1,1]){
 const leg=pivot(body,[side*.18,.75,0]);profile(leg,'#184aad',[[0,.16,.16],[-.24,.14,.15],[-.34,.10,.11]],undefined,.04);
 const shin=pivot(leg,[0,-.32,0]);profile(shin,skin,[[0,.10,.1],[-.29,.075,.08]]);oval(shin,'#50394d',[0,-.32,-.08],[.13,.09,.2]);
 const arm=pivot(body,[side*.4,1.43,0]);profile(arm,skin,[[0,.13,.13],[-.3,.095,.095]]);const fore=pivot(arm,[0,-.3,0]);profile(fore,skin,[[0,.095,.095],[-.26,.07,.07]]);oval(fore,skin,[0,-.29,0],[.09,.1,.08]);ring(fore,gold,[0,-.2,0],.08,.019);limbs.push({leg,shin,arm,fore,side});
 }
 const pot=pivot(body,[-.42,1.04,-.3]);profile(pot,'#b55a36',[[0,.10,.1],[.06,.23,.23],[.25,.27,.27],[.4,.17,.17],[.46,.19,.19]]);ring(pot,gold,[0,.35,0],.21,.018);oval(pot,'#fff0cf',[0,.445,0],[.16,.025,.16]);
 root.userData={body,head,limbs,pot};return root;
}
export function animateDanav(g,t,catchTime=0){const {body,head,limbs}=g.userData;body.position.y=Math.abs(Math.sin(t*10))*.10;body.rotation.z=catchTime?Math.sin(catchTime*16)*.22:0;head.rotation.y=Math.sin(t*.8)>.6?-.9:0;for(const a of limbs){const s=Math.sin(t*11+a.side*Math.PI/2);a.leg.rotation.x=s*.8;a.shin.rotation.x=-.15-Math.max(0,-s)*1.2;a.arm.rotation.x=a.side<0?-.8:-s*.7;a.fore.rotation.x=1.2;}}
