export const accessories=[
 {id:'plume',name:'Emerald Morpankh',price:45},
 {id:'bansuri',name:'Golden Bansuri',price:80},
 {id:'patka',name:'Saffron Patka',price:120}
];
export const accessory=id=>accessories.find(item=>item.id===id);
export function today(date=new Date()){
 return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
}
export function challenges(day){
 const n=Number(day.slice(-2))%3;
 return [
  {id:'makhan',target:15+n*5,reward:10,label:'Collect makhan today'},
  {id:'carts',target:2+n,reward:15,label:'Jump over carts in one run'},
  {id:'clean',target:200+n*50,reward:25,label:'Run metres without taking a hit'}
 ];
}
export function dailyProgress(state,day){
 return Object.fromEntries(challenges(day).map(c=>[c.id,state.daily?.day===day?Math.min(c.target,Math.max(0,Number(state.daily[c.id])||0)):0]));
}
export function settleChallenges(state,day,run){
 const values=dailyProgress(state,day),before={...values};
 values.makhan+=run.feathers;values.carts=Math.max(values.carts,run.cartJumps);
 values.clean=Math.max(values.clean,Math.floor(run.cleanBest));
 let bonus=0;
 for(const c of challenges(day)){
  values[c.id]=Math.min(values[c.id],c.target);
  if(values[c.id]===c.target && before[c.id]<c.target)bonus+=c.reward;
 }
 return {daily:{day,...values},bonus};
}
