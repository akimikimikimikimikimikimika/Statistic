(()=>{

	/* Preset values: If you change these values, they will be applied to some behaviour. */

	let σ=1/3; /* variance of N ⚀ */
	let μ=0; /* average of N ⚀ */

	/* end preset values */



	let sc=(e,c)=>{
		if (c) e.setAttribute("class",c);
		else e.removeAttribute("class");
		return e;
	},html=document.documentElement;

	let cs=(()=>{
		let mm=s=>window.matchMedia(`(prefers-color-scheme: ${s})`);
		return {
			light:mm("light"),
			dark:mm("dark")
		};
	})();

	let update=t=>{
		let c=[
			"js",
			t.colorSchemePreferred?"pcs":(t.dark?"dark":"light"),
			msl[ms]
		];
		if (t.squared) c.push("squared");
		if (t.moving) c.push("moving");
		if (t.standalone) c.push("standalone");
		if (t.browser) c.push(t.browser.toLowerCase());
		sc(html,c.join(" "));
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
		t[p]=v;
		update(t);
	};
	var msi=null;
	let msl=["menu-hidden","before-menu-shown","menu-shown","hiding-menu"];
	var ms=0;

	let s=new Proxy({
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
		dark:false,
		σ:σ,
		μ:μ,
		colorSchemePreferred:false,
		browser:null
	},{set:setter});

	(()=>{
		s.standalone=navigator.standalone===true||(/standalone=yes/).test(location.search);
		s.touch=document.createElement("div").ontouchstart===null;
		s.online=(()=>{
			let p=location.protocol;
			return /https/.test(p)||(/http/.test(p)&&location.hostname=="localhost");
		})();
		if (window.ApplePaySession) s.browser="Safari";
		if (window.chrome) s.browser="Chrome";
		if (window.sidebar) s.browser="Firefox";
		let csp=cs.light.matches||cs.dark.matches;
		s.colorSchemePreferred=csp;
		if (csp) s.dark=cs.dark.matches;
		cs.light.addListener(m=>{if (s.colorSchemePreferred&&m.matches) s.dark=false;});
		cs.dark.addListener(m=>{if (s.colorSchemePreferred&&m.matches) s.dark=true;});
	})();

	if (s.online) try{
		["../Library/ServiceWorker.js","ServiceWorker.js"].forEach(f=>navigator.serviceWorker.register(f).then(r=>r.update()));
	}catch(e){}

	window.res("status",()=>s);

})();