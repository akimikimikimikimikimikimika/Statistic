window.framework("status",(sc,mal,csm,cd,html,o)=>{

	let update=t=>{
		let c=[
			"js",
			t.colorSchemePreferred?"pcs":(t.dark?"dark":"light"),
			msl[ms]
		];
		if (t.touch) c.push("touch");
		if (t.squared) c.push("squared");
		if (t.moving) c.push("moving");
		if (t.standalone) c.push("standalone");
		if (t.browser) c.push(t.browser.toLowerCase());
		sc(html,c.join(" "));
	};
	let getter=(t,p)=>{
		if (p=="dark") {
			if (t.colorSchemePreferred) return csm("dark");
			else return t.dark;
		}
		else if (p=="squared") {
			if (t.printing) return 0;
			else return t.squared;
		}
		else return t[p];
	};
	let setter=(t,p,v)=>{
		if ((p=="menuShown")&&(t[p]!=v)) {
			if (msi) clearTimeout(msi);
			ms=v?1:3;
			msi=setTimeout(()=>{
				ms=v*2;
				msi=null;
				update(t);
			},v?0:500);
		}
		if ((p=="dark")&&t.colorSchemePreferred) return;
		if (p=="colorSchemePreferred") {
			if (!(csm("light")||csm("dark"))) return;
			if (t[p]!=v) t.dark=csm("dark");
		}
		t[p]=v;
		update(t);
		if (o.func) o.func.update();
	};
	var msi=null;
	let msl=["menu-hidden","before-menu-shown","menu-shown","hiding-menu"];
	var ms=0;

	let t={
		moving:false,
		standalone:false,
		menuShown:false,
		touch:false,
		areaMode:0,
			/*
				0: standard deviation,
				1: absolute value deviation,
				2: quartile
			*/
		x:2,
		y:2,
		pc:0,
		xy:0,
		yx:0,
		oval:1,
		unbiased:0,
		squared:0,
		printing:false,
		dark:csm("dark"),
		colorSchemePreferred:csm("light")||csm("dark"),
		browser:null
	};

	let s=new Proxy(t,{set:setter,get:getter});

	(()=>{
		t.standalone=navigator.standalone===true||(/standalone=yes/).test(location.search);
		t.touch=cd().ontouchstart===null;
		if (window.ApplePaySession) t.browser="Safari";
		if (window.chrome) t.browser="Chrome";
		if (window.sidebar) t.browser="Firefox";
		s.online=(()=>{
			let p=location.protocol;
			return /https/.test(p)||(/http/.test(p)&&location.hostname=="localhost");
		})();
		mal("print",m=>s.printing=m.matches);
	})();

	if (s.online) try{
		["../Library/ServiceWorker.js","ServiceWorker.js"].forEach(f=>navigator.serviceWorker.register(f).then(r=>r.update()));
	}catch(e){}

	return s;

});