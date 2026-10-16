// Original procedural score: flute-like lead, plucked strings, drone and percussion.
// No remote audio requests, copyrighted recordings, or autoplay before a gesture.
export const MELODY=[74,0,77,79,81,79,77,0,74,77,79,0,72,0,69,0,74,0,77,79,84,81,79,77,79,0,77,74,72,0,74,0,77,0,79,81,84,0,81,79,77,79,81,0,77,74,72,0,74,77,79,0,81,79,77,74,72,0,69,72,74,0,0,0];
const hz=n=>440*2**((n-69)/12);
export class GameAudio{
 constructor(settings,Context){this.settings=settings;this.Context=Context;this.ctx=null;this.timer=null;this.playing=false;this.nodes=new Set();this.step=0;this.next=0;this.lastCollect=-1;}
 unlock(){try{if(!this.ctx){const C=this.Context||globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return false;this.ctx=new C();const c=this.ctx;this.master=c.createGain();this.master.gain.value=.7;const limiter=c.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=15;limiter.ratio.value=5;this.master.connect(limiter);limiter.connect(c.destination);this.music=c.createGain();this.fx=c.createGain();this.music.connect(this.master);this.fx.connect(this.master);this.delay=c.createDelay(.5);this.delay.delayTime.value=.18;this.echo=c.createGain();this.echo.gain.value=.16;this.delay.connect(this.echo);this.echo.connect(this.music);this.noise=c.createBuffer(1,c.sampleRate*.3,c.sampleRate);let d=this.noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);this.apply();}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});return true;}catch{return false;}}
 apply(){if(!this.ctx)return;const at=this.ctx.currentTime;this.music.gain.setTargetAtTime(this.settings.music===false?0:(this.settings.musicVolume??.45),at,.04);this.fx.gain.setTargetAtTime(this.settings.sound===false?0:(this.settings.sfxVolume??.75),at,.02);}
 track(source,nodes,bus){const voice={source,nodes,bus};this.nodes.add(voice);source.onended=()=>{this.nodes.delete(voice);source.disconnect();for(const n of nodes)n.disconnect();};return source;}
 tone(freq,when,duration,volume=.1,type='sine',bus=this.fx,slide=1,echo=false){if(!this.ctx)return;const c=this.ctx,o=c.createOscillator(),gain=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,when);if(slide!==1)o.frequency.exponentialRampToValueAtTime(freq*slide,when+duration);gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),when+.012);gain.gain.exponentialRampToValueAtTime(.0001,when+duration);o.connect(gain);gain.connect(bus);if(echo)gain.connect(this.delay);this.track(o,[gain],bus);o.start(when);o.stop(when+duration+.03);}
 hiss(when,duration,volume,freq=1800,bus=this.fx){if(!this.ctx)return;const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),filter=c.createBiquadFilter();s.buffer=this.noise;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=.8;g.gain.setValueAtTime(volume,when);g.gain.exponentialRampToValueAtTime(.0001,when+duration);s.connect(filter);filter.connect(g);g.connect(bus);this.track(s,[filter,g],bus);s.start(when);s.stop(when+duration);}
 startMusic(){this.playing=true;if(!this.unlock()||this.timer)return;this.next=this.ctx.currentTime+.04;this.step=0;this.schedule();this.timer=setInterval(()=>this.schedule(),60);}
 stopMusic(){this.playing=false;if(this.timer)clearInterval(this.timer);this.timer=null;for(const voice of [...this.nodes])if(voice.bus===this.music){try{voice.source.stop()}catch{}}}
 silence(){this.stopMusic();for(const voice of [...this.nodes])try{voice.source.stop()}catch{};}
 schedule(){if(!this.ctx||!this.playing)return;const now=this.ctx.currentTime;if(this.next<now-.2)this.next=now+.03;const beat=60/112/2;while(this.next<now+.18){const n=this.step%64,t=this.next;if(this.settings.music!==false){const note=MELODY[n];if(note){this.tone(hz(note),t,beat*1.6,.085,'sine',this.music,1,true);this.tone(hz(note)*2,t,beat*1.1,.012,'sine',this.music);}
 const roots=[50,48,53,50],root=roots[Math.floor(n/16)];if(n%4===0){this.tone(hz(root+12+(n%8?7:0)),t,.36,.045,'triangle',this.music);this.tone(n%8?160:95,t,.17,.14,'sine',this.music,.55);}if(n%2)this.hiss(t,.065,.018,5000,this.music);if(n%8===4)this.tone(235,t,.11,.06,'triangle',this.music,.7);if(n%16===0){this.tone(hz(root-12),t,2.0,.025,'sine',this.music);this.tone(hz(root-5),t,1.9,.012,'sine',this.music);}}
 this.step++;this.next+=beat;}}
 effect(name,value=0){if(this.settings.sound===false||!this.unlock())return;const t=this.ctx.currentTime+.005;
 if(name==='collect'){if(t-this.lastCollect<.035)return;this.lastCollect=t;const f=hz(81+(value%5)*2);this.tone(f,t,.13,.10);this.tone(f*1.5,t+.025,.18,.045);}
 else if(name==='jump'){this.tone(260,t,.16,.055,'sine',this.fx,2.2);this.hiss(t,.09,.025,2800);}
 else if(name==='slide'){this.hiss(t,.22,.055,1200);this.tone(210,t,.14,.025,'triangle',this.fx,.5);}
 else if(name==='lane')this.hiss(t,.055,.025,3500);
 else if(name==='land'){this.hiss(t,.07,.04,500);this.tone(100,t,.07,.04,'sine',this.fx,.5);}
 else if(name==='step')this.hiss(t,.035,.012,650);
 else if(name==='hit'){this.tone(130,t,.22,.12,'triangle',this.fx,.4);this.hiss(t,.12,.07,700);}
 else if(name==='catch'||name==='power'||name==='badge'||name==='win'){[74,77,81,86].forEach((n,i)=>this.tone(hz(n),t+i*.075,.32,.08,'sine',this.fx,1));}
 else if(name==='over'){[74,72,69].forEach((n,i)=>this.tone(hz(n),t+i*.13,.3,.07,'triangle'));}
 else if(name==='shield'||name==='magnet'||name==='shield-block'){[79,86].forEach((n,i)=>this.tone(hz(n),t+i*.07,.23,.07));}
 else this.tone(660,t,.055,.035);
 }
}
