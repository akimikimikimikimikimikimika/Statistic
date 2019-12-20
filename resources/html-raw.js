(()=>{

	let cd=i=>{let d=document.createElement("div");if (i) d.id=i;return d;},ap=(p,c)=>p.appendChild(c),rc=c=>c.parentNode.removeChild(c),tc=(e,c)=>e.classList.toggle(c),sa=(e,k,v)=>e.setAttribute(k,v);

	var status,funcs,calc;

	let r={
		name:"HTML",
		icon:"HT",
		artifact:null,
		range:null,
		/* Called when this renderer is to be used */
		setup:()=>{
			let d=cd("drawView");
			tc(d,"html");
			r.range=ap(d,rangeSetup());
			ap(d,axisSetup());
			ap(d,areaSetup());
			ap(d,plotSetup());
			r.artifact=d;
		}
	};

	/* range */
	let rangeSetup=()=>{
		let v=cd("range");
		["left","right","top","bottom"].forEach(d=>tc(ap(v,cd()),d));
		return v;
	};

	/* axis */
	let axisSetup=()=>{
		let v=cd("axis");
		ap(v,cd());
		ap(v,cd());
		return v;
	};

	/* area */
	let areaSetup=()=>{

		let v=cd("area");

		let l=["x","y","pc1","pc2","xy","yx","oval"].map(c=>{
			let p=ap(v,cd());
			tc(p,c);
			["line","area1","area2"].forEach(v=>{
				if (c=="oval"&&v=="line") return;
				let e=ap(p,cd());
				tc(e,v);
			});
			return p.style;
		});

		/* area modifier */
		let modify=(s,d,min,sw,t)=>{
			let w=(calc.points.length>=min)&&sw;
			if (!t) {
				if (w) {
					var a=d.a,b=d.b,c=d.c;
					if (!status.squared) {
						let cr=rect();
						let ah=a*cr.h,bw=b*cr.w,ch=c.map(c=>c*cr.h);
						let r=hypot(ah,bw);
						a=ah/r,b=bw/r,c=ch.map(ch=>ch/r);
					}
					s.setProperty("--theta",degree(atan2(b,a))+"deg");
					c.forEach((v,i)=>s.setProperty("--r"+i,(sw-1)?v:c[2]));
					s.setProperty("--rate",d.p);
				}
				else ["--theta","--r0","--r1","--r2","--r3","--r4","--rate"].forEach(v=>s.removeProperty(v));
			}
			else {
				if (w) {
					let m=[];
					for (var n=0;n<4;n++) m[n]=(n%2?d.b:d.a)*(n%3?sin(d.θ):cos(d.θ))*(n==1?-1:1);
					let inv=inverseMatrix.apply({},m);
					if (!status.squared) {
						let cr=rect();
						m[1]*=cr.w/cr.h;
						m[2]*=cr.h/cr.w;
					}
					["xx","xy","yx","yy"].forEach((k,i)=>s.setProperty("--m"+k,m[i]));
					s.setProperty("--cx",d.cx*inv[0]+d.cy*inv[1]);
					s.setProperty("--cy",d.cx*inv[2]+d.cy*inv[3]);
				}
				else ["--mxx","--mxy","--myx","--myy","--cx","--cy"].forEach(v=>s.removeProperty(v));
			}
		};
		/*
			s: style in node
			d: calculated data
			min: minimum number of points (if points<min, the line will be hidden)
			sw: turn visible/invisible forcedly regardless of points + draw mode
			t: false for rectangle, true for oval
		*/
		/* get rect */
		let rect=()=>{
			let r=v.getBoundingClientRect();
			return {w:r.width/2,h:r.height/2};
		};

		/* main update function */
		let update=()=>{
			modify(l[0],calc.xy[0],1,status.x);
			modify(l[1],calc.xy[1],1,status.y);
			modify(l[2],calc.pc[0],2,status.pc);
			modify(l[3],calc.pc[1],2,status.pc);
			modify(l[4],calc.lr[0],2,status.xy);
			modify(l[5],calc.lr[1],2,status.yx);
			modify(l[6],calc.oval,3,status.oval,true);
		};

		funcs.update(update);
		funcs.update(()=>{
			if (!status.squared) update();
		},true);

		return v;

	};

	/* plot */
	let plotSetup=()=>{

		let v=cd("plot");

		let nodes=[];
		let pt=calc.points;

		/* insert/delete nodes to match nodes to points data */
		funcs.update(()=>{
			while (nodes.length-pt.length) {
				if (nodes.length>pt.length) {
					rc(nodes[0]);
					nodes.shift();
				}
				else nodes.push(ap(v,cd()));
			}
		});

		/* apply data to nodes */
		funcs.update(()=>{
			let t=status.touch?20:10;
			let f=v=>`calc( ${v*50}% - ${t}px )`;
			nodes.forEach((e,n)=>{
				let s=e.style,p=pt[n];
				s.left=f(1+p.x);
				s.right=f(1-p.x);
				s.top=f(1+p.y);
				s.bottom=f(1-p.y);
			});
		});

		return v;

	};

	window.res("html",(f,s,c)=>{
		funcs=f,status=s,calc=c;
		return r;
	});

})();