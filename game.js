const c=document.getElementById("game"),ctx=c.getContext("2d");
const BW=400,BH=760,GROUND=94;let scale=1,ox=0,oy=0,dpr=1;
function resize(){const vw=innerWidth,vh=innerHeight;dpr=Math.min(devicePixelRatio||1,3);c.width=Math.round(vw*dpr);c.height=Math.round(vh*dpr);c.style.width=vw+"px";c.style.height=vh+"px";scale=Math.max(vw/BW,vh/BH);ox=(vw-BW*scale)/2;oy=(vh-BH*scale)/2}
addEventListener("resize",resize);addEventListener("orientationchange",()=>setTimeout(resize,100));resize();

let state="title",score=0,best=Number(localStorage.flappyBest||0),bird,pipes=[],parts=[],t=0,last=0,speed=2.75,shake=0;
const medals=[["PLATINUM",40],["GOLD",25],["SILVER",15],["BRONZE",5]];
function reset(){score=0;speed=2.75;pipes=[];parts=[];t=0;bird={x:105,y:345,vy:0,r:17,rot:0};addPipe(440)}
function addPipe(px){const gap=Math.max(128,182-score*1.1),cy=205+Math.random()*245;pipes.push({x:px,w:64,cy,gap,passed:false})}
function flap(){if(state==="title"||state==="over"){reset();state="play"}if(state!=="play")return;bird.vy=-7.7;burst(bird.x-10,bird.y,7);beep(520,.045)}
function burst(px,py,n){for(let i=0;i<n;i++)parts.push({x:px,y:py,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3-1,a:1,s:2+Math.random()*4})}
function beep(f,d){try{const a=new(window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.frequency.value=f;o.type="square";g.gain.value=.035;o.connect(g);g.connect(a.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);o.stop(a.currentTime+d)}catch{}}
function medal(){return medals.find(m=>score>=m[1])?.[0]||""}
function hit(){if(state!=="play")return;state="over";shake=9;burst(bird.x,bird.y,28);beep(90,.18);if(score>best){best=score;localStorage.flappyBest=best}}
function rectHit(p){const r=bird.r;return bird.x+r>p.x&&bird.x-r<p.x+p.w&&(bird.y-r<p.cy-p.gap/2||bird.y+r>p.cy+p.gap/2)}
function update(dt){t+=dt;for(const q of parts){q.x+=q.vx;q.y+=q.vy;q.vy+=.08;q.a-=.025}parts=parts.filter(q=>q.a>0);if(state!=="play")return;bird.vy+=.38;bird.y+=bird.vy;bird.rot=Math.max(-.55,Math.min(1.2,bird.vy*.08));for(const p of pipes)p.x-=speed*dt/16.67;if(pipes[pipes.length-1].x<215)addPipe(440);for(const p of pipes){if(!p.passed&&p.x+p.w<bird.x){p.passed=true;score++;speed=Math.min(4.5,2.75+score*.055);beep(760,.05);burst(bird.x,bird.y,10)}if(rectHit(p))hit()}pipes=pipes.filter(p=>p.x>-90);if(bird.y-bird.r<0||bird.y+bird.r>BH-GROUND)hit()}
function rr(x,y,w,h,r,fill,stroke,lw=0){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}}
function text(v,x,y,size){ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`900 ${size}px system-ui,-apple-system,sans-serif`;ctx.fillStyle="rgba(20,55,85,.42)";ctx.fillText(v,x+2,y+3);ctx.fillStyle="#fff";ctx.fillText(v,x,y)}
function hud(x,y,w,h,fill,stroke){rr(x+2,y+4,w,h,18,"rgba(0,30,70,.35)");rr(x,y,w,h,18,fill,stroke,3)}
function drawPause(){hud(14,18,58,58,"#1675c9","#aeeeff");rr(24,28,38,38,11,"#0d4e98");ctx.fillStyle="#fff";ctx.fillRect(34,35,6,24);ctx.fillRect(48,35,6,24)}
function drawBest(){hud(306,18,80,58,"#ffbd20","#fff0a2");ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="900 11px system-ui";ctx.fillText("BEST",346,34);ctx.font="900 25px system-ui";ctx.fillText(String(best),346,57)}
function drawScore(){ctx.textAlign="center";ctx.font="900 48px system-ui";ctx.fillStyle="rgba(20,55,85,.45)";ctx.fillText(String(score),202,55);ctx.fillStyle="#fff";ctx.fillText(String(score),199,52)}
function panelTitle(){ctx.fillStyle="rgba(5,45,75,.12)";ctx.fillRect(0,0,BW,BH);hud(42,205,316,235,"rgba(8,46,84,.78)","#7ee6ff");text("FLAPPY",200,260,40);text("RETRO",200,302,40);ctx.fillStyle="#ffe36b";ctx.font="900 18px system-ui";ctx.textAlign="center";ctx.fillText("TAP TO START",200,357);ctx.fillStyle="#fff";ctx.font="700 15px system-ui";ctx.fillText("BEST  "+best,200,392)}
function overlay(a,b){ctx.fillStyle="rgba(0,15,35,.48)";ctx.fillRect(0,0,BW,BH);hud(45,250,310,155,"rgba(8,46,84,.88)","#7ee6ff");text(a,200,295,34);ctx.fillStyle="#ffe36b";ctx.font="900 17px system-ui";ctx.textAlign="center";ctx.fillText(b,200,340);ctx.fillStyle="#fff";ctx.font="700 15px system-ui";ctx.fillText("SCORE  "+score,200,372)}
function over(){ctx.fillStyle="rgba(0,15,35,.35)";ctx.fillRect(0,0,BW,BH);hud(38,190,324,300,"rgba(8,46,84,.9)","#7ee6ff");text("GAME OVER",200,235,32);ctx.fillStyle="#fff";ctx.font="800 16px system-ui";ctx.textAlign="center";ctx.fillText("SCORE",140,280);ctx.fillText("BEST",260,280);ctx.font="900 34px system-ui";ctx.fillText(score,140,315);ctx.fillText(best,260,315);ctx.fillStyle="#ffe36b";ctx.font="900 18px system-ui";ctx.fillText(medal()?medal()+" MEDAL":"KEEP FLYING",200,360);rr(95,392,210,50,16,"#19aeea","#b6f3ff",3);ctx.fillStyle="#fff";ctx.font="900 18px system-ui";ctx.fillText("PLAY AGAIN",200,418)}

