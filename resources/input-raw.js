window.framework("input",(func,status,calc,renderer,cd,ael)=>{

	let i=cd("inputView");

	let focus=[];
	let radius=status.touch?30:10;

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
		func.update();
	};
	/* change pointer data */
	let modify=e=>{
		let f=focus.find(f=>f.id==e.pointerId);
		let r=rect();
		if (!f) return;
		let x=(e.clientX-r.l)-r.w,y=(e.clientY-r.t)-r.h;
		f.pt.x=(x-f.dx)/r.w;
		f.pt.y=(y-f.dy)/r.h;
		func.update();
	};
	/* end pointer watching */
	let end=e=>{
		let i=focus.findIndex(f=>f.id==e.pointerId);
		if (i<0) return;
		focus.splice(i,1);
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

	/* keyboard event listener */
	ael(window,"keyup",e=>{
		switch (e.key) {
			case "s":case "S":func.scheme();break;
			case "c":case "C":calc.clear();break;
			case "q":case "Q":func.switch("squared",2);break;
			case "x":case "X":func.switch("x",3);break;
			case "y":case "Y":func.switch("y",3);break;
			case "a":case "A":func.switch("areaMode",3);break;
			case "p":case "P":func.switch("pc",3);break;
			case "d":case "D":func.switch("xy",3);break;
			case "g":case "G":func.switch("yx",3);break;
			case "o":case "O":func.switch("oval",2);break;
			case "b":case "B":func.switch("unbiased",2);break;
			case "m":case "M":status.menuShown=!status.menuShown;break;
			case "w":case "W":renderer.next();func.update();break;
		}
	});
	ael(window,"keypress",e=>{
		switch (e.key) {
			case "n":case "N":calc.normRandom();break;
			case "r":case "R":calc.random();break;
		}
	});

	return i;

});