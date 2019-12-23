window.framework("canvas",(func,status,calc,cd,che,ap,gs,bcr)=>{

	var L=0,R=0,T=0,B=0,W=0,H=0,M=0,pr,cv,ct;
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
		pr=window.devicePixelRatio;
		addCue(2,true,()=>{
			L=bcr(range.left).width*pr;
			R=bcr(range.right).width*pr;
			T=bcr(range.top).height*pr;
			B=bcr(range.bottom).height*pr;
		});
		addCue(1,false,()=>L=R=T=B=0);
		addCue(3,true,()=>{
			let w=bcr(cv).width,h=bcr(cv).height,pr=window.devicePixelRatio;
			W=(w*pr-L-R)/2,H=(h*pr-T-B)/2;
			M=max(w*pr/W,h*pr/H);
			cv.width=w*pr,cv.height=h*pr;
			ct.clearRect(0,0,w*pr,h*pr);
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
			ct.strokeStyle=gs(cv,"--axis-color",true);
			ct.lineWidth=1*pr;
			ct.stroke();
		});
	};

	let areaSetup=()=>{

		/* area modifier */
		let modify=(v,d,min,sw,t)=>{
			let w=(calc.points.length>=min)&&sw;
			if (!w) return;
			if (!t) {
				let a=d.a,b=d.b,c=d.c;
				for (var n=0;n<3;n++) {
					let c1=(sw-1)?c[2-n]:c[2],c2=(sw-1)?c[2+n]:c[2];
					/* c1×(a,b)+M×(±a,∓b),c2×(a,b)+M×(±a,∓b) */
					ct.beginPath();
					ct.moveTo(W*(c1*a+M*b),H*(c1*b-M*a));
					ct.lineTo(W*(c1*a-M*b),H*(c1*b+M*a));
					if (n) {
						ct.lineTo(W*(c2*a-M*b),H*(c2*b+M*a));
						ct.lineTo(W*(c2*a+M*b),H*(c2*b-M*a));
						ct.closePath();
						if (status.printing) {
							ct.strokeStyle=gs(cv,`--area-${v}-color`,true);
							ct.strokeWidth=1*pr;
							ct.stroke();
						}
						else {
							ct.fillStyle=hex2rgba(gs(cv,`--area-${v}-color`,true),d.p*0.3+0.1);
							ct.fill();
						}
					}
					else {
						ct.closePath();
						ct.strokeStyle=hex2rgba(gs(cv,`--area-${v}-color`,true),d.p*0.6+0.2);
						ct.lineWidth=(status.printing?1:6)*pr;
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
						ct.strokeStyle=gs(cv,"--area-oval-color",true);
						ct.lineWidth=2*pr;
						ct.stroke();
					}
					else {
						ct.fillStyle=hex2rgba(gs(cv,"--area-oval-color",true),0.5);
						ct.fill();
					}
				}
				ct.restore();
			}
		};
		/*
			v: CSS variable (identifier)
			d: calculated data
			min: minimum number of points (if points<min, the line will be hidden)
			sw: turn visible/invisible forcedly regardless of points + draw mode
			t: false for rectangle, true for oval
		*/

		/* main update function */
		addCue(3,true,()=>{
			modify("x",calc.xy[0],1,status.x);
			modify("y",calc.xy[1],1,status.y);
			modify("pc",calc.pc[0],2,status.pc);
			modify("pc",calc.pc[1],2,status.pc);
			modify("xy",calc.lr[0],2,status.xy);
			modify("yx",calc.lr[1],2,status.yx);
			modify("oval",calc.oval,3,status.oval,true);
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
			ct.fillStyle=hex2rgba(gs(cv,"--square-shadow",true),0.4);
			ct.fill();
		});

	};

	let plotSetup=()=>{

		let pt=calc.points;
		let r=(status.touch?20:10)*pr;

		/* apply data to nodes */
		addCue(3,true,()=>{
			ct.beginPath();
			for (let p of pt) {
				let x=W*p.x,y=H*p.y;
				ct.moveTo(x+r,y);
				ct.arc(x,y,r,0,2*PI);
			}
			ct.fillStyle=gs(cv,"--plot-color",true);
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