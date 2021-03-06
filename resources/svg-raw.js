window.framework("svg",(func,calc,cd,cse,ap,rc,tc,sa,ss,bcr)=>{

	var L=0,R=0,T=0,B=0,W=0,H=0,M=0;
	/*
		viewBox of svg
		status.squared is false: [-W,+W]×[-H,+H]
		status.squared is true:  [-L-W,+R+W]×[-T-H,+B+H]
	*/

	let r={
		name:"SVG",
		icon:"SV",
		artifact:null,
		includeRange:false,
		visible:false,
		/* Called when this renderer is to be used */
		setup:range=>{
			let d=cd(null,"svg");
			let s=svgSetup(range);
			ap(d,s);
			ap(s,axisSetup());
			ap(s,areaSetup());
			ap(s,rangeSetup());
			ap(s,plotSetup());
			r.artifact=d;
		}
	};

	let addCue=func.cueManager(()=>r.visible);

	let svgSetup=range=>{
		let s=cse("svg");
		sa(s,"preserveAspectRatio","none");
		addCue(2,true,()=>{
			L=bcr(range.left).width;
			R=bcr(range.right).width;
			T=bcr(range.top).height;
			B=bcr(range.bottom).height;
		});
		addCue(1,false,()=>L=R=T=B=0);
		addCue(3,true,()=>{
			let w=bcr(s).width,h=bcr(s).height;
			W=(w-L-R)/2,H=(h-T-B)/2;
			M=max(w/W,h/H);
			sa(s,"width",w),sa(s,"height",h);
			sa(s,"viewBox",`${-W-L} ${-H-T} ${2*W+L+R} ${2*H+T+B}`);
		});
		return s;
	};

	let axisSetup=()=>{
		let e=sa(cse("path"),"id","axis");
		addCue(3,true,()=>sa(e,"d",`M ${-W-L},0 H ${+W+R} M 0,${-H-T} V ${+H+B}`));
		return e;
	};

	let areaSetup=()=>{

		let v=sa(cse("g"),"id","area");

		let l=["x","y","pc1","pc2","xy","yx","oval"].map(c=>{
			let p=ap(v,cse("g"));
			tc(p,c);
			for (var n=0;n<3;n++) {
				if (c=="oval") {
					if (n) sa(sa(ap(p,cse("ellipse")),"cx","0"),"cy","0");
					else continue;
				}
				else ap(p,cse(n?"polygon":"line"));
			}
			return p;
		});

		/* area modifier */
		let modify=(e,d)=>{
			if (d.view) {
				if (!d.oval) {
					let a=d.a,b=d.b,c=d.c;
					ss(e,"--rate",`${d.p}`);
					e.childNodes.forEach((e,n)=>{
						let c1=(d.view-1)?c[2-n]:c[2],c2=(d.view-1)?c[2+n]:c[2];
						/* c1×(a,b)+M×(±a,∓b),c2×(a,b)+M×(±a,∓b) */
						if (n) sa(e,"points",`${W*(c1*a+M*b)},${H*(c1*b-M*a)} ${W*(c1*a-M*b)},${H*(c1*b+M*a)} ${W*(c2*a-M*b)},${H*(c2*b+M*a)} ${W*(c2*a+M*b)},${H*(c2*b-M*a)}`);
						else sa(e,"x1",W*(c1*a+M*b)),sa(e,"y1",H*(c1*b-M*a)),sa(e,"x2",W*(c1*a-M*b)),sa(e,"y2",H*(c1*b+M*a));
					});
				}
				else {
					let r=hypot(W,H);
					ss(e,"--rate",1);
					let t=`matrix(${W/r*cos(d.θ)},${H/r*sin(d.θ)},${-W/r*sin(d.θ)},${H/r*cos(d.θ)},${W*d.cx},${H*d.cy})`;
					e.childNodes.forEach((e,n)=>{
						sa(e,"rx",`${r*d.a*(2-n)}`);
						sa(e,"ry",`${r*d.b*(2-n)}`);
						sa(e,"transform",t);
					});
				}
			}
			else {
				sa(e,"style");
				for (let c of e.childNodes) for (let k of ["x1","x2","y1","y2","points","cx","cy","rx","ry","transform"]) sa(c,k);
			}
		};
		/*
			e: node
			d: calculated data
		*/

		/* main update function */
		addCue(3,true,()=>{
			modify(l[0],calc.xy[0]);
			modify(l[1],calc.xy[1]);
			modify(l[2],calc.pc[0]);
			modify(l[3],calc.pc[1]);
			modify(l[4],calc.lr[0]);
			modify(l[5],calc.lr[1]);
			modify(l[6],calc.oval);
		});

		return v;

	};

	let rangeSetup=()=>{

		let v=sa(cse("polygon"),"id","range");

		addCue(2,true,()=>sa(v,"points",`${-W-L},${-H-T} ${+W+R},${-H-T} ${+W+R},${+H+B} ${-W-L},${+H+B} ${-W-L},${-H-T} ${-W},${-H} ${-W},${+H} ${+W},${+H} ${+W},${-H} ${-W},${-H}`));
		addCue(1,false,()=>sa(v,"points"));

		return v;

	};

	let plotSetup=()=>{

		let v=sa(cse("g"),"id","plot");

		let nodes=[];
		let pt=calc.points;

		/* insert/delete nodes to match nodes to points data */
		addCue(3,false,()=>{
			while (nodes.length-pt.length) {
				if (nodes.length>pt.length) {
					rc(nodes[0]);
					nodes.shift();
				}
				else {
					let e=ap(v,cse("circle"));
					nodes.push(e);
				}
			}
		});

		/* apply data to nodes */
		addCue(3,true,()=>{
			nodes.forEach((e,n)=>{
				let p=pt[n];
				sa(e,"cx",p.x*W);
				sa(e,"cy",p.y*H);
				sa(e,"r",func.plotRadius());
			});
		});

		return v;
	};

	return r;

});