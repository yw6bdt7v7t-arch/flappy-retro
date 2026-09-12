const c=document.getElementById("game"),ctx=c.getContext("2d");
const W=450,H=800,GROUND=92;
let state="title",score=0,best=Number(localStorage.flappyBest||0),bird,pipes=[],particles=[],clouds=[],time=0,last=0,speed=3.05,shake=0,flash=0,transition=0;
const TAU=Math.PI*2;

for(let i=0;i<8;i++) clouds.push({x:Math.random()*W,y:70+Math.random()*260,s:0.65+Math.random()*0.75,v:0.12+Math.random()*0.22});
const medalFor=s=>s>=40?["PLATINUM","◆"]:s>=25?["GOLD","★"]:s>=15?["SILVER","●"]:s>=5?["BRONZE","●"]:["",""];

function reset(){
 score=0;speed=3.05;bird={x:112,y:370,vy:0,r:17,rot:0,wing:0};pipes=[];particles=[];transition=0;
 addPipe(500);
}
function addPipe(px){
 const gap=Math.max(142,188-score*1.15);
 const min=175,max=430,cy=min+Math.random()*(max-min);
 pipes.push({x:px,w:72,cy,gap,passed:false});
}
function start(){if(state==="title"||state==="over"){reset();state="play";beep(420,.06)}}
function flap(){
 if(state==="title"||state==="over"){start();bird.vy=-8.2;return}
 if(state==="pause"){state="play";return}
 if(state!=="play")return;
 bird.vy=-8.15;burst(bird.x-8,bird.y+8,8,"#ffffff");beep(560,.045);
}
function pause(){if(state==="play")state="pause";else if(state==="pause")state="play"}
function burst(px,py,n,color){
 for(let i=0;i<n;i++)particles.push({x:px,y:py,vx:(Math.random()-.5)*3.6,vy:(Math.random()-.5)*3.6,s:2+Math.random()*4,a:1,color});
}
function beep(freq,dur){
 try{const ac=new (window.AudioContext||window.webkitAudioContext)(),o=ac.createOscillator(),g=ac.createGain();
 o.type="sine";o.frequency.value=freq;g.gain.value=.025;o.connect(g);g.connect(ac.destination);o.start();
 g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+dur);o.stop(ac.currentTime+dur)}catch(e){}
}
function hit(){
 if(state!=="play")return;
 state="over";shake=12;flash=.18;burst(bird.x,bird.y,34,"#fff");
 if(score>best){best=score;localStorage.flappyBest=best;beep(980,.16)}else beep(100,.18);
}
function pipeHit(p){
 const r=bird.r*.82,bx=bird.x,by=bird.y;
 return bx+r>p.x&&bx-r<p.x+p.w&&(by-r<p.cy-p.gap/2||by+r>p.cy+p.gap/2);
}
function update(dt){
 time+=dt;
 for(const q of particles){q.x+=q.vx*dt/16.67;q.y+=q.vy*dt/16.67;q.vy+=.09*dt/16.67;q.a-=.035*dt/16.67}
 particles=particles.filter(q=>q.a>0);
 for(const cl of clouds){cl.x-=cl.v*dt/16.67;if(cl.x<-110)cl.x=W+70}
 if(flash>0)flash-=dt/1000;
 if(state!=="play")return;
 bird.vy+=.43*dt/16.67;bird.y+=bird.vy*dt/16.67;bird.wing+=dt*.018;
 bird.rot=Math.max(-.6,Math.min(1.25,bird.vy*.075));
 for(const p of pipes)p.x-=speed*dt/16.67;
 if(pipes[pipes.length-1].x<235)addPipe(500);
 for(const p of pipes){
   if(!p.passed&&p.x+p.w<bird.x){p.passed=true;score++;speed=Math.min(4.8,3.05+score*.055);burst(bird.x,bird.y,12,"#fff");beep(780,.055)}
   if(pipeHit(p))hit();
 }
 pipes=pipes.filter(p=>p.x>-100);
 if(bird.y-bird.r<0||bird.y+bird.r>H-GROUND)hit();
}
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function shadowText(t,x,y,size,fill="#fff",weight=800){
 ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`${weight} ${size}px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif`;
 ctx.fillStyle="rgba(0,0,0,.18)";ctx.fillText(t,x+1.5,y+2);ctx.fillStyle=fill;ctx.fillText(t,x,y)
}
function draw(){
 const sx=shake?((Math.random()-.5)*shake):0,sy=shake?((Math.random()-.5)*shake):0;
 ctx.save();ctx.translate(sx,sy);
 let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#69c4f4");sky.addColorStop(.55,"#a8ddf7");sky.addColorStop(1,"#e9f5e9");
 ctx.fillStyle=sky;ctx.fillRect(-20,-20,W+40,H+40);
 // sun glow
 let sun=ctx.createRadialGradient(350,120,5,350,120,90);sun.addColorStop(0,"rgba(255,246,186,.55)");sun.addColorStop(1,"rgba(255,246,186,0)");
 ctx.fillStyle=sun;ctx.fillRect(260,30,180,180);
 // clouds
 for(const cl of clouds)drawCloud(cl.x,cl.y,cl.s);
 // distant hills
 ctx.fillStyle="#94cc83";ctx.beginPath();ctx.moveTo(0,H-GROUND-54);
 for(let i=0;i<=W;i+=45)ctx.lineTo(i,H-GROUND-54-Math.sin(i*.022+1.3)*24-Math.sin(i*.055)*9);
 ctx.lineTo(W,H-GROUND);ctx.lineTo(0,H-GROUND);ctx.fill();
 // pipes
 for(const p of pipes)drawPipe(p);
 // ground
 ctx.fillStyle="#d8bd55";ctx.fillRect(0,H-GROUND,W,GROUND);
 ctx.fillStyle="#b0923c";const off=(time*speed*.06)%52;
 for(let i=-52;i<W+52;i+=52)rr(i+off,H-GROUND+18,28,8,3);
 ctx.fillStyle="#e9d16c";ctx.fillRect(0,H-GROUND,W,5);
 // particles
 for(const q of particles){ctx.globalAlpha=q.a;ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,q.s,0,TAU);ctx.fill()}ctx.globalAlpha=1;
 drawBird();
 ctx.restore();
 if(state==="play"){drawScore();drawPause()}
 if(state==="title")drawTitle();
 if(state==="pause")drawPausePanel();
 if(state==="over")drawGameOver();
 if(flash>0){ctx.fillStyle=`rgba(255,255,255,${Math.max(0,flash)*.5})`;ctx.fillRect(0,0,W,H)}
 shake*=.84;
}
function drawCloud(x,y,s){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle="rgba(255,255,255,.48)";
 ctx.beginPath();ctx.arc(0,15,24,0,TAU);ctx.arc(28,4,31,0,TAU);ctx.arc(60,16,22,0,TAU);ctx.roundRect(-20,15,100,26,13);ctx.fill();ctx.restore()
}
function drawPipe(p){
 const top=p.cy-p.gap/2,bot=p.cy+p.gap/2;
 pipeRect(p.x,0,p.w,top);pipeRect(p.x,bot,p.w,H-GROUND-bot);
 ctx.fillStyle="rgba(255,255,255,.17)";ctx.fillRect(p.x+10,0,8,Math.max(0,top));ctx.fillRect(p.x+10,bot,8,Math.max(0,H-GROUND-bot));
 ctx.fillStyle="#4a9e48";rr(p.x-5,top-14,p.w+10,14,5);rr(p.x-5,bot,p.w+10,14,5)
}
function pipeRect(x,y,w,h){if(h<=0)return;ctx.fillStyle="#57b957";rr(x,y,w,h,4);ctx.fillStyle="#6ed36b";ctx.fillRect(x+3,y+2,5,Math.max(0,h-4));ctx.fillStyle="rgba(0,0,0,.12)";ctx.fillRect(x+w-7,y+2,5,Math.max(0,h-4))}
function drawBird(){
 if(!bird)return;ctx.save();ctx.translate(bird.x,bird.y);ctx.rotate(bird.rot);
 // soft shadow
 ctx.fillStyle="rgba(0,0,0,.13)";ctx.beginPath();ctx.ellipse(-1,21,20,5,0,0,TAU);ctx.fill();
 // body
 ctx.fillStyle="#ffc83d";ctx.beginPath();ctx.ellipse(0,0,20,17,0,0,TAU);ctx.fill();
 ctx.fillStyle="#ffe47a";ctx.beginPath();ctx.ellipse(-3,-6,12,9,-.2,0,TAU);ctx.fill();
 // wing
 const flapY=Math.sin(bird.wing)*3;ctx.fillStyle="#eaa62f";ctx.beginPath();ctx.ellipse(-9,7+flapY,13,7,-.25,0,TAU);ctx.fill();
 // eye
 ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(9,-7,7,0,TAU);ctx.fill();ctx.fillStyle="#202936";ctx.beginPath();ctx.arc(11,-7,2.6,0,TAU);ctx.fill();
 // beak
 ctx.fillStyle="#f27a39";ctx.beginPath();ctx.moveTo(17,-1);ctx.lineTo(33,4);ctx.lineTo(17,8);ctx.closePath();ctx.fill();
 ctx.restore();
}
function drawScore(){shadowText(String(score),W/2,58,48,"#fff",900)}
function drawPause(){ctx.fillStyle="rgba(15,28,40,.28)";ctx.beginPath();ctx.arc(W-42,42,24,0,TAU);ctx.fill();ctx.fillStyle="#fff";ctx.fillRect(W-48,34,5,16);ctx.fillRect(W-39,34,5,16)}
function card(y,h){ctx.fillStyle="rgba(19,35,48,.82)";rr(35,y,W-70,h,24);ctx.strokeStyle="rgba(255,255,255,.10)";ctx.lineWidth=1;ctx.stroke()}
function drawTitle(){
 card(235,315);
 shadowText("FLAPPY",W/2,292,48,"#fff",900);shadowText("RETRO",W/2,344,48,"#fff",900);
 ctx.fillStyle="rgba(255,255,255,.09)";rr(112,375,226,66,18);
 ctx.fillStyle="#ffc83d";ctx.beginPath();ctx.arc(140,408,17,0,TAU);ctx.fill();
 shadowText("TAP TO FLY",225,408,21,"#fff",800);
 shadowText(`BEST  ${best}`,W/2,470,18,"#ffe16b",800);
 ctx.fillStyle="rgba(255,255,255,.55)";shadowText("Tap anywhere to flap",W/2,505,14,"rgba(255,255,255,.65)",600);
}
function drawPausePanel(){card(285,205);shadowText("PAUSED",W/2,340,38,"#fff",900);shadowText("TAP TO RESUME",W/2,400,18,"#ffe16b",800);shadowText(`SCORE  ${score}`,W/2,438,15,"rgba(255,255,255,.7)",700)}
function drawGameOver(){
 card(245,330);shadowText("FLIGHT OVER",W/2,300,34,"#fff",900);
 shadowText(String(score),W/2,360,58,"#ffe16b",900);
 ctx.fillStyle="rgba(255,255,255,.65)";shadowText(`BEST  ${best}`,W/2,408,16,"rgba(255,255,255,.72)",700);
 const m=medalFor(score);if(m[0]){ctx.fillStyle="rgba(255,211,91,.12)";rr(126,435,198,42,21);shadowText(`${m[1]}  ${m[0]}`,225,456,15,"#ffe16b",800)}
 ctx.fillStyle="#ffc83d";rr(104,500,242,54,18);shadowText("PLAY AGAIN",225,527,18,"#1e2933",900);
}
function loop(now){const dt=Math.min(32,now-(last||now-16));last=now;update(dt);draw();requestAnimationFrame(loop)}
reset();requestAnimationFrame(loop);

let lastInput=0;
function input(e){
 if(e?.cancelable)e.preventDefault();
 const n=performance.now();if(n-lastInput<130)return;lastInput=n;
 const r=c.getBoundingClientRect(),px=((e?.clientX??r.left+r.width/2)-r.left)*W/r.width,py=((e?.clientY??r.top+r.height/2)-r.top)*H/r.height;
 if(state==="play"&&px>W-85&&py<90){pause();return}
 flap();
}
c.addEventListener("pointerdown",input,{passive:false});
c.addEventListener("touchstart",input,{passive:false});
c.addEventListener("click",input,{passive:false});
addEventListener("keydown",e=>{if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();flap()}if(e.code==="KeyP")pause()});
