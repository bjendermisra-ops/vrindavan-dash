import * as T from './vendor/three.module.js';
// Keep a minimum horizontal view on narrow portrait screens. A fixed vertical
// FOV previously clipped the two outer lanes and the expanded glide wings.
export function runnerFov(aspect){return Math.max(54,T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(46/2))/Math.max(.28,aspect))));}
export function frameCamera(camera,{x=0,menuBlend=0,showcase=false}={}){
 const b=T.MathUtils.clamp(menuBlend,0,1),follow=x*.82*(1-b);
 camera.fov=T.MathUtils.lerp(runnerFov(camera.aspect),Math.max(48,T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(29/2))/Math.max(.28,camera.aspect)))),b);
 camera.position.set(follow+b*.35,T.MathUtils.lerp(4.7,2.6,b),T.MathUtils.lerp(11.5,7.8,b));
 camera.lookAt(follow+b*(camera.aspect>=1?camera.aspect*.95:showcase?0:.85),T.MathUtils.lerp(1.5,1.65,b),T.MathUtils.lerp(-9,2,b));
 camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
}
