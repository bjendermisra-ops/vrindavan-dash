// CSS viewport size and GPU backing resolution are deliberately independent.
export function displayMetrics(width,height){
 const w=Math.max(1,Number(width)||1),h=Math.max(1,Number(height)||1);
 const stageWidth=Math.min(w,h*3.6),stageHeight=Math.min(h,w/0.32);
 return {width:stageWidth,height:stageHeight,scale:Math.max(1,Math.min(2.4,Math.min(stageWidth/430,stageHeight/780)))};
}
export function renderRatio(width,height,dpr=1,quality='auto',ceiling=Infinity,maxDimension=8192){
 const w=Math.max(1,width),h=Math.max(1,height);
 const pixels=quality==='low'?1500000:quality==='high'?6000000:3500000;
 return Math.max(.01,Math.min(Math.max(.1,dpr||1),quality==='low'?1:1.5,ceiling,Math.sqrt(pixels/(w*h)),maxDimension/w,maxDimension/h));
}
export function fullscreenState(doc,element){
 const active=Boolean(doc.fullscreenElement||doc.webkitFullscreenElement);
 const available=Boolean(element.requestFullscreen||element.webkitRequestFullscreen);
 return {active,available};
}
export async function changeFullscreen(doc,element){
 const {active,available}=fullscreenState(doc,element);
 if(active){const exit=doc.exitFullscreen||doc.webkitExitFullscreen;if(exit)await exit.call(doc);return;}
 if(!available)throw new Error('Fullscreen unavailable');
 await (element.requestFullscreen||element.webkitRequestFullscreen).call(element);
}