function draw(){
 const vw=c.width/dpr,vh=c.height/dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,vw,vh);
 ctx.save();ctx.translate(ox+(shake?(Math.random()-.5)*shake:0),oy);ctx.scale(scale,scale);
 let g=ctx.createLinearGradient(0,0,0,BH);g.addColorStop(0,"#24b6f0");g.addColorStop(.55,"#67d1f7");g.addColorStop(1,"#c9f3ff");ctx.fillStyle=g;ctx.fillRect(-2,-2,BW+4,BH+4);
 let sun=ctx.createRadialGradient(315,190,5,315,190,75);sun.addColorStop(0,"rgba(255,250,170,.95)");sun.addColorStop(1,"rgba(255,250,170,0)");ctx.fillStyle=sun;ctx.fillRect(240,115,150,150);
 ctx.fillStyle="#fff8";for(let i=0;i<7;i++){let xx=((i*83-t*.018)%500)-50,yy=125+(i%4)*72;ctx.beginPath();ctx.ellipse(xx,yy,47,19,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(xx+22,yy-10,30,24,0,0,Math.PI*2);ctx.fill()}
 ctx.fillStyle="#a7d9ea";for(let i=0;i<10;i++){let bx=i*48-20,bh=25+(i%4)*18;ctx.fillRect(bx,BH-GROUND-72-bh,38,bh)}
 ctx.fillStyle="#7ed39b";ctx.beginPath();ctx.moveTo(0,BH-GROUND-55);for(let i=0;i<=BW;i+=35)ctx.lineTo(i,BH-GROUND-55-Math.sin(i*.025)*30);ctx.lineTo(BW,BH-GROUND);ctx.lineTo(0,BH-GROUND);ctx.fill();ctx.fillStyle="#4dbd8a";ctx.beginPath();ctx.moveTo(0,BH-GROUND-10);for(let i=0;i<=BW;i+=40)ctx.lineTo(i,BH-GROUND-10-Math.sin(i*.032+1)*22);ctx.lineTo(BW,BH-GROUND);ctx.lineTo(0,BH-GROUND);ctx.fill();
 for(const p of pipes){const top=p.cy-p.gap/2,bottom=p.cy+p.gap/2,pg=ctx.createLinearGradient(p.x,0,p.x+p.w,0);pg.addColorStop(0,"#1d8e39");pg.addColorStop(.25,"#43c64b");pg.addColorStop(.72,"#79e55e");pg.addColorStop(1,"#258f38");ctx.fillStyle=pg;ctx.fillRect(p.x,0,p.w,top);ctx.fillRect(p.x,bottom,p.w,BH-GROUND-bottom);ctx.fillStyle="rgba(255,255,255,.24)";ctx.fillRect(p.x+9,0,9,top);ctx.fillRect(p.x+9,bottom,9,BH-GROUND-bottom);rr(p.x-5,top-14,p.w+10,28,9,"#39a943","#146e31",3);rr(p.x-5,bottom-14,p.w+10,28,9,"#39a943","#146e31",3)}
 ctx.fillStyle="#a9ec3c";ctx.fillRect(0,BH-GROUND,BW,14);ctx.fillStyle="#46a42f";ctx.fillRect(0,BH-GROUND+10,BW,5);ctx.fillStyle="#c98c31";ctx.fillRect(0,BH-GROUND+19,BW,GROUND-19);for(let i=-30;i<BW+30;i+=55)rr(i+(t*speed)%55,BH-GROUND+38,28,10,4,"rgba(255,220,120,.38)");
 for(const q of parts){ctx.globalAlpha=q.a;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(q.x,q.y,q.s,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
 ctx.save();ctx.translate(bird.x,bird.y);ctx.rotate(bird.rot);ctx.shadowColor="rgba(0,0,0,.18)";ctx.shadowBlur=6;ctx.shadowOffsetY=3;ctx.fillStyle="#ffd447";ctx.beginPath();ctx.arc(0,0,19,0,Math.PI*2);ctx.fill();ctx.shadowColor="transparent";ctx.fillStyle="#f2a632";ctx.beginPath();ctx.ellipse(-8,7,13,7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(8,-7,7,0,Math.PI*2);ctx.fill();ctx.fillStyle="#18202b";ctx.beginPath();ctx.arc(10,-7,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle="#f47735";ctx.beginPath();ctx.moveTo(16,-3);ctx.lineTo(30,2);ctx.lineTo(16,7);ctx.closePath();ctx.fill();ctx.restore();ctx.restore();
 ctx.save();ctx.translate(ox,oy);ctx.scale(scale,scale);if(state==="play"||state==="pause"){drawPause();drawScore();drawBest()}if(state==="title")panelTitle();if(state==="pause")overlay("PAUSED","TAP TO RESUME");if(state==="over")over();ctx.restore();shake*=.82
}
function loop(n){const dt=Math.min(32,last?n-last:16);last=n;update(dt);draw();requestAnimationFrame(loop)}reset();requestAnimationFrame(loop);
addEventListener("pointerdown",e=>{const px=(e.clientX-ox)/scale,py=(e.clientY-oy)/scale;if(state==="play"&&px>370&&py<100){state="pause";return}if(state==="pause"){state="play";return}flap()});
addEventListener("keydown",e=>{if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();flap()}if(e.code==="KeyP")state=state==="play"?"pause":state==="pause"?"play":state});
