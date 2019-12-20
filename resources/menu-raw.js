(()=>{

	let ce=t=>document.createElement(t),cd=(i,c,t)=>{let d=ce("div");if (i) d.id=i;if (c) d.className=c;if (t) d.textContent=t;return d;},ap=(p,c)=>p.appendChild(c),sa=(e,k,v)=>e.setAttribute(k,v),ael=(e,t,f)=>e.addEventListener(t,f);

	var funcs,status,calc;

	/* Convert a div element to button */
	let mb=(t,a,r)=>{
		/* r is a bool value that determines whether continuous press should be detected. */

		var d;
		if (typeof(t)=="string") d=ap(m,cd(null,null,t));
		else d=t;

		sa(d,"role","button");

		var active=false; /* for normal button */
		var int=null,phase=0; /* for recursive button */

		var disable;

		/* Called when the button press begins */
		ael(d,"pointerdown",e=>{
			if (r) int=setInterval(()=>{
				a();
				phase++;
				if (phase==3) {
					clearInterval(int);
					int=setInterval(a,100);
				}
			},500);
			else active=true;
			e.stopPropagation();
		});
		/* Called when the button press aborts */
		disable=e=>{
			if (r) {
				if (int) clearInterval(int);
				phase=0;
				int=null;
			}
			else if (active) active=false;
			e.stopPropagation();
		};
		/* Called when the button press ends */
		ael(d,"pointerup",e=>{
			if (r) {
				if (int) clearInterval(int);
				if (phase) phase=0;
				else if (int) a();
				int=null;
			}
			else if (active) a();
			active=false;
			e.stopPropagation();
		});
		ael(d,"pointermove",disable);
		ael(d,"pointercancel",disable);
		ael(d,"pointerout",disable);
		ael(d,"pointerleave",disable);

		return d;
	};

	/* Create menu nodes */
	let mv=cd("menuView");
	let ms=ap(mv,cd("menuShadow"));
	let m=ap(ap(mv,cd("menuContainer")),cd("menu"));

	let close=()=>status.menuShown=false;
	mb(ms,close);

	/* update button label */
	let update=()=>{
		areaMode.textContent=(["σ","AD","Q"])[status.areaMode];
		bc(SQ,"squared","--turned-on");
		bc(X,"x","--area-x-color");
		bc(Y,"y","--area-y-color");
		bc(PC,"pc","--area-pc-color");
		bc(XY,"xy","--area-xy-color");
		bc(YX,"yx","--area-yx-color");
		bc(OV,"oval","--turned-on");
		unbiased.textContent=(["B","UB"])[status.unbiased];
	};
	let bc=(b,s,h)=>{
		b.style.backgroundColor=status[s]?`var(${h})`:"";
	};

	/* Menu buttons */
	mb("CS",()=>funcs.scheme());
	mb("CL",()=>calc.clear());
	let SQ=mb("SQ",()=>{
		funcs.switch("squared",2);
	});
	let X=mb("X",()=>{
		funcs.switch("x",3);
	});
	let Y=mb("Y",()=>{
		funcs.switch("y",3);
	});
	let areaMode=mb("",()=>{
		funcs.switch("areaMode",3);
	});
	let PC=mb("PC",()=>{
		funcs.switch("pc",3);
	});
	let XY=mb("X-Y",()=>{
		funcs.switch("xy",3);
	});
	let YX=mb("Y-X",()=>{
		funcs.switch("yx",3);
	});
	let OV=mb("OV",()=>{
		funcs.switch("oval",2);
	});
	let unbiased=mb("",()=>{
		funcs.switch("unbiased",2);
	});
	mb("⚀",()=>calc.random(),true);
	mb("N ⚀",()=>calc.normRandom(),true);
	mb("×",close);

	let b=mb(cd("menuButton"),()=>status.menuShown=!status.menuShown);

	let o={
		view:mv,
		button:b,
		update:update
	};

	window.res("menu",(f,s,c)=>{
		funcs=f,status=s,calc=c;
		funcs.update(update);
		return o;
	});

})();