window.framework("xhtml",(func,status,calc,cd,ap,rc,tc,ss,bcr)=>{

	let r={
		name:"XHTML",
		icon:"HT",
		artifact:null,
		includeRange:true,
		visible:false,
		/* Called when this renderer is to be used */
		setup:()=>{
			let d=cd(null,"html");
			ap(d,axisSetup());
			ap(d,areaSetup());
			ap(d,plotSetup());
			r.artifact=d;
		}
	};

	let addCue=func.cueManager(()=>r.visible);

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
			for (let v of ["line","area1","area2"]) {
				if (c=="oval"&&v=="line") continue;
				let e=ap(p,cd());
				tc(e,v);
			};
			return p;
		});

		/* area modifier */
		let modify=(e,d)=>{
			if (!d.oval) {
				if (d.view) {
					var a=d.a,b=d.b,c=d.c;
					if (!status.squared) {
						let cr=rect();
						let ah=a*cr.h,bw=b*cr.w,ch=c.map(c=>c*cr.h);
						let r=hypot(ah,bw);
						a=ah/r,b=bw/r,c=ch.map(ch=>ch/r);
					}
					ss(e,"--theta",degree(atan2(b,a))+"deg");
					c.forEach((v,i)=>ss(e,"--r"+i,`${(d.view-1)?v:c[2]}`));
					ss(e,"--rate",`${d.p}`);
				}
				else ["--theta","--r0","--r1","--r2","--r3","--r4","--rate"].forEach(k=>ss(e,k));
			}
			else {
				if (d.view) {
					let m=[];
					for (var n=0;n<4;n++) m[n]=(n%2?d.b:d.a)*(n%3?sin(d.θ):cos(d.θ))*(n==1?-1:1);
					let inv=inverseMatrix.apply({},m);
					if (!status.squared) {
						let cr=rect();
						m[1]*=cr.w/cr.h;
						m[2]*=cr.h/cr.w;
					}
					["xx","xy","yx","yy"].forEach((k,i)=>ss(e,"--m"+k,m[i]));
					ss(e,"--cx",d.cx*inv[0]+d.cy*inv[1]);
					ss(e,"--cy",d.cx*inv[2]+d.cy*inv[3]);
				}
				else ["--mxx","--mxy","--myx","--myy","--cx","--cy"].forEach(k=>ss(e,k));
			}
		};
		/*
			e: node
			d: calculated data
		*/
		/* get rect */
		let rect=()=>{
			let r=bcr(v);
			return {w:r.width/2,h:r.height/2};
		};

		/* main update function */
		let update=()=>{
			modify(l[0],calc.xy[0]);
			modify(l[1],calc.xy[1]);
			modify(l[2],calc.pc[0]);
			modify(l[3],calc.pc[1]);
			modify(l[4],calc.lr[0]);
			modify(l[5],calc.lr[1]);
			modify(l[6],calc.oval);
		};

		addCue(2,false,update);
		addCue(1,true,update);
		return v;

	};

	/* plot */
	let plotSetup=()=>{

		let v=cd("plot");

		let nodes=[];
		let pt=calc.points;

		/* insert/delete nodes to match nodes to points data */
		func.update(()=>{
			while (nodes.length-pt.length) {
				if (nodes.length>pt.length) {
					rc(nodes[0]);
					nodes.shift();
				}
				else nodes.push(ap(v,cd()));
			}
		});

		/* apply data to nodes */
		func.update(()=>{
			nodes.forEach((e,n)=>{
				let p=pt[n];
				ss(e,"--x",p.x);
				ss(e,"--y",p.y);
			});
		});

		return v;

	};

	return r;

});