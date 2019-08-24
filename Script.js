(()=>{let cd=(i,t)=>{let d=document.createElement("div");if (i) d.id=i;if (t) d.textContent=t;return d;},ap=(p,c)=>p.appendChild(c),rc=c=>c.parentNode.removeChild(c),sa=(e,k,v)=>e.setAttribute(k,v),ra=(e,k)=>e.removeAttribute(k),ael=(e,t,f)=>e.addEventListener(t,f),sc=(e,c)=>{if (c) sa(e,"class",c);else ra(e,"class");return e;},html=document.documentElement,body=document.body;let status=(o=>{var msi=null;let msl=["menu-hidden","before-menu-shown","menu-shown","hiding-menu"];var ms=0;let u=t=>{let c=[t.colorSchemePreferred?"pcs":(t.dark?"dark":"light"),msl[ms]];if (t.squared) c.push("squared");if (t.moving) c.push("moving");if (t.standalone) c.push("standalone");if (t.input=="Touch") c.push("touch");if (t.browser!=null) c.push(t.browser.toLowerCase());sc(html,c.join(" "));};let s=new Proxy(o,{set:(t,p,v)=>{if ((p=="menuShown")&&(t[p]!=v)) {if (msi) clearTimeout(msi);ms=v?1:3;msi=setTimeout(()=>{ms=v*2;msi=null;u(t);},v?0:500);}if (p) t[p]=v;u(t);}});let test=cd();s.input=test.ontouchstart===null?"Touch":"Mouse";s.standalone=navigator.standalone===true||(/standalone=yes/).test(location.search);let mm=s=>window.matchMedia(`(prefers-color-scheme: ${s})`).matches;s.colorSchemePreferred=mm("light")||mm("dark");if (window.ApplePaySession) s.browser="Safari";if (window.chrome) s.browser="Chrome";if (window.sidebar) s.browser="Firefox";return s;})({input:null,moving:false,standalone:false,menuShown:false,areaMode:0,trendLineMode:0,squared:false,dark:false,normSigma:1/3,normMu:0,colorSchemePreferred:false,browser:null});let update=(()=>{let l=[],rs=[];let u=(p,r)=>{if (p) {l.push(p);if (r) rs.push(p);}else l.forEach(i=>i());};let r=()=>rs.forEach(f=>f());ael(window,"resize",r);ael(window,"load",()=>{while (body.firstChild) rc(body.firstChild);ap(body,base);u();});return u;})();let points=(pt=>{let rand=(()=>{let m=256;var use=false,a=undefined,p=m;try{if (window.crypto.getRandomValues&&Uint32Array) {use=true;a=new Uint32Array(m);}}catch(e){use=false;}if (use) {return ()=>{if (p>=m) {window.crypto.getRandomValues(a);p=0;}var r=a[p]/4294967295*2-1;p++;return r;};}else {let f=()=>{let r=Math.random()*2-1;if (r==-1) return f();else return r;};return f;}})();let stArea=(a,s)=>{let o={};["x","y"].forEach(t=>{let l=[];for (var n=-2;n<3;n++) l.push(a[t]+s[t]*n);o[t]=l;});return o;};let quartile=(()=>{let f=(s,p)=>{let v=p*(s.length-1);if (v%1) {let f=Math.floor(v),c=Math.ceil(v);return s[f]*(c-v)+s[c]*(v-f);}else return s[parseInt(v)];};return ()=>{let o={x:[],y:[]};["x","y"].forEach(t=>{let l=pt.map(v=>v[t]).sort((a,b)=>Math.sign(a-b));o[t]=[f(l,0),f(l,0.25),f(l,0.5),f(l,0.75),f(l,1)];});return o;};})();let lrTrend=(a,v,m)=>{let cr=Math.abs(v.m/Math.sqrt(v.x*v.y));if (m-1) return [{x:(v.m*a.x-v.x*a.y)/v.m,y:(v.x*a.y-v.m*a.x)/v.x,p:cr}];else return [{x:(v.y*a.x-v.m*a.y)/v.y,y:(v.m*a.y-v.y*a.x)/v.m,p:cr}];};let pcTrend=(a,v)=>{let part=(v.x-v.y)/(v.m+v.m);let r1=Math.hypot(part,1);let r2=Math.sqrt(1-4*(v.x*v.y-v.m*v.m)/((v.x+v.y)**2))*Math.sign(v.m);return [{x:(a.x+(-part-r1)*a.y),y:(a.y+(+part-r1)*a.x),p:(1+r2)/2},{x:(a.x+(-part+r1)*a.y),y:(a.y+(+part+r1)*a.x),p:(1-r2)/2}];};let invErf=(()=>{let maxcalc=25;var setup=false;let s=[],c=[1];let su=()=>{let coef=Math.sqrt(Math.PI)/2;for (var k=0;k<=maxcalc;k++) {c[k]=k?0:1;if (k>0) for (var m=0;m<k;m++) c[k]+=c[m]*c[k-1-m]/(m+1)/(2*m+1);s[k]=c[k]/(2*k+1)*(coef**(2*k+1));}setup=true;};let raw=z=>{var v=0;for (var k=0;k<=maxcalc;k++) v+=s[k]*(z**(2*k+1));return v;};let calib=(z,sigma,mu)=>Math.SQRT2*sigma*raw(z)+mu;return (z,sigma,mu)=>{if (!setup) su();return calib(z,sigma,mu);};})();update(()=>{let l=pt.length;let a=pt.reduce((cum,p)=>{cum.x+=p.x/l;cum.y+=p.y/l;return cum;},{x:0,y:0});let v=pt.reduce((cum,p)=>{cum.x+=(p.x-a.x)*(p.x-a.x)/l;cum.y+=(p.y-a.y)*(p.y-a.y)/l;cum.m+=(p.x-a.x)*(p.y-a.y)/l;return cum;},{x:0,y:0,m:0});{switch (status.areaMode) {case 0:let s={x:v.x**0.5,y:v.y**0.5};pt.area=stArea(a,s);break;case 1:let ad=pt.reduce((cum,p)=>{cum.x+=Math.abs(p.x-a.x)/l;cum.y+=Math.abs(p.y-a.y)/l;return cum;},{x:0,y:0});pt.area=stArea(a,ad);break;case 2:pt.area=quartile();break;}}{let m=status.trendLineMode;if (m) pt.trend=lrTrend(a,v,m);else pt.trend=pcTrend(a,v);}});pt.random=()=>{pt.push({x:rand(),y:rand()});update();};pt.normRandom=()=>{let sigma=status.normSigma,mu=status.normMu;let f=()=>{let r=invErf(rand(),sigma,mu);if (Math.abs(r)>1) return f();else return r;};pt.push({x:f(),y:f()});update();};pt.clear=()=>{pt.length=0;update();};return pt;})([{x:-0.6,y:0.3},{x:0.2,y:-0.5}]);let mb=(d,a,r)=>{let eh=(r?()=>{var int=null,phase=0;let f=()=>{a();phase++;if (phase==3) {clearInterval(int);int=setInterval(a,100);}};return [e=>{int=setInterval(f,500);e.stopPropagation();},e=>{if (int) clearInterval(int);phase=0;int=null;e.stopPropagation();},e=>{if (int) clearInterval(int);if (phase) phase=0;else if (int) a();int=null;e.stopPropagation();}];}:()=>{var active=false;return [e=>{active=true;e.stopPropagation();},e=>{if (active) active=false;e.stopPropagation();},e=>{if (active) a();active=false;e.stopPropagation();}];})();if (status.input=="Touch") {ael(d,"touchstart",eh[0]);if (!r) ael(d,"touchmove",eh[1]);ael(d,"touchcancel",eh[1]);ael(d,"touchend",eh[2]);}else {ael(d,"mousedown",eh[0]);if (!r) ael(d,"mousemove",eh[1]);ael(d,"mouseout",eh[1]);ael(d,"mouseup",eh[2]);}return d;};let base=cd("base");{ap(base,cd("backgroundView"));let rv=ap(base,cd("rangeView"));["left","right","top","bottom"].forEach(d=>sc(ap(rv,cd()),d));ap(base,cd("statusbar"));let av=ap(base,cd("axisView"));ap(av,cd());ap(av,cd());}{let av=ap(base,cd("areaView"));let l=["horizontal","vertical"].map(c=>{let sl=[];for (var n=0;n<3;n++) sl.push(ap(av,sc(cd(),c+(n<2?"":" line"))));return sl;});update(()=>{let kl=[["left","right"],["top","bottom"]];l.forEach((sl,m)=>{let d=points.area[m?"y":"x"];let k=kl[m];sl.forEach((e,rn)=>{let n=2-rn;e.style.visibility=points.length?"visible":"hidden";e.style[k[0]]=`calc( ${(1+d[2-n])*50}% - ${n?0:3}px )`;e.style[k[1]]=`calc( ${(1-d[2+n])*50}% - ${n?0:3}px )`;});});});}{let tr=ap(base,cd("trendLineView"));let s=[ap(tr,cd()).style,ap(tr,cd()).style];let tlDraw=(s,t)=>{let sq=status.squared;var px;if (sq) px=t;else px={x:t.x*html.clientWidth/2,y:t.y*html.clientHeight/2};let r=Math.hypot(px.x,px.y);let R2=1/(px.x**(-2)+px.y**(-2));if (sq) s.transform=`translate(calc( ${R2/px.x} * var(--half-square-size) ),calc( ${R2/px.y} * var(--half-square-size) )) matrix(${px.x/r},${-px.y/r},${px.y/r},${px.x/r},0,0)`;else s.transform=`matrix(${px.x/r},${-px.y/r},${px.y/r},${px.x/r},${R2/px.x},${R2/px.y})`;s.opacity=t.p;};update(()=>{if (points.length<2) s.forEach(s=>s.visibility="hidden");else {let t=points.trend;s[0].visibility="visible";s[1].visibility=(t.length-1)?"visible":"hidden";for (var n=0;n<t.length;n++) tlDraw(s[n],t[n]);}},true);}{let pv=ap(base,cd("plotView"));let nodes=[];update(()=>{while (nodes.length-points.length) {if (nodes.length>points.length) {rc(nodes[0]);nodes.shift();}else nodes.push(ap(pv,cd()));}});update(()=>{let t=status.input=="Touch"?20:10;let f=v=>`calc( ${v*50}% - ${t}px )`;for (var n=0;n<nodes.length;n++) {let s=nodes[n].style,p=points[n];s.left=f(1+p.x);s.right=f(1-p.x);s.top=f(1+p.y);s.bottom=f(1-p.y);}});}{let iv=ap(base,cd("inputView"));let get=t=>{let cr=iv.getBoundingClientRect();return {x:t.clientX-cr.left,y:t.clientY-cr.top};};let p2c=p=>{p.x=p.x/(iv.clientWidth/2)-1;p.y=p.y/(iv.clientHeight/2)-1;};let c2p=p=>{return {x:(p.x+1)*(iv.clientWidth/2),y:(p.y+1)*(iv.clientHeight/2)};};let find=p=>{let R=status.input=="Touch"?30:10;let r=points.find(pt=>{let px=c2p(pt);return Math.hypot(p.x-px.x,p.y-px.y)<=R;});p2c(p);return r;};let sp=e=>{e.stopPropagation();e.preventDefault();};if (status.input=="Touch") {let focus=[];ael(iv,"touchstart",e=>{Array.from(e.changedTouches).forEach(t=>{let p=get(t);let pt=find(p);if (pt) {focus.push(pt);pt.x=p.x;pt.y=p.y;}else {focus.push(p);points.push(p);}});status.moving=true;update();sp(e);});ael(iv,"touchmove",e=>{if (focus.length==e.targetTouches.length) {Array.from(e.targetTouches).forEach((t,n)=>{let p=get(t);p2c(p);focus[n].x=p.x;focus[n].y=p.y;});update();}sp(e);});let te=e=>{focus.length=0;Array.from(e.targetTouches).forEach(t=>{let pt=find(get(t));if (pt) focus.push(pt);});if (focus.length) status.moving=false;update();sp(e);};ael(iv,"touchend",te);ael(iv,"touchcancel",te);}else {var focus=null;ael(iv,"mousedown",e=>{let p=get(e);let pt=find(p);if (pt) {focus=pt;pt.x=p.x;pt.y=p.y;}else {focus=p;points.push(p);}update();sp(e);});ael(iv,"mousemove",e=>{if (focus) {status.moving=true;let p=get(e);p2c(p);focus.x=p.x;focus.y=p.y;update();}sp(e);});let mu=e=>{focus=null;status.moving=false;sp(e);};ael(iv,"mouseup",mu);ael(iv,"mouseout",mu);}}{let mv=ap(base,cd("menuView"));let ms=ap(mv,cd("menuShadow"));let m=ap(ap(mv,cd("menuContainer")),cd("menu"));let close=()=>status.menuShown=false;mb(ms,close);if (!status.colorSchemePreferred) mb(ap(m,cd(null,"CS")),()=>{status.dark=!status.dark;});mb(ap(m,cd(null,"CL")),points.clear);mb(ap(m,cd(null,"SQ")),()=>{status.squared=!status.squared;update();});let am=mb(ap(m,cd(null,"σ")),()=>{let s=(status.areaMode+1)%3;status.areaMode=s;am.textContent=(["σ","AD","Q"])[s];update();});let tlm=mb(ap(m,cd(null,"PC")),()=>{let s=(status.trendLineMode+1)%3;status.trendLineMode=s;tlm.textContent=(["PC","X-Y","Y-X"])[s];update();});mb(ap(m,cd(null,"⚀")),()=>{points.random();},true);mb(ap(m,cd(null,"N ⚀")),()=>{points.normRandom();},true);mb(ap(m,cd(null,"×")),close);mb(ap(base,cd("menuButton")),()=>status.menuShown=!status.menuShown);}})();