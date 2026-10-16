export const BADGES=[
 {id:'first',name:'First adventure',detail:'Finish your first run',key:'runs',target:1,reward:10},
 {id:'collector',name:'Makhan collector',detail:'Collect 100 makhan tokens in total',key:'feathers',target:100,reward:30},
 {id:'traveller',name:'Vrindavan explorer',detail:'Travel 2,000 metres in total',key:'distance',target:2000,reward:50},
 {id:'chaser',name:'Mischief master',detail:'Catch the danav 5 times',key:'catches',target:5,reward:50},
 {id:'dodge',name:'Light on your feet',detail:'Clear 25 obstacles with jump or slide',key:'dodges',target:25,reward:40},
 {id:'marathon',name:'Peacock legend',detail:'Run 1,000 metres in a single run',key:'best',target:1000,reward:100}
];
export function cleanProgress(p={}){const out={};for(const k of ['runs','distance','feathers','catches','dodges','best'])out[k]=Number.isFinite(p[k])?Math.max(0,p[k]):0;out.claimed=Array.isArray(p.claimed)?p.claimed.filter(x=>BADGES.some(b=>b.id===x)):[];return out;}
export function recordRun(previous,run){const p=cleanProgress(previous);p.runs++;p.distance+=Math.floor(run.distance);p.feathers+=run.feathers;p.catches+=run.catches;p.dodges+=run.dodges||0;p.best=Math.max(p.best,Math.floor(run.distance));const earned=BADGES.filter(b=>p[b.key]>=b.target&&!p.claimed.includes(b.id));p.claimed.push(...earned.map(b=>b.id));return {progress:p,earned,reward:earned.reduce((s,b)=>s+b.reward,0)};}
