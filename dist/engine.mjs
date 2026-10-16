export const STAGES=['Vrindavan Gali','Yamuna Ghat','Kadamba Forest'];
export const POWER_DURATION=8;
export class Run {
 constructor({mode='endless',level=1,random=Math.random}={}){Object.assign(this,{mode,level,random,distance:0,feathers:0,score:0,hearts:3,lane:0,x:0,jump:0,vy:0,slide:0,invincible:0,glide:0,glideHeight:0,shield:0,magnet:0,catches:0,dodges:0,chaseFeathers:0,combo:0,bestCombo:0,state:'running',events:[],objects:[],nextRow:45,nextPower:80,powerIndex:0,id:0,catchAnimation:0,intro:0});this.target=[400,750,1100][level-1]||400;}
 action(a){if(this.state!=='running'||this.intro>0)return;if(a==='left')this.lane=Math.max(-1,this.lane-1);if(a==='right')this.lane=Math.min(1,this.lane+1);if(a==='jump'&&this.jump===0&&this.vy===0&&this.glideHeight<.05){this.slide=0;this.vy=10.5;}if(a==='slide'&&this.glideHeight<.05){if(this.jump>0)this.vy=Math.min(this.vy,-15);else this.slide=.85;}}
 activatePower(type){if(this.state!=='running'||this.intro>0||!['shield','magnet','glide'].includes(type)||this[type]>0)return false;if(type==='shield')this.shield=1;else this[type]=POWER_DURATION;if(type==='glide'){this.jump=0;this.vy=0;this.slide=0;}this.events.push(type);return true;}
 skipIntro(){if(this.intro>0){this.intro=0;this.events.push('intro-end');}}
 get speed(){return Math.min(24,12+this.distance/170);}
 get stage(){return Math.floor(this.distance/450)%3;}
 add(type,lane,z,extra={}){this.objects.push({id:++this.id,type,lane,z,done:false,...extra});}
 spawn(){const safe=Math.floor(this.random()*3)-1,other=[-1,0,1].filter(l=>l!==safe);const lane=other[Math.floor(this.random()*2)],type=this.random()<.5?'cart':'arch';this.add(type,lane,-120);if(this.distance>220&&this.random()<.32)this.add(type==='cart'?'arch':'cart',other.find(l=>l!==lane),-120);
 const count=3+Math.floor(this.random()*3),pattern=Math.floor(this.random()*3),spacing=6+this.random()*1.5;
 for(let i=0;i<count;i++){const coinLane=pattern===2&&i===count-1?0:safe;this.add('coin',coinLane,-112-i*spacing,{y:pattern===1?.95+Math.sin(i/(count-1)*Math.PI)*1.35:.95});}
 if(this.distance>=this.nextPower){const type=['glide','magnet','shield'][this.powerIndex++%3];this.add(type,safe,-93);this.nextPower=this.distance+150+this.random()*80;}
 }
 step(dt){if(this.state!=='running')return;dt=Math.min(.05,Math.max(0,dt));if(this.intro>0){const before=this.intro;this.intro=Math.max(0,this.intro-dt);if(before>2.5&&this.intro<=2.5)this.events.push('intro-grab');if(!this.intro)this.events.push('intro-end');return;}this.distance+=this.speed*dt;this.x+=(this.lane*2.55-this.x)*(1-Math.exp(-15*dt));this.slide=Math.max(0,this.slide-dt);this.invincible=Math.max(0,this.invincible-dt);this.magnet=Math.max(0,this.magnet-dt);this.catchAnimation=Math.max(0,this.catchAnimation-dt);
 const priorGlide=this.glide;this.glide=Math.max(0,this.glide-dt);if(priorGlide>0&&this.glide===0){this.invincible=Math.max(this.invincible,1.4);this.events.push('glide-end');}
 this.glideHeight+=( (this.glide>0?1.5:0)-this.glideHeight)*(1-Math.exp(-5*dt));if(this.glide===0&&this.glideHeight<.015)this.glideHeight=0;
 if(this.vy!==0||this.jump>0){this.vy-=25*dt;this.jump=Math.max(0,this.jump+this.vy*dt);if(this.jump===0)this.vy=0;}
 if(this.distance>=this.nextRow){this.spawn();this.nextRow=this.distance+Math.max(42,this.speed*2)+this.random()*8;}
 for(const o of this.objects){o.z+=this.speed*dt;if(!o.done&&o.z>=1.1&&o.z<=3.5){const same=Math.abs(this.x-o.lane*2.55)<.9;
 if(['glide','shield','magnet'].includes(o.type)){if(same){o.done=true;if(o.type==='shield')this.shield=1;else if(o.type==='magnet')this.magnet=POWER_DURATION;else{this.glide=POWER_DURATION;this.slide=0;this.jump=0;this.vy=0;}this.events.push(o.type);}}
 else if(o.type==='coin'){const reachable=Math.abs((o.y??.95)-(1+this.jump+this.glideHeight))<1.05;if((same&&(reachable||this.glide>0))||this.magnet>0){o.done=true;this.feathers++;this.chaseFeathers++;this.combo++;this.bestCombo=Math.max(this.combo,this.bestCombo);this.events.push('collect');}}
 else if(same){o.done=true;const safe=this.glide>0||this.glideHeight>.25||(o.type==='cart'?this.jump>.9:this.slide>0);if(!safe&&this.invincible<=0){if(this.shield){this.shield=0;this.events.push('shield-block');}else{this.hearts--;this.events.push('hit');}this.invincible=2.2;this.combo=0;if(this.hearts<=0){this.state='over';this.events.push('over');}}else if(safe){this.score+=25;this.dodges++;this.events.push('dodge');}}
 }if(!o.done&&o.z>3.5)o.done=true;}
 this.objects=this.objects.filter(o=>o.z<10);
 if(this.state==='running'&&this.chaseFeathers>=15&&this.distance>180+this.catches*250){this.chaseFeathers=0;this.catches++;this.score+=300;this.catchAnimation=1.8;this.events.push('catch');}
 this.score+=this.speed*dt;if(this.mode==='mission'&&this.distance>=this.target&&this.state==='running'){this.state='won';this.events.push('won');}
 }
}
