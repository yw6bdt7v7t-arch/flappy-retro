const c=document.getElementById("game"),x=c.getContext("2d");
const W=400,H=700,ground=82;
let state="title",score=0,best=Number(localStorage.flappyBest||0),bird, pipes=[],parts=[],t=0,last=0,speed=2.7,shake=0;
const medals=[["PLATINUM",40],["GOLD",25],["SILVER",15],["BRONZE",5]];
function reset(){score=0;speed=2.7;bird={x:105,y:320,vy:0,r:16,rot:0};pipes=[];parts=[];t=0;addPipe(440)}
function addPipe(px){let gap=Math.max(125,180-score*1.2),cy=190+Math.random()*250;pipes.push({x:px,w:62,cy,gap,passed:false})}
function flap(){if(state==="title"||state==="over"){reset();state="play"} if(state!=="play")return;bird.vy=-7.5;burst(bird.x-10,bird.y,7);beep(520,.045)}
function burst(px,py,n){for(let i=0;i<n;i++)parts.push({x:px,y:py,vx:(Math.random()-.5)*3,vy:(Math.random()-.5)*3-1,a:1,s:2+Math.random()*3})}
function beep(f,d){try{let a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.frequency.value=f;o.type="square";g.gain.value=.035;o.connect(g);g.connect(a.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);o.stop(a.currentTime+d)}catch{}}
function medal(){return medals.find(m=>score>=m[1])?.[0]||""}
function hit(){if(state!=="play")return;state="over";shake=10;burst(bird.x,bird.y,28);beep(90,.18);if(score>best){best=score;localStorage.flappyBest=best}}
function rectHit(p){let bx=bird.x,by=bird.y,r=bird.r;return bx+r>p.x&&bx-r<p.x+p.w&&(by-r<p.cy-p.gap/2||by+r>p.cy+p.gap/2)}
function update(dt){t+=dt;for(const q of parts){q.x+=q.vx;q.y+=q.vy;q.vy+=.08;q.a-=.025}parts=parts.filter(q=>q.a>0);
if(state!=="play")return;bird.vy+=.38;bird.y+=bird.vy;bird.rot=Math.max(-.55,Math.min(1.2,bird.vy*.08));
for(const p of pipes)p.x-=speed*dt/16.67;
if(pipes[pipes.length-1].x<210)addPipe(440);
for(const p of pipes){if(!p.passed&&p.x+p.w<bird.x){p.passed=true;score++;speed=Math.min(4.5,2.7+score*.055);beep(760,.05);burst(bird.x,bird.y,10)}if(rectHit(p))hit()}
pipes=pipes.filter(p=>p.x>-80);
if(bird.y-bird.r<0||bird.y+bird.r>H-ground)hit()}
function draw(){let s=shake?(Math.random()-.5)*shake:0;x.save();x.translate(s,s);
let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#63bdf2");g.addColorStop(1,"#d8f2ff");x.fillStyle=g;x.fillRect(0,0,W,H);
x.fillStyle="#fff8";for(let i=0;i<5;i++){let xx=((i*97-t*.015)%480)-40; x.beginPath();x.ellipse(xx,100+(i%3)*55,42,16,0,0,7);x.fill()}
x.fillStyle="#87c56b";x.beginPath();x.moveTo(0,H-ground-30);for(let i=0;i<=W;i+=40)x.lineTo(i,H-ground-30-Math.sin(i*.03)*18);x.lineTo(W,H-ground);x.lineTo(0,H-ground);x.fill();
for(const p of pipes){x.fillStyle="#58b94f";x.fillRect(p.x,0,p.w,p.cy-p.gap/2);x.fillRect(p.x,p.cy+p.gap/2,p.w,H-ground-(p.cy+p.gap/2));x.fillStyle="#7bdf66";x.fillRect(p.x+8,0,9,p.cy-p.gap/2);x.fillRect(p.x+8,p.cy+p.gap/2,9,H-ground-(p.cy+p.gap/2));x.fillStyle="#3f963d";x.fillRect(p.x-4,p.cy-p.gap/2-12,p.w+8,12);x.fillRect(p.x-4,p.cy+p.gap/2,p.w+8,12)}
x.fillStyle="#d9bd55";x.fillRect(0,H-ground,W,ground);x.fillStyle="#9c7b36";for(let i=-20;i<W+20;i+=40)x.fillRect(i+(t*speed)%40,H-ground+15,22,8);
for(const q of parts){x.globalAlpha=q.a;x.fillStyle="#fff";x.fillRect(q.x,q.y,q.s,q.s)}x.globalAlpha=1;
if(bird){x.save();x.translate(bird.x,bird.y);x.rotate(bird.rot);x.fillStyle="#ffd84d";x.beginPath();x.arc(0,0,17,0,7);x.fill();x.fillStyle="#f2a93b";x.beginPath();x.ellipse(-8,7,12,6,0,0,7);x.fill();x.fillStyle="#fff";x.beginPath();x.arc(7,-6,6,0,7);x.fill();x.fillStyle="#222";x.beginPath();x.arc(9,-6,2,0,7);x.fill();x.fillStyle="#f0783c";x.beginPath();x.moveTo(15,-2);x.lineTo(28,2);x.lineTo(15,6);x.fill();x.restore()}
x.restore();
if(state==="title")panel("FLAPPY RETRO","TAP TO START",`BEST ${best}`);
if(state==="play"){text(String(score),W/2,70,48,"#fff");button(355,32,32,32,"Ⅱ")}
if(state==="pause")panel("PAUSED","TAP TO RESUME",`SCORE ${score}`);
if(state==="over")panel("GAME OVER",`SCORE ${score}   BEST ${best}`,medal()?medal()+" MEDAL":"KEEP FLYING");
shake*=.82}
function panel(a,b,d){x.fillStyle="#0008";x.fillRect(28,205,344,260);text(a,200,270,38,"#fff");text(b,200,335,18,"#fff");text(d,200,370,16,"#ffe36b");text("TAP TO PLAY",200,425,16,"#fff")}
function text(v,px,py,size,col){x.fillStyle=col;x.font=`900 ${size}px system-ui`;x.textAlign="center";x.textBaseline="middle";x.fillText(v,px,py)}
function button(px,py,w,h,v){x.fillStyle="#0006";x.fillRect(px,py,w,h);text(v,px+w/2,py+h/2,18,"#fff")}
function loop(now){let dt=Math.min(32,now-last||16);last=now;update(dt);draw();requestAnimationFrame(loop)}reset();requestAnimationFrame(loop);
addEventListener("pointerdown",e=>{if(state==="play"&&e.clientX>innerWidth*.82&&e.clientY<100){state="pause";return}if(state==="pause"){state="play";return}flap()});
addEventListener("keydown",e=>{if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();flap()}if(e.code==="KeyP"&&state==="play")state="pause";else if(e.code==="KeyP"&&state==="pause")state="play"});
