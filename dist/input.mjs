// Device-independent actions. Ignore micro gestures, and resolve diagonals once.
export function keyAction(key){return ({arrowleft:'left',a:'left',arrowright:'right',d:'right',arrowup:'jump',w:'jump',' ':'jump',arrowdown:'slide',s:'slide'})[key.toLowerCase()]||null;}
export function swipeAction(dx,dy,width,height){const threshold=Math.max(18,Math.min(36,Math.min(width,height)*.055));if(Math.max(Math.abs(dx),Math.abs(dy))<threshold)return null;return Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy<0?'jump':'slide';}
