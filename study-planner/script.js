const D=[
["IT111","Electronics",1,3,[]],["MA111","Mathematics-1",1,3,[]],["HU111","Technical Report Writing",1,2,[]],["HU113","Human Rights",1,2,[]],["MA112","Discrete Math",1,3,[]],["IT110","Introduction to Computers",1,3,[]],
["ST121","Probability and Statistics-1",2,3,["MA111"]],["HU112","Creative and Scientific Thinking",2,2,[]],["MA113","Mathematics-2",2,3,["MA111"]],["HU101","Micro Economics",2,2,[]],["IT113","Logic Design",2,3,["IT111"]],["CS112","Programming Language",2,3,["IT110"]],
["CS215","Object Oriented Programming",3,3,["CS112"]],["DS211","Introduction to Database Systems",3,3,["CS112"]],["MA214","Mathematics-3",3,3,["MA112"]],["IT231","Computer Networks Technology",3,3,["IT110"]],["ST222","Probability and Statistics-2",3,3,["ST121"]],["CS240","Introduction to Software Engineering",3,3,["CS112"]],
["IT217","Introduction to Operation Research",4,3,["CS112","ST121"]],["CS216","Data Structures",4,3,["CS215"]],["AI321","Machine Learning Fundamentals",4,3,["MA214","ST222","CS215"]],["IT230","Web Technology",4,3,["CS215"]],["HU427","Entrepreneurship",4,2,[]],["LB211","Networking Fundamentals Lab",4,2,["IT231"]],
["LB312","Network Routing and Switching Lab",5,2,["LB211"]],["AI311","Artificial Intelligence",5,3,["CS216"]],["CS319","Operating Systems",5,3,["CS216"]],["IT212","Digital Signal Processing",5,3,["MA214"]],["CS318","Computer Organization",5,3,["IT113","CS216"]],["CS341","Algorithms Analysis and Design",5,3,["CS216"]],
["IT322","Pattern Recognition",6,3,["IT212","ST222"]],["IT333","Information Computer Networks Security",6,3,["IT231"]],["AI448","Natural Language Processing (اختيارية)",6,3,["AI321"]],["CS344","Advanced Software Engineering",6,3,["CS240"]],["IT343","Microcontroller",6,3,["IT231"]],["LB313","Ethical Hacking Lab",6,2,["IT231"]],
["LB421","Selected Labs in Software Engineering",7,2,["CS341","CS344"]],["IT423","Embedded Systems",7,3,["IT343"]],["IT221","Computer Graphics",7,3,["CS215"]],["IT434","Advanced Computer Networks",7,3,["IT231"]],["PC401","Project (1)",7,3,[]],["IT438","Communication Technology",7,3,["IT231"]],
["IT436","Cloud Computing Networking",8,3,["IT434"]],["AI435","Semantic Web and Ontology",8,3,["AI311","IT230"]],["IT439","Wireless and Mobile Networks",8,3,["IT434"]],["HU402","Fundamentals of Management",8,2,[]],["PC402","Project (2)",8,3,["PC401"]],["LB431","Selected Labs in AI",8,2,["AI311"]]
];
const TOTAL=133,PC401_MIN=85,LV=["الأول","التاني","التالت","الرابع"];
const C={};D.forEach(([id,name,sem,h,pre])=>C[id]={id,name,sem,h,pre,lvl:Math.ceil(sem/2),next:[]});
D.forEach(([id,,,,pre])=>pre.forEach(p=>C[p].next.push(id)));
function chain(id){const c=C[id];if(c.ch)return c.ch;return c.ch=1+Math.max(0,...c.next.map(chain))}
function desc(id,s=new Set()){C[id].next.forEach(n=>{if(!s.has(n)){s.add(n);desc(n,s)}});return s}
Object.keys(C).forEach(id=>{chain(id);C[id].un=desc(id).size});
C.PC401.ch+=0;

let state={},term="first",ext=false,manual={},showAll=false;
try{const s=JSON.parse(localStorage.getItem("planner-it-v2")||"{}");state=s.state||{};term=s.term||"first";ext=!!s.ext}catch(e){}
const save=()=>{try{localStorage.setItem("planner-it-v2",JSON.stringify({state,term,ext}))}catch(e){}};
const $=id=>document.getElementById(id);
const hoursOf=st=>D.reduce((s,[id,,,h])=>s+(st[id]==='p'?h:0),0);
const level=p=>p>=96?4:p>=63?3:p>=30?2:1;
const lim=()=>term==="summer"?{max:ext?12:9,min:0}:{max:ext?21:18,min:9};

