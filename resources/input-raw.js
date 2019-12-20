(()=>{

	let ael=(e,t,f)=>e.addEventListener(t,f);

	var funcs,status,calc;

	let i=document.createElement("div");
	i.id="inputView";

	/* remove item of array "a" with index "i" */
	let remove=(a,i)=>{
		if (i==0) a.shift();
		else if (i==(a.length-1)) a.pop();
		else {
			for (var n=i;n<(a.length-1);n++) a[n]=a[n+1];
			a.length--;
		}
	};

	let focus=[];
	var radius;
	/* start pointer watching: create pointer data from PointerEvent and find the closest point or create one. */
	let start=e=>{
		if (focus.length==0) status.moving=true;
		let r=rect();
		let x=(e.clientX-r.l)-r.w,y=(e.clientY-r.t)-r.h;
		let f={
			dx:0,
			dy:0,
			pt:null,
			id:e.pointerId
		};
		f.pt=calc.points.find(pt=>{
			let dx=x-pt.x*r.w,dy=y-pt.y*r.h;
			let b=Math.hypot(dx,dy)<=radius;
			if (b) f.dx=dx,f.dy=dy,f.pt=pt;
			return b;
		});
		if (!f.pt) {
			f.pt={x:x/r.w,y:y/r.h};
			calc.points.push(f.pt);
		}
		focus.push(f);
		funcs.update();
	};
	/* change pointer data */
	let modify=e=>{
		let f=focus.find(f=>f.id==e.pointerId);
		let r=rect();
		if (!f) return;
		let x=(e.clientX-r.l)-r.w,y=(e.clientY-r.t)-r.h;
		f.pt.x=(x-f.dx)/r.w;
		f.pt.y=(y-f.dy)/r.h;
		funcs.update();
	};
	/* end pointer watching */
	let end=e=>{
		let i=focus.findIndex(f=>f.id==e.pointerId);
		if (i<0) return;
		remove(focus,i);
		if (focus.length==0) status.moving=false;
	};

	/* stop propagation */
	let sp=e=>{
		e.stopPropagation();
		e.preventDefault();
	};

	/* get half rect size (width/2,height/2) */
	let rect=()=>{
		let cr=i.getBoundingClientRect();
		return {w:cr.width/2,h:cr.height/2,l:cr.left,t:cr.top};
	};

	/* pointer event listener */
	(()=>{
		ael(i,"pointerdown",e=>{
			start(e);
			sp(e);
		});
		ael(i,"pointermove",e=>{
			modify(e);
			sp(e);
		});
		ael(i,"pointerup",e=>{
			end(e);
			sp(e);
		});
		ael(i,"pointercancel",e=>{
			end(e);
			sp(e);
		});
		ael(i,"pointerout",e=>{
			end(e);
			sp(e);
		});
		ael(i,"pointerleave",e=>{
			end(e);
			sp(e);
		});
	})();

	/* keyboard event listener */
	ael(window,"keyup",e=>{
		switch (e.key) {
			case "s":case "S":funcs.scheme();break;
			case "c":case "C":calc.clear();break;
			case "q":case "Q":funcs.switch("squared",2);break;
			case "x":case "X":funcs.switch("x",3);break;
			case "y":case "Y":funcs.switch("y",3);break;
			case "a":case "A":funcs.switch("areaMode",3);break;
			case "p":case "P":funcs.switch("pc",3);break;
			case "d":case "D":funcs.switch("xy",3);break;
			case "g":case "G":funcs.switch("yx",3);break;
			case "o":case "O":funcs.switch("oval",2);break;
			case "b":case "B":funcs.switch("unbiased",2);break;
			case "m":case "M":status.menuShown=!status.menuShown;break;
		}
	});
	ael(window,"keypress",e=>{
		switch (e.key) {
			case "n":case "N":calc.normRandom();break;
			case "m":case "M":status.menuShown=!status.menuShown;break;
		}
	});

	window.res("input",(f,s,c)=>{
		funcs=f,status=s,calc=c;
		radius=status.touch?30:10;
		return i;
	});

})();