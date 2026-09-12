const c=document.getElementById("game"),x=c.getContext("2d");
const W=400,H=760,ground=94;let state="title",score=0,best=Number(localStorage.flappyBest||0),bird,pipes=[],parts=[],t=0,last=0,speed=2.75,shake=0;
const medals=[["PLATINUM",40],["GOLD",25],["SILVER",15],["BRONZE",5]];
function reset(){score=0;speed=2.75;pipes=[];parts=[];t=0;bird={x:105,y:345,vy:0,r:17,rot:0};addPipe(440)}
function addPipe(px){let gap=Math.max(128,182-score*1.1),cy=205+Math.random()*245;pipes.push({x:px,w:64,cy,gap,passed:false})}
function flap(){if(state==="title"||state==="over"){reset();state="play"}if(state!=="play")return;bird.vy=-7.7;burst(bird.x-10,bird.y,7);beep(520,.045)}
function burst(px,py,n){for(let i=0;i<n;i++)parts.push({x:px,y:py,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3-1,a:1,s:2+Math.random()*4})}
function beep(f,d){try{let a=new(window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.frequency.value=f;o.type="square";g.gain.value=.035;o.connect(g);g.connect(a.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);o.stop(a.currentTime+d)}catch{}}
function medal(){return medals.find(m=>score>=m[1])?.[0]||""}
function hit(){if(state!=="play")return;state="over";shake=9;burst(bird.x,bird.y,28);beep(90,.18);if(score>best){best=score;localStorage.flappyBest=best}}
function rectHit(p){let bx=bird.x,by=bird.y,r=bird.r;return bx+r>p.x&&bx-r<p.x+p.w&&(by-r<p.cy-p.gap/2||by+r>p.cy+p.gap/2)}
function update(dt){t+=dt;for(const q of parts){q.x+=q.vx;q.y+=q.vy;q.vy+=.08;q.a-=.025}parts=parts.filter(q=>q.a>0);if(state!=="play")return;bird.vy+=.38;bird.y+=bird.vy;bird.rot=Math.max(-.55,Math.min(1.2,bird.vy*.08));for(const p of pipes)p.x-=speed*dt/16.67;if(pipes[pipes.length-1].x<215)addPipe(440);for(const p of pipes){if(!p.passed&&p.x+p.w<bird.x){p.passed=true;score++;speed=Math.min(4.5,2.75+score*.055);beep(760,.05);burst(bird.x,bird.y,10)}if(rectHit(p))hit()}pipes=pipes.filter(p=>p.x>-90);if(bird.y-bird.r<0||bird.y+bird.r>H-ground)hit()}
function rr(px,py,w,h,r,fill,stroke,lw){x.beginPath();x.roundRect(px,py,w,h,r);if(fill){x.fillStyle=fill;x.fill()}if(stroke){x.lineWidth=lw||1;x.strokeStyle=stroke;x.stroke()}}
function shadowText(v,px,py,size){x.textAlign="center";x.textBaseline="middle";x.font=`900 ${size}px system-ui,-apple-system,sans-serif`;x.fillStyle="rgba(20,55,85,.42)";x.fillText(v,px+2,py+3);x.fillStyle="#fff";x.fillText(v,px,py)}
function hudBox(px,py,w,h,fill,stroke){rr(px+2,py+4,w,h,18,"rgba(0,30,70,.35)");rr(px,py,w,h,18,fill,stroke,3)}
function drawPause(){hudBox(18,88,58,58,"#1675c9","#aeeeff");rr(25,95,44,44,13,"#0d4e98");x.fillStyle="#fff";x.fillRect(34,102,7,27);x.fillRect(52,102,7,27)}
function drawBest(){hudBox(302,88,80,58,"#ffbd20","#fff0a2");x.fillStyle="#fff";x.font="900 11px system-ui";x.textAlign="center";x.fillText("BEST",343,104);x.font="900 25px system-ui";x.fillText(String(best),343,126);x.fillStyle="#fff6a8";x.beginPath();x.arc(319,112,7,0,Math.PI*2);x.fill()}
function drawScore(){x.textAlign="center";x.textBaseline="middle";x.font="900 48px system-ui";x.fillStyle="rgba(20,55,85,.45)";x.fillText(String(score),201,112);x.fillStyle="#fff";x.fillText(String(score),198,109)}
function draw(){let s=shake?(Math.random()-.5)*shake:0;x.save();x.translate(s,s);let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#24b6f0");g.addColorStop(.55,"#67d1f7");g.addColorStop(1,"#c9f3ff");x.fillStyle=g;x.fillRect(0,0,W,H);let sun=x.createRadialGradient(315,190,5,315,190,75);sun.addColorStop(0,"rgba(255,250,170,.95)");sun.addColorStop(1,"rgba(255,250,170,0)");x.fillStyle=sun;x.fillRect(240,115,150,150);x.fillStyle="#fff8";for(let i=0;i<7;i++){let xx=((i*83-t*.018)%500)-50,yy=125+(i%4)*72;x.beginPath();x.ellipse(xx,yy,47,19,0,0,Math.PI*2);x.fill();x.beginPath();x.ellipse(xx+22,yy-10,30,24,0,0,Math.PI*2);x.fill()}x.fillStyle="#a7d9ea";for(let i=0;i<10;i++){let bx=i*48-20,bh=25+(i%4)*18;x.fillRect(bx,H-ground-72-bh,38,bh)}x.fillStyle="#7ed39b";x.beginPath();x.moveTo(0,H-ground-55);for(let i=0;i<=W;i+=35)x.lineTo(i,H-ground-55-Math.sin(i*.025)*30);x.lineTo(W,H-ground);x.lineTo(0,H-ground);x.fill();x.fillStyle="#4dbd8a";x.beginPath();x.moveTo(0,H-ground-10);for(let i=0;i<=W;i+=40)x.lineTo(i,H-ground-10-Math.sin(i*.032+1)*22);x.lineTo(W,H-ground);x.lineTo(0,H-ground);x.fill();
for(const p of pipes){let topH=p.cy-p.gap/2,bottomY=p.cy+p.gap/2,pg=x.createLinearGradient(p.x,0,p.x+p.w,0);pg.addColorStop(0,"#1d8e39");pg.addColorStop(.25,"#43c64b");pg.addColorStop(.72,"#79e55e");pg.addColorStop(1,"#258f38");x.fillStyle=pg;x.fillRect(p.x,0,p.w,topH);x.fillRect(p.x,bottomY,p.w,H-ground-bottomY);x.fillStyle="rgba(255,255,255,.24)";x.fillRect(p.x+9,0,9,topH);x.fillRect(p.x+9,bottomY,9,H-ground-bottomY);rr(p.x-5,topH-14,p.w+10,28,9,"#39a943","#146e31",3);rr(p.x-5,bottomY-14,p.w+10,28,9,"#39a943","#146e31",3)}
x.fillStyle="#a9ec3c";x.fillRect(0,H-ground,W,14);x.fillStyle="#46a42f";x.fillRect(0,H-ground+10,W,5);x.fillStyle="#c98c31";x.fillRect(0,H-ground+19,W,ground-19);for(let i=-30;i<W+30;i+=55){let xx=i+(t*speed)%55;rr(xx,H-ground+38,28,10,4,"rgba(255,220,120,.38)" )}
for(const q of parts){x.globalAlpha=q.a;x.fillStyle="#fff";x.beginPath();x.arc(q.x,q.y,q.s,0,Math.PI*2);x.fill()}x.globalAlpha=1;if(bird){x.save();x.translate(bird.x,bird.y);x.rotate(bird.rot);x.shadowColor="rgba(0,0,0,.18)";x.shadowBlur=6;x.shadowOffsetY=3;x.fillStyle="#ffd447";x.beginPath();x.arc(0,0,19,0,Math.PI*2);x.fill();x.shadowColor="transparent";x.fillStyle="#f2a632";x.beginPath();x.ellipse(-8,7,13,7,0,0,Math.PI*2);x.fill();x.fillStyle="#fff";x.beginPath();x.arc(8,-7,7,0,Math.PI*2);x.fill();x.fillStyle="#18202b";x.beginPath();x.arc(10,-7,2.5,0,Math.PI*2);x.fill();x.fillStyle="#f47735";x.beginPath();x.moveTo(16,-3);x.lineTo(30,2);x.lineTo(16,7);x.closePath();x.fill();x.restore()}x.restore();if(state==="play"||state==="pause"){drawPause();drawScore();drawBest()}if(state==="title")titlePanel();if(state==="pause"){
  overlayPanel("PAUSED","");
  menuButton(92,360,216,48,"RESUME");
  menuButton(92,420,216,48,"MAIN MENU");
}if(state==="over")gameOverPanel();shake*=.82}
function titlePanel(){x.fillStyle="rgba(5,45,75,.12)";x.fillRect(0,0,W,H);hudBox(42,205,316,235,"rgba(8,46,84,.78)","#7ee6ff");shadowText("FLAPPY",200,260,40);shadowText("RETRO",200,302,40);x.fillStyle="#ffe36b";x.font="900 18px system-ui";x.textAlign="center";x.fillText("TAP TO START",200,357);x.fillStyle="#fff";x.font="700 15px system-ui";x.fillText(`BEST  ${best}`,200,392)}
function overlayPanel(label,sub){x.fillStyle="rgba(0,15,35,.48)";x.fillRect(0,0,W,H);hudBox(45,250,310,155,"rgba(8,46,84,.88)","#7ee6ff");shadowText(label,200,295,34);x.fillStyle="#ffe36b";x.font="900 17px system-ui";x.textAlign="center";x.fillText(sub,200,340);x.fillStyle="#fff";x.font="700 15px system-ui";x.fillText(`SCORE  ${score}`,200,372)}
function goMainMenu(){
  state="title";
  reset();
}
function menuButton(x0,y0,w0,h0,label){
  rr(x0,y0,w0,h0,14,"#19aeea","#b6f3ff",3);
  x.fillStyle="#fff";
  x.font="900 16px system-ui";
  x.textAlign="center";
  x.textBaseline="middle";
  x.fillText(label,x0+w0/2,y0+h0/2);
}

function gameOverPanel(){x.fillStyle="rgba(0,15,35,.35)";x.fillRect(0,0,W,H);hudBox(38,190,324,300,"rgba(8,46,84,.9)","#7ee6ff");shadowText("GAME OVER",200,235,32);x.fillStyle="#fff";x.font="800 16px system-ui";x.textAlign="center";x.fillText("SCORE",140,280);x.fillText("BEST",260,280);x.font="900 34px system-ui";x.fillText(String(score),140,315);x.fillText(String(best),260,315);x.fillStyle="#ffe36b";x.font="900 18px system-ui";x.fillText(medal()?medal()+" MEDAL":"KEEP FLYING",200,360);rr(95,392,210,50,16,"#19aeea","#b6f3ff",3);
x.fillStyle="#fff";x.font="900 18px system-ui";x.textAlign="center";x.fillText("PLAY AGAIN",200,418);
menuButton(95,454,210,44,"MAIN MENU")}
function loop(now){let dt=Math.min(32,last?now-last:16);last=now;update(dt);draw();requestAnimationFrame(loop)}reset();requestAnimationFrame(loop);
addEventListener("pointerdown",e=>{const r=c.getBoundingClientRect();const lx=(e.clientX-r.left)/r.width*W,ly=(e.clientY-r.top)/r.height*H;if(state==="play"&&lx>=10&&lx<=86&&ly>=80&&ly<=155){state="pause";return}if(state==="pause"){state="play";return}flap()});addEventListener("keydown",e=>{if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();flap()}if(e.code==="KeyP"&&state==="play")state="pause";else if(e.code==="KeyP"&&state==="pause")state="play"});
