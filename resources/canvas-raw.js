window.framework("canvas",(func,status,calc,cd,che,ap,bcr,dpr)=>{

	var L=0,R=0,T=0,B=0,W=0,H=0,M=0,cv,ct;
	/*
		viewBox of canvas
		status.squared is false: [-W,+W]×[-H,+H]
		status.squared is true:  [-L-W,+R+W]×[-T-H,+B+H]
	*/

	let r={
		name:"Canvas",
		icon:"CV",
		artifact:null,
		includeRange:false,
		visible:false,
		/* Called when this renderer is to be used */
		setup:range=>{
			let d=cd(null,"canvas");
			ap(d,canvasSetup(range));
			axisSetup();
			areaSetup();
			rangeSetup();
			plotSetup();
			r.artifact=d;
		}
	};

	let addCue=func.cueManager(()=>r.visible);

	let canvasSetup=range=>{
		cv=che("canvas");
		ct=cv.getContext("2d");
		addCue(2,true,()=>{
			L=bcr(range.left).width*dpr;
			R=bcr(range.right).width*dpr;
			T=bcr(range.top).height*dpr;
			B=bcr(range.bottom).height*dpr;
		});
		addCue(1,false,()=>L=R=T=B=0);
		addCue(3,true,()=>{
			let w=bcr(cv).width,h=bcr(cv).height;
			W=(w*dpr-L-R)/2,H=(h*dpr-T-B)/2;
			M=max(w*dpr/W,h*dpr/H);
			cv.width=w*dpr,cv.height=h*dpr;
			ct.clearRect(0,0,w*dpr,h*dpr);
			ct.setTransform(1,0,0,1,L+W,T+H);
		});
		return cv;
	};

	let axisSetup=()=>{
		addCue(3,true,()=>{
			ct.beginPath();
			ct.moveTo(-W-L,0);
			ct.lineTo(+W+R,0);
			ct.moveTo(0,-H-T);
			ct.lineTo(0,+H+B);
			ct.strokeStyle=func.style("--axis-color");
			ct.lineWidth=1*dpr;
			ct.stroke();
		});
	};

	let areaSetup=()=>{

		/* area modifier */
		let modify=(v,d)=>{
			if (!d.view) return;
			let cl=func.style(`--area-${v}-color`);
			if (!d.oval) {
				let a=d.a,b=d.b,c=d.c;
				for (var n=0;n<3;n++) {
					let c1=(d.view-1)?c[2-n]:c[2],c2=(d.view-1)?c[2+n]:c[2];
					/* c1×(a,b)+M×(±a,∓b),c2×(a,b)+M×(±a,∓b) */
					ct.beginPath();
					ct.moveTo(W*(c1*a+M*b),H*(c1*b-M*a));
					ct.lineTo(W*(c1*a-M*b),H*(c1*b+M*a));
					if (n) {
						ct.lineTo(W*(c2*a-M*b),H*(c2*b+M*a));
						ct.lineTo(W*(c2*a+M*b),H*(c2*b-M*a));
						ct.closePath();
						if (status.printing) {
							ct.strokeStyle=cl;
							ct.strokeWidth=1*dpr;
							ct.stroke();
						}
						else {
							ct.fillStyle=hex2rgba(cl,d.p*0.3+0.1);
							ct.fill();
						}
					}
					else {
						ct.closePath();
						ct.strokeStyle=hex2rgba(cl,d.p*0.6+0.2);
						ct.lineWidth=(status.printing?1:6)*dpr;
						ct.stroke();
					}
				}
			}
			else {
				ct.save();
				let r=hypot(W,H);
				ct.transform(W/r,0,0,H/r,W*(d.cx),H*(d.cy));
				for (var n=0;n<2;n++) {
					ct.beginPath();
					ct.ellipse(0,0,r*d.a*(2-n),r*d.b*(2-n),d.θ,0,2*PI);
					if (status.printing) {
						ct.strokeStyle=cl;
						ct.lineWidth=2*dpr;
						ct.stroke();
					}
					else {
						ct.fillStyle=hex2rgba(cl,0.5);
						ct.fill();
					}
				}
				ct.restore();
			}
		};
		/*
			v: CSS variable (identifier)
			d: calculated data
		*/

		/* main update function */
		addCue(3,true,()=>{
			modify("x",calc.xy[0]);
			modify("y",calc.xy[1]);
			modify("pc",calc.pc[0]);
			modify("pc",calc.pc[1]);
			modify("xy",calc.lr[0]);
			modify("yx",calc.lr[1]);
			modify("oval",calc.oval);
		});

	};

	let rangeSetup=()=>{

		addCue(2,true,()=>{
			ct.beginPath();
			ct.moveTo(-W-L,-H-T);
			ct.lineTo(+W+R,-H-T);
			ct.lineTo(+W+R,+H+B);
			ct.lineTo(-W-L,+H+B);
			ct.lineTo(-W-L,-H-T);
			ct.lineTo(-W,-H);
			ct.lineTo(-W,+H);
			ct.lineTo(+W,+H);
			ct.lineTo(+W,-H);
			ct.lineTo(-W,-H);
			ct.closePath();
			ct.fillStyle=hex2rgba(func.style("--square-shadow"),0.4);
			ct.fill();
		});

	};

	let plotSetup=()=>{

		let pt=calc.points;

		/* apply data */
		addCue(3,true,()=>{
			ct.beginPath();
			let r=func.plotRadius()*dpr;
			for (let p of pt) {
				let x=W*p.x,y=H*p.y;
				ct.moveTo(x+r,y);
				ct.arc(x,y,r,0,2*PI);
			}
			ct.fillStyle=func.style("--plot-color");
			ct.fill();
		});

	};

	let hex2rgba=(h,a)=>{
		let c=h.match(/\#([0-f]{2})([0-f]{2})([0-f]{2})/i);
		c.shift();
		return `rgba(${c.map(v=>parseInt(v,16)).join(",")},${a})`;
	};

	return r;

});