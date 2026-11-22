import test from 'node:test';
import assert from 'node:assert/strict';
import {Economy} from '../dist/economy.mjs';
import {dailyProgress} from '../dist/rewards.mjs';

function wallet(){
 const data=new Map();
 return new Economy({getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)});
}
test('preview goals, purchases, and re-equipping cannot double charge',()=>{
 const e=wallet();e.chooseGoal('bansuri');assert.equal(e.wear('bansuri').ok,false);
 e.creditRun('1',90);e.wear('bansuri');assert.equal(e.state.goal,null);
 e.wear(null);e.wear('bansuri');assert.equal(e.state.coins,10);
 assert.equal(e.state.equipped,'bansuri');
});
test('daily totals and single-run goals pay once and reset the following day',()=>{
 const e=wallet(),day='2026-11-21',run={feathers:10,cartJumps:1,cleanBest:150};
 e.creditRun('1',10,{day,run});e.creditRun('2',10,{day,run});
 assert.deepEqual(dailyProgress(e.state,day),{makhan:15,carts:1,clean:150});
 assert.equal(e.state.coins,30);
 assert.equal(e.creditRun('2',10,{day,run}).duplicate,true);
 const payout=e.creditRun('3',0,{day,run:{feathers:0,cartJumps:2,cleanBest:200}});
 assert.equal(payout.bonus,40);
 assert.deepEqual(dailyProgress(e.state,'2026-11-22'),{makhan:0,carts:0,clean:0});
});
