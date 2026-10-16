import {test} from 'node:test';import assert from 'node:assert/strict';
import {makeDanav,animateDanav} from '../dist/danav.mjs';
import {makeCoin,makeFeather} from '../dist/world.mjs';
test('danav and pickups have valid geometry through run and catch animations',()=>{for(const model of [makeDanav(),makeCoin(),makeFeather()]){for(const t of [0,.3,1,4]){if(model.userData.limbs)animateDanav(model,t,1);model.updateMatrixWorld(true);model.traverse(m=>{if(m.isMesh){assert.ok([...m.geometry.attributes.position.array].every(Number.isFinite));assert.ok(m.matrixWorld.elements.every(Number.isFinite));}});}}});
