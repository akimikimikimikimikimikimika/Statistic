window.framework("menu",(func,status,calc,renderer,cd,ap,sa,ss,ael)=>{

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
	func.cueManager(()=>true)(3,false,()=>{
		rb.textContent=renderer.icon;
		areaMode.textContent=(["σ","AD","Q"])[status.areaMode];
		bc(SQ,"squared","--turned-on");
		bc(X,"x","--area-x-color");
		bc(Y,"y","--area-y-color");
		bc(PC,"pc","--area-pc-color");
		bc(XY,"xy","--area-xy-color");
		bc(YX,"yx","--area-yx-color");
		bc(OV,"oval","--turned-on");
		unbiased.textContent=(["B","UB"])[status.unbiased];
		bc(unbiased,"unbiased","--turned-on");
	});
	let bc=(b,s,h)=>ss(b,"background-color",status[s]?`var(${h})`:"");

	/* Menu buttons */
	mb("CS",()=>func.scheme());
	let rb=mb("",()=>{
		renderer.next();
		func.update();
	});
	mb("CL",()=>calc.clear());
	let SQ=mb("SQ",()=>{
		func.switch("squared",2);
	});
	let X=mb("X",()=>{
		func.switch("x",3);
	});
	let Y=mb("Y",()=>{
		func.switch("y",3);
	});
	let areaMode=mb("",()=>{
		func.switch("areaMode",3);
	});
	let PC=mb("PC",()=>{
		func.switch("pc",3);
	});
	let XY=mb("X-Y",()=>{
		func.switch("xy",3);
	});
	let YX=mb("Y-X",()=>{
		func.switch("yx",3);
	});
	let OV=mb("OV",()=>{
		func.switch("oval",2);
	});
	let unbiased=mb("",()=>{
		func.switch("unbiased",2);
	});
	mb("⚀",()=>calc.random(),true);
	mb("N ⚀",()=>calc.normRandom(),true);
	mb("×",close);

	let b=mb(cd("menuButton"),()=>status.menuShown=!status.menuShown);

	return {
		view:mv,
		button:b
	};

});