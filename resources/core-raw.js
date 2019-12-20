(()=>{

	let cd=(i,t)=>{let d=document.createElement("div");if (i) d.id=i;if (t) d.textContent=t;return d;},ap=(p,c)=>p.appendChild(c),rc=c=>c.parentNode.removeChild(c),ael=(e,t,f)=>e.addEventListener(t,f);

	let main=()=>{

		let funcs={
			/*
				update(fn) : register a function "fn" in the update list
				update(fn,true) : register a function "fn" in the resize update list
				update() : execute all functions in the update list
			*/
			update:(()=>{
				/* the update list & resize update list */
				let l=[],rs=[];
				ael(window,"resize",()=>rs.forEach(f=>f()));
				return (p,r)=>{
					if (p) {
						l.push(p);
						if (r) rs.push(p);
					}
					else l.forEach(i=>i());
				};
			})(),
			scheme:()=>{
				status.colorSchemePreferred=false;
				status.dark=!status.dark;
			},
			switch:(s,m)=>{
				status[s]=(status[s]+1)%m;
				funcs.update();
			}
		};

		/* initialize module */
		let status=statusInit();
		let calc=calcInit(funcs,status);
		let input=inputInit(funcs,status,calc);
		let menu=menuInit(funcs,status,calc);
		let renderer=[
			htmlInit(funcs,status,calc)
		];

		ael(window,"load",()=>{
			while (document.body.firstChild) rc(document.body.firstChild);
			ap(document.body,base);
			funcs.update();
		});

		/* prepare nodes */
		let base=cd("base");
		ap(base,cd("backgroundView"));
		ap(base,cd("statusbar"));
		ap(base,input);
		ap(base,menu.view);
		ap(base,menu.button);

		renderer[0].setup();
		ap(base,renderer[0].artifact);

	};

	var statusInit,calcInit,inputInit,menuInit,htmlInit;

	new Promise(r=>{

		var counter=0;
		let getResource=(n,s)=>{
			switch (n) {
				case "status":
					statusInit=s;
					counter++;
					break;
				case "menu":
					menuInit=s;
					counter++;
					break;
				case "calc":
					calcInit=s;
					counter++;
					break;
				case "input":
					inputInit=s;
					counter++;
					break;
				case "html":
					htmlInit=s;
					counter++;
					break;
			}
			confirm();
		};
		let confirm=()=>{
			if (counter==5) {
				delete window.res;
				r();
			}
		};
		window.res=(n,s)=>getResource(n,s);

	}).then(main);

})();