function markP(id){state[id]='p';C[id].pre.forEach(p=>{if(state[p]!=='p')markP(p)})}
function unmark(id){delete state[id];C[id].next.forEach(n=>{if(state[n]==='p')unmark(n)})}
function cycle(id){const s=state[id];
  if(!s)markP(id);else if(s==='p'){unmark(id);state[id]='f'}else delete state[id];
  manual={};save();render()}

function offered(id,t){return t==="summer"||(t==="first"?C[id].sem%2===1:C[id].sem%2===0)}
function eligible(id,st,t,ph){
  if(st[id]==='p'||!C[id].pre.every(p=>st[p]==='p')||!offered(id,t))return false;
  return id!=="PC401"||ph>=PC401_MIN}
// h = أقل عدد ترمات لازم تتقضي من المادة دي لحد آخر مادة معتمدة عليها (مع مراعاة فردي/زوجي)
function hMap(st){const H={};
  Object.keys(C).sort((a,b)=>C[b].sem-C[a].sem).forEach(id=>{
    let m=1;C[id].next.forEach(d=>{if(st[d]!=='p'){const g=(C[id].sem%2)!==(C[d].sem%2)?1:2;m=Math.max(m,g+H[d])}});H[id]=m});
  return H}
function descUn(id,st){return [...desc(id)].filter(d=>st[d]!=='p').length}
function order(st){const H=hMap(st),U={};Object.keys(C).forEach(id=>U[id]=descUn(id,st));
  return (a,b)=>H[b]-H[a]||U[b]-U[a]||(st[a]==='f'?0:1)-(st[b]==='f'?0:1)||C[a].sem-C[b].sem}
function fillSet(list,H,max){
  const pick=[];let tot=0;
  list.filter(id=>H[id]>1).forEach(id=>{if(tot+C[id].h<=max){pick.push(id);tot+=C[id].h}});
  const rest=list.filter(id=>H[id]===1),memo={};
  const can=(i,c)=>{if(c===0)return true;if(i>=rest.length)return false;const k=i+"_"+c;if(k in memo)return memo[k];
    return memo[k]=(C[rest[i]].h<=c&&can(i+1,c-C[rest[i]].h))||can(i+1,c)};
  let c=max-tot;while(c>0&&!can(0,c))c--;
  for(let i=0;i<rest.length&&c>0;i++){const h=C[rest[i]].h;if(h<=c&&can(i+1,c-h)){pick.push(rest[i]);c-=h;tot+=h}}
  return pick}
// الترم الحالي في الخطة = بعد آخر ترم أغلب موادّه مجتازة، بنفس نوع الترم المختار (فردي/زوجي)
function curSem(st,t){
  let k=0;for(let q=1;q<=8;q++){if(D.filter(x=>x[2]===q&&st[x[0]]==='p').length>=2)k=q}
  let q=k+1;if(t!=="summer"){while(q<=8&&(q%2===1)!==(t==="first"))q++}
  return q}
function pickFor(st,t,max){
  const ph=hoursOf(st),H=hMap(st),cand=Object.keys(C).filter(id=>eligible(id,st,t,ph)).sort(order(st));
  if(t==="summer")return {cand,pick:fillSet(cand,H,max)};
  // الترم العادي: مواد الترم الحالي + أي مواد متأخرة/راسبة الأول، وبعدها لو فيه ساعات فاضية بنضيف من المستويات الأعلى
  const sc=curSem(st,t),R=cand.filter(id=>C[id].sem<=sc),X=cand.filter(id=>C[id].sem>sc);
  const p1=fillSet(R,H,max),used=p1.reduce((a,id)=>a+C[id].h,0);
  // لو الطالب ماشي في الخطة من غير تأخير، بيظهر له الترم العادي زي ما هو. الإضافات بتظهر بس لو عنده مواد متأخرة أو راسبة، أو مفعّل حالة التخرج
  const behind=R.some(id=>C[id].sem<sc||state[id]==='f');
  return {cand,pick:[...p1,...((behind||ext)?fillSet(X,H,max-used):[])]}}

function project(){
  if(term==="summer")return null;
  const st={...state};let t=term,n=0;
  for(;n<14;n++){
    if(hoursOf(st)>=TOTAL)return n;
    const {pick}=pickFor(st,t,lim().max);
    if(!pick.length)return null;
    pick.forEach(id=>st[id]='p');t=t==="first"?"second":"first";
  }
  return hoursOf(st)>=TOTAL?n:null}

