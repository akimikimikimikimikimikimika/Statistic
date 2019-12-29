window.framework("calc",(preset,func,status)=>{

	/* create RNG */
	let rand=(()=>{
		var use=false,a,p=preset.randomBuffer;
		/*
			use: whether cryptography secure RNG
			a: an array of generated values
			p: number of rest values
		*/
		try{
			if (window.crypto.getRandomValues&&Uint32Array) {
				use=true;
				a=new Uint32Array(m);
			}
		}catch(e){use=false;}

		if (use) return ()=>{
			if (p>=m) {
				window.crypto.getRandomValues(a);
				p=0;
			}
			var r=a[p]/4294967295*2-1; /* Normalize */
			p++;
			return r;
		};
		else return ()=>{
			let r=Math.random()*2-1;
			if (r==-1) return rand();
			else return r;
		};

	})();

	/* inverse error function erf⁻¹(x,σ,μ) */
	let invErf=(()=>{
		var setup=false;
		let s=[],c=[1]; /* buffers of coefficients */
		/* the setup function: create coefficients */
		let su=()=>{
			let co=Math.sqrt(Math.PI)/2;
			for (var k=0;k<=preset.invErfBuffer;k++) {
				c[k]=k?0:1;
				if (k>0) for (var m=0;m<k;m++) c[k]+=c[m]*c[k-1-m]/(m+1)/(2*m+1);
				s[k]=c[k]/(2*k+1)*(co**(2*k+1));
			}
			setup=true;
		};
		/* raw calculation */
		let raw=z=>{
			var v=0;
			for (var k=0;k<=preset.invErfBuffer;k++) v+=s[k]*(z**(2*k+1));
			return v;
		};
		/* fit raw value to proper average and variance */
		let calibration=(z,σ,μ)=>Math.SQRT2*σ*raw(z)+μ;
		return (z,σ,μ)=>{
			if (!setup) su();
			return calibration(z,σ,μ);
		};
	})();

	/* points coordinate array */
	let points=preset.installedPoints;

	/* calculate basic values */
	let μ={x:0,y:0}, /* average */
	σ={x:0,y:0,m:0}, /* variance */
	n=0; /* size or size-1 */
	let calc=()=>{
		n=points.length;
		let σn=n;
		if (status.unbiased) σn--;
		μ.x=μ.y=σ.x=σ.y=σ.m=0;
		points.forEach(p=>{
			μ.x+=p.x/n; /* average of x */
			μ.y+=p.y/n; /* average of y */
		});
		points.forEach(p=>{
			σ.x+=(p.x-μ.x)*(p.x-μ.x)/σn; /* variance of x */
			σ.y+=(p.y-μ.y)*(p.y-μ.y)/σn; /* variance of y */
			σ.m+=(p.x-μ.x)*(p.y-μ.y)/σn; /* covariance */
		});
	};

	/* providing data for drawing */

	/* (m,s) → [m-2s,m-s,m,m+s,m+2s] */
	let dev=(m,s)=>{
		let l=[];
		for (var n=-2;n<3;n++) l.push(m+s*n);
		return l;
	};
	/* percentile "p" of the list "l" */
	let per=(l,p)=>{
		let v=p*(l.length-1);
		if (v%1) {
			let f=floor(v),c=ceil(v);
			return l[f]*(c-v)+l[c]*(v-f);
		}
		else return l[parseInt(v)];
	};
	/* for pc/lr creating data */
	let make=(a,b,d,p,v)=>{
		let vw=points.length>=2?v:0;
		if (vw) {
			let l=hypot(a,b);
			let na=a/l,nb=b/l;
			let c=na*μ.x+nb*μ.y;
			return {
				a:na,
				b:nb,
				c:dev(c,d),
				p:p,
				view:vw
			};
		}
		else return {view:0};
	};


	/* x,y (both included) */
	let xy=m=>{
		let w=points.length>=1;
		let o=[
			{
				a:1,b:0,c:null,
				p:0.6,
				view:w?status.x:0
			},
			{
				a:0,b:1,c:null,
				p:0.6,
				view:w?status.y:0
			}
		];
		if (w&&o.some(e=>e.view)) switch (m) {
			case 0: /* standard deviation */
				o[0].c=dev(μ.x,sqrt(σ.x));
				o[1].c=dev(μ.y,sqrt(σ.y));
				break;
			case 1: /* absolute value deviation */
				let ad=points.reduce((c,p)=>{
					c.x+=abs(p.x-μ.x)/n;
					c.y+=abs(p.y-μ.y)/n;
					return c;
				},{x:0,y:0});
				o[0].c=dev(μ.x,ad.x);
				o[1].c=dev(μ.y,ad.y);
				break;
			case 2: /* quartile */
				/* quartile creator */
				let q=l=>{
					let ol=l.sort((a,b)=>a-b); /* ordered list */
					return [per(ol,0),per(ol,0.25),per(ol,0.5),per(ol,0.75),per(ol,1)];
				};
				o[0].c=q(points.map(v=>v.x));
				o[1].c=q(points.map(v=>v.y));
				break;
		}
		return o;
	};
	/*
		m=0 standard deviation
		m=1 absolute value deviation
		m=2 quartile
	*/

	/* primary component (both included) */
	let pc=()=>{
		let s=σ.x+σ.y;
		let λ=solve(1,-s,σ.x*σ.y-σ.m*σ.m);
		return [
			make(
				σ.x-λ[0],
				σ.m,
				sqrt(λ[1]),
				λ[0]/s,
				status.pc
			),
			make(
				σ.m,
				σ.y-λ[1],
				sqrt(λ[0]),
				λ[1]/s,
				status.pc
			)
		];
	};

	/* linear regression (both included) */
	let lr=()=>{
		let r2=(σ.m*σ.m)/(σ.x*σ.y);
		return [
			make(
				-σ.m,
				+σ.x,
				sqrt((1-r2)*σ.y)*σ.x/hypot(σ.x,σ.m),
				r2,
				status.xy
			),
			make(
				+σ.y,
				-σ.m,
				sqrt((1-r2)*σ.x)*σ.y/hypot(σ.y,σ.m),
				r2,
				status.yx
			)
		];
	};

	/*
		return value from xy,pc,lr:
		{a:float,b:float,c:[float],d:float,p:float}
		* c contains 5 items (creates 4 areas)
		* a²+b²=1 (constraint)

		ax+by=c with opacity p
	*/

	/* provide oval data */
	let oval=()=>{
		let θ=atan2(σ.m+σ.m,σ.x-σ.y)/2;
		let ab=solve(1,-σ.x-σ.y,σ.x*σ.y-σ.m*σ.m).sort((a,b)=>a-b);
		return {
			a:sqrt(ab[1]),
			b:sqrt(ab[0]),
			θ:θ,
			cx:μ.x,
			cy:μ.y,
			oval:true,
			view:(points.length>=3)&&status.oval
		};
	};
	/*
		{
			a:sqrt(ab[1]),
			b:sqrt(ab[0]),
			θ:θ,
			cx:a.x,
			cy:a.y
		}
		(x-cx)²/a²+(y-cy)²/b²=1 (a≥b)
		rotated θ radians
	*/

	/* main update function */
	let update=()=>{
		let v=points.length;
		if (v>0) calc();
		c.xy=xy(status.areaMode);
		c.pc=pc();
		c.lr=lr();
		c.oval=oval();
	};

	func.update(update);

	let c={
		xy:null,
		pc:null,
		lr:null,
		oval:null,
		points:points,
		/* create random points */
		random:()=>{
			points.push({x:rand(),y:rand()});
			func.update();
		},
		/* create normalized random points */
		normRandom:()=>{
			let f=()=>{
				let r=invErf(rand(),preset.σ,preset.μ);
				if (abs(r)>1) return f();
				else return r;
			};
			points.push({x:f(),y:f()});
			func.update();
		},
		/* remove all points */
		clear:()=>{
			points.length=0;
			func.update();
		}
	};
	return c;

});