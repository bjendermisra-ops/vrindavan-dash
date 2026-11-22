import {accessory,settleChallenges} from './rewards.mjs';
import {CHARACTERS} from './roster.mjs';
export const POWERS=[{id:'shield',name:'Divine Shield',icon:'◈',price:40,detail:'Protects against one collision.'},{id:'magnet',name:'Makhan Magnet',icon:'∩',price:60,detail:'Attracts nearby tokens for 8 seconds.'},{id:'glide',name:'Peacock Glide',icon:'❧',price:90,detail:'Fly safely above obstacles for 8 seconds.'}];
const KEY='vd-economy-v1',amount=v=>Number.isSafeInteger(v)&&v>=0?Math.min(v,1e9):0;
export function cleanEconomy(raw={}){const owned=new Set(['krishna',...(Array.isArray(raw.owned)?raw.owned:[]).filter(id=>CHARACTERS.some(c=>c.id===id))]);const gear=Array.isArray(raw.gear)?[...new Set(raw.gear.filter(accessory))]:[];return {gear,equipped:gear.includes(raw.equipped)?raw.equipped:null,goal:accessory(raw.goal)&&!gear.includes(raw.goal)?raw.goal:null,daily:raw.daily||{},version:1,coins:amount(raw.coins),owned:[...owned],inventory:Object.fromEntries(POWERS.map(p=>[p.id,Math.min(9,amount(raw.inventory?.[p.id]))])),settled:Array.isArray(raw.settled)?raw.settled.filter(s=>typeof s==='string').slice(-64):[]};}
export class Economy{
 constructor(storage){this.storage=storage;let raw;try{raw=JSON.parse(storage.getItem(KEY)||'null');if(!raw){raw={coins:JSON.parse(storage.getItem('vd-bank')||'0'),owned:[JSON.parse(storage.getItem('vd-character')||'"krishna"')]};}}catch{raw={};}this.state=cleanEconomy(raw);}
 commit(next){try{this.storage.setItem(KEY,JSON.stringify(next));this.state=next;return {ok:true};}catch{return {ok:false,error:'Progress could not be saved. Free some device storage and try again.'};}}
 buyCharacter(id){const c=CHARACTERS.find(c=>c.id===id);if(!c)return {ok:false,error:'Character unavailable.'};if(this.state.owned.includes(id))return {ok:false,error:'Already unlocked.'};if(this.state.coins<c.price)return {ok:false,error:`Need ${c.price-this.state.coins} more coins.`};return this.commit({...this.state,coins:this.state.coins-c.price,owned:[...this.state.owned,id]});}
 buyPower(id){const p=POWERS.find(p=>p.id===id);if(!p)return {ok:false,error:'Power unavailable.'};if(this.state.inventory[id]>=9)return {ok:false,error:'Bag full: maximum 9 of each power.'};if(this.state.coins<p.price)return {ok:false,error:`Need ${p.price-this.state.coins} more coins.`};return this.commit({...this.state,coins:this.state.coins-p.price,inventory:{...this.state.inventory,[id]:this.state.inventory[id]+1}});}
 consume(id){if(!POWERS.some(p=>p.id===id)||!this.state.inventory[id])return {ok:false,error:'Buy this power in the Garage first.'};return this.commit({...this.state,inventory:{...this.state.inventory,[id]:this.state.inventory[id]-1}});}
 chooseGoal(id){
  if(!accessory(id)||this.state.gear.includes(id))return {ok:false,error:'Choose a locked accessory.'};
  return this.commit({...this.state,goal:id});
 }
 wear(id){
  const item=accessory(id);
  if(id!==null&&!item)return {ok:false,error:'Accessory unavailable.'};
  const owned=id===null||this.state.gear.includes(id);
  const cost=owned?0:item.price;
  if(cost>this.state.coins)return {ok:false,error:'More makhan needed.'};
  return this.commit({...this.state,coins:this.state.coins-cost,equipped:id,
   gear:owned?this.state.gear:[...this.state.gear,id],goal:this.state.goal===id?null:this.state.goal});
 }
 creditRun(id,coins,challenge){if(typeof id!=='string'||!id||!Number.isSafeInteger(coins)||coins<0)return {ok:false,error:'Invalid reward.'};if(this.state.settled.includes(id))return {ok:true,duplicate:true};const {daily,bonus}=challenge?settleChallenges(this.state,challenge.day,challenge.run):{daily:this.state.daily,bonus:0};return {...this.commit({...this.state,daily,coins:Math.min(1e9,this.state.coins+coins+bonus),settled:[...this.state.settled,id].slice(-64)}),bonus};}
}