function render(){
  const ph=hoursOf(state),rem=TOTAL-ph,{max,min}=lim();
  $("sPass").textContent=ph;$("sRem").textContent=Math.max(rem,0);$("sLvl").textContent=LV[level(ph)-1];
  const pj=project();$("sProj").textContent=pj===null?"-":pj;
  $("sProjL").textContent=term==="summer"?"(التقدير للأول والتاني بس)":"ترم للتخرج لو نجحت في كل اللي هتسجله";
  document.querySelectorAll("#termSeg button").forEach(b=>b.classList.toggle("on",b.dataset.t===term));
  $("ext").checked=ext;
  $("limits").textContent=(term==="summer"?`الفصل الصيفي: الحد الأقصى ${max} ساعات.`:`الحد الأدنى 9 ساعات والحد الأقصى ${max} ساعة.`)+(ext?" (بعد الزيادة لدواعي التخرج)":"");
  $("trainNote").textContent=ph>=60?"عدّيت 60 ساعة: لازم تسجّل التدريب الصيفي (2 ساعة معتمدة) ولا تتخرج بدونه.":"";

  const marks=$("marks");marks.innerHTML="";
  for(let l=1;l<=4;l++){
    const d=document.createElement("div");d.className="lvl";d.innerHTML=`<h3>المستوى ${LV[l-1]}</h3><div class="two"></div>`;
    const two=d.querySelector(".two");
    [[2*l-1,"الترم الأول"],[2*l,"الترم التاني"]].forEach(([sem,label])=>{
      const half=document.createElement("div");half.className="half";half.innerHTML=`<h4>${label} (ترم ${sem})</h4><div class="chips"></div>`;
      const ch=half.querySelector(".chips");
      D.filter(x=>x[2]===sem).forEach(([id,name])=>{
        const b=document.createElement("button");b.className="chip "+(state[id]||"");b.textContent=name;b.title=id;b.onclick=()=>cycle(id);ch.appendChild(b)});
      two.appendChild(half)});
    marks.appendChild(d)}

  const {cand,pick}=pickFor(state,term,max);
  const sel=id=>id in manual?manual[id]:pick.includes(id);
  const boxes=$("boxes");boxes.innerHTML="";let tot=0;
  for(let l=1;l<=4;l++){
    const items=cand.filter(id=>C[id].lvl===l&&(showAll||pick.includes(id)||id in manual));
    const b=document.createElement("div");b.className="box";
    const h=items.filter(sel).reduce((s,id)=>s+C[id].h,0);tot+=h;
    b.innerHTML=`<h3><span>المستوى ${LV[l-1]}</span><small>${h} ساعة</small></h3>`;
    if(!items.length){const e=document.createElement("div");e.className="empty";e.textContent="مفيش مواد متاحة للتسجيل في الترم ده.";b.appendChild(e)}
    items.forEach(id=>{const c=C[id],on=sel(id),f=state[id]==='f';const un=descUn(id,state);const why=[];if(f)why.push('لازم تعيدها');why.push(un>0?`بتفتحلك ${un} مادة بعدها`:'لازمة للتخرج');if(!pick.includes(id))why.push('مش أولوية الترم ده');
      const pre=id==="PC401"?`اجتياز ${PC401_MIN} ساعة`:(c.pre.length?c.pre.map(p=>C[p].name).join(" + "):"لا يوجد");
      const el=document.createElement("label");el.className="card"+(on?" on":"")+(f?" retake":"");
      el.innerHTML=`<input type="checkbox" ${on?"checked":""}><div><span class="nm">${c.name}</span>${f?' <span class="tag">إعادة</span>':""}<small>${c.id} · ${c.h} ساعات · ترم ${c.sem}</small><small>المتطلب: ${pre}</small><small class="why">${why.join(" · ")}</small></div>`;
      el.querySelector("input").onchange=e=>{manual[id]=e.target.checked;render()};
      b.appendChild(el)});
    boxes.appendChild(b)}
  const more=cand.length-pick.length;$("moreBtn").style.display=more>0?"":"none";$("moreBtn").textContent=showAll?"إخفاء باقي المواد المتاحة":`عرض باقي المواد المتاحة (${more})`;
  $("total").textContent=`إجمالي الساعات المختارة: ${tot} من أقصى ${max}`;
  let w="";
  if(tot>max)w=`المختار (${tot}) أكبر من الحد الأقصى (${max}). شيل مادة أو أكتر.`;
  else if(min&&tot<min&&rem>=9)w=`المختار (${tot}) أقل من الحد الأدنى للتسجيل (9 ساعات).`;
  if(ph<PC401_MIN&&state.PC401!=='p')w+=(w?" ":"")+`مشروع (1) بيتفتح بعد ${PC401_MIN} ساعة مجتازة، ومعاك ${ph}.`;
  $("warn").textContent=w}

document.querySelectorAll("#termSeg button").forEach(b=>b.onclick=()=>{term=b.dataset.t;manual={};save();render()});
$("ext").onchange=e=>{ext=e.target.checked;manual={};save();render()};
$("reset").onclick=()=>{state={};manual={};save();render()};
$("moreBtn").onclick=()=>{showAll=!showAll;render()};
render();
