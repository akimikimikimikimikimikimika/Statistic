window.framework("func",(status,csal,ael)=>{

	/*
		update(fn) : register a function "fn" in the update list
		update(fn,true) : register a function "fn" in the resize list
		update() : execute all functions in the update list
	*/
	let update=(p,r)=>{
		if (p) {
			updateList.push(p);
			if (r) resizeList.push(p);
		}
		else updateList.forEach(i=>i());
	};
	let updateList=[],resizeList=[];
	csal("light",m=>{if (m.matches) updateList.forEach(i=>i());});
	csal("dark",m=>{if (m.matches) updateList.forEach(i=>i());});
	ael(window,"resize",()=>{
		resizeList.forEach(f=>f());
		setTimeout(()=>resizeList.forEach(f=>f()),100);
	});

	let cueManager=(callable)=>{
		let cues=[];
		f.update(()=>{
			if (callable()) for (let c of cues) {
				if (
					((!status.squared)&&(c.type&1))||
					(status.squared&&(c.type&2))
				) c.func();
			}
		});
		f.update(()=>{
			if (callable()) for (let c of cues) {
				if (
					c.always&&(
						((!status.squared)&&(c.type&1))||
						(status.squared&&(c.type&2))
					)
				) c.func();
			}
		},true);
		let addCue=(t,a,f)=>cues.push({
			type:t,
			always:a,
			func:f
		});
		/*
			t=1: called when status.squared is false
			t=2: called when status.squared is true
			t=3: called in both cases
			a: if false, called only when figures update or status.squared is changed, otherwise also called when the window resized
		*/

		return addCue;
	};

	let f={
		update:update,
		cueManager:cueManager,
		scheme:()=>{
			status.colorSchemePreferred=false;
			status.dark=!status.dark;
		},
		switch:(k,m)=>status[k]=(status[k]+1)%m
	};

	return f;

});
window.framework("nodes",(func,renderer,input,menu,cd,ap,rc,ael)=>{

	ael(window,"load",()=>{
		let body=document.body;
		while (body.firstChild) rc(body.firstChild);
		ap(body,base);
		func.update();
	});

	let base=cd("base");
	ap(base,cd("backgroundView"));
	ap(base,cd("statusbar"));
	ap(base,input);
	ap(base,renderer.view);
	ap(base,menu.view);
	ap(base,menu.button);

});
window.framework("renderer",(xhtml,svg,canvas,cd,ap,rc,tc)=>{

	let d=cd("drawView");
	var current=-1;
	let list=[xhtml,svg,canvas];

	let r={node:cd("range")};
	for (let d of ["left","right","top","bottom"]) r[d]=ap(r.node,tc(cd(),d));

	let o={
		icon:"",
		length:list.length,
		view:d,
		next:()=>{
			var n=(current+1)%list.length;
			if (current>=0) {
				let c=list[current];
				rc(c.artifact);
				c.visible=false;
			}
			else n=floor(random()*3);
			let c=list[n];
			if (!c.artifact) c.setup(r);
			if (c.includeRange) ap(c.artifact,r.node);
			else ap(d,r.node);
			ap(d,c.artifact);
			c.visible=true;
			current=n;
			o.icon=c.icon;
		}
	};

	o.next();

	return o;

});