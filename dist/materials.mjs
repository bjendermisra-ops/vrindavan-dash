import * as T from './vendor/three.module.js';
// Generated atlas is sampled into separate GPU textures; the source file stays intact.
const cache=new Map();let atlas;
export function surface(kind,repeatX=1,repeatY=1){
 if(typeof document==='undefined')return null;
 const key=[kind,repeatX,repeatY].join(':');if(cache.has(key))return cache.get(key).tex;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d');ctx.fillStyle={stone:'#c9aa80',plaster:'#e1bc97',wood:'#775132',silk:'#ffd34a'}[kind];ctx.fillRect(0,0,512,512);
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(repeatX,repeatY);tex.anisotropy=4;
 const item={tex,ctx,kind};cache.set(key,item);if(atlas?.complete&&atlas.naturalWidth)paint(item);return tex;
}
function paint(item){const offsets={stone:[0,0],plaster:[1,0],wood:[0,1],silk:[1,1]},[x,y]=offsets[item.kind];const w=atlas.naturalWidth/2,h=atlas.naturalHeight/2;item.ctx.drawImage(atlas,x*w+2,y*h+2,w-4,h-4,0,0,512,512);item.tex.needsUpdate=true;}
if(typeof document!=='undefined'){atlas=new Image();atlas.onload=()=>cache.forEach(paint);atlas.src=new URL('./assets/vrindavan-materials-v4.webp',import.meta.url).href;}
