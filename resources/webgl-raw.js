window.framework("webgl",(glShaders,func,calc,ce,cd,ap,gs,bcr,dpr)=>{

	var L=0,R=0,T=0,B=0,W=0,H=0,M=0,cv,ct,pg;
	/*
		cv: <canvas> element
		ct: WebGL context
		pg: WebGL program
	*/
	/*
		viewBox of GL
		status.squared is false: [-W,+W]×[-H,+H]
		status.squared is true:  [-L-W,+R+W]×[-T-H,+B+H]
	*/

	/* locations,buffers */
	var typeL,colorL,positionB,positionL,adjustL,arL,prL,orL,opL;

	let r={
		name:"WebGL",
		icon:"GL",
		artifact:null,
		includeRange:false,
		visible:false,
		setup:range=>{
			let d=cd(null,"webgl");
			glSetup();
			resizeSetup(range);
			ap(d,cv);
			axisSetup();
			areaSetup();
			rangeSetup();
			plotSetup();
			r.artifact=d;
		}
	};

	let addCue=func.cueManager(()=>r.visible);

	let glSetup=()=>{

		/* create canvas node & context */
		cv=ce("canvas");
		ct=cv.getContext("webgl");

		/* create program & compile source */
		pg=ct.createProgram();
		[
			{type:ct.VERTEX_SHADER,code:glShaders.vertex},
			{type:ct.FRAGMENT_SHADER,code:glShaders.fragment}
		].forEach(o=>{
			let s=ct.createShader(o.type);
			ct.shaderSource(s,o.code);
			ct.compileShader(s);
			ct.attachShader(pg,s);
			if (!ct.getShaderParameter(s,ct.COMPILE_STATUS)) {
				console.log(ct.getShaderInfoLog(s));
				return true;
			}
		});
		ct.linkProgram(pg);
		if (!ct.getProgramParameter(pg, ct.LINK_STATUS)) {
			console.log(ct.getProgramInfoLog(pg));
			return true;
		}
		ct.useProgram(pg);

		/* set color blending strategy */
		ct.enable(ct.BLEND);
		ct.blendFuncSeparate(ct.SRC_ALPHA,ct.ONE_MINUS_SRC_ALPHA,ct.ONE,ct.ONE_MINUS_SRC_ALPHA);

		/* get locations */
		typeL=loc("type");
		colorL=loc("color");
		positionB=buf();
		positionL=loc("position",true);
		adjustL=loc("adjust");
		arL=loc("areaRotation");
		prL=loc("plotRadius");
		orL=loc("ovalReshape");
		opL=loc("ovalParam");
	};

	let resizeSetup=range=>{
		addCue(2,true,()=>{
			L=bcr(range.left).width;
			R=bcr(range.right).width;
			T=bcr(range.top).height;
			B=bcr(range.bottom).height;
		});
		addCue(1,false,()=>L=R=T=B=0);
		addCue(3,true,()=>{
			let w=bcr(cv).width,h=bcr(cv).height;
			W=(w-L-R)/2,H=(h-T-B)/2;
			M=max(w/W,h/H);
			cv.width=w*dpr,cv.height=h*dpr;
			ct.viewport(0,0,w*dpr,h*dpr);
			ct.clearColor(0,0,0,0);
			ct.clear(ct.COLOR_BUFFER_BIT);
			ct.uniformMatrix3fv(adjustL,false,[+1-(L+R)/w,0,(L-R)/w,0,-1+(B+T)/h,(B-T)/h,0,0,0]);
		});
	};

	let axisSetup=()=>{

		let i=createIndex(0,1,11,1,7,11,1,2,4,2,3,4,5,6,7,7,1,5,7,8,10,8,9,10);

		addCue(3,true,()=>{
			let w=0.5/W,h=0.5/H;

			setType(0);
			setColor("--axis-color",1);
			setPosition([
				+M,+h,
				+w,+h,
				+w,+M,
				-w,+M,
				-w,+h,
				-M,+h,
				-M,-h,
				-w,-h,
				-w,-M,
				+w,-M,
				+w,-h,
				+M,-h
			]);
			drawByIndex(i);
		});

	};

	let areaSetup=()=>{

		let i=createIndex(0,1,3,2,3,1);

		/* area modifier */
		let modify=(v,d)=>{
			if (!d.view) return;
			let p=`--area-${v}-color`;/* CSS property */
			if (!d.oval) {
				/* modify variable c in ax+by=c */
				let cc=d.c[2],t=3/hypot(W*d.a,H*d.b),c=Array.from(d.c);
				c.splice(2,1,cc+t,cc-t);

				/* opacity */
				var op=d.p*0.3+0.1;
				op=[op*2,op*(2-op),op];

				setType(1);
				/* for rotation */
				ct.uniformMatrix2fv(arL,false,[
					 d.a,d.b,
					-d.b,d.a
				]);

				let w=d.view-1;
				for (var n=-2*w;n<=2*w;n++) {
					setColor(p,op[abs(n)]);
					setPosition([
						c[n+2],+M,
						c[n+2],-M,
						c[n+3],-M,
						c[n+3],+M
					]);
					drawByIndex(i);
				}
			}
			else {
				let c=cos(d.θ),s=sin(d.θ);
				/* the area in cartesian coordinate */
				let w=2*hypot(d.a*c,d.b*s),h=2*hypot(d.a*s,d.b*c);

				setType(2);
				setColor(p,1);
				/*
					provide the vector (c₁,c₂,c₃)
					(c₁,c₂,c₃) -> t = c₁x²+c₂xy+c₃y²
					if t≤1,4 then fragment is into the oval
					otherwise outside
				*/
				ct.uniform3fv(opL,[
					(c/d.a)**2+(s/d.b)**2,
					2*(d.a**(-2)-d.b**(-2))*c*s,
					(s/d.a)**2+(c/d.b)**2
				]);
				/* matrix for converting gl_FragCoord to [-1,+1]² */
				ct.uniformMatrix3fv(orL,false,[
					+1/W/dpr,0,0,
					0,-1/H/dpr,0,
					-L/W-1-d.cx,+B/H+1-d.cy,0
				]);
				setPosition([
					d.cx+w,d.cy+h,
					d.cx+w,d.cy-h,
					d.cx-w,d.cy-h,
					d.cx-w,d.cy+h
				]);
				drawByIndex(i);
			}
		};

		addCue(3,true,()=>{
			modify("x",calc.xy[0]);
			modify("y",calc.xy[1]);
			modify("pc",calc.pc[0]);
			modify("pc",calc.pc[1]);
			modify("xy",calc.lr[0]);
			modify("yx",calc.lr[1]);
			modify("oval",calc.oval);
		});

	};

	let rangeSetup=()=>{

		let i=createIndex(0,1,5,0,3,5,1,2,8,1,7,8,6,8,11,6,10,11,3,4,10,3,9,10);

		addCue(2,true,()=>{
			setType(3);
			setColor("--square-shadow",0.4);
			setPosition([
				-M,-M,
				+1,-M,
				+M,-M,
				-M,-1,
				-1,-1,
				+1,-1,
				-1,+1,
				+1,+1,
				+M,+1,
				-M,+M,
				-1,+M,
				+M,+M
			]);
			drawByIndex(i);
		});

	};

	let plotSetup=()=>{

		let pt=calc.points;

		/* apply data */
		addCue(3,true,()=>{
			let pd=[];
			for (let p of pt) pd.push(p.x,p.y);

			setType(4);
			setColor("--plot-color",1);
			setPosition(pd);
			ct.uniform1f(prL,func.plotRadius()*dpr);
			ct.drawArrays(ct.POINTS,0,pt.length);
		});

	};

	/* send data to the program */
	let setType=t=>ct.uniform1i(typeL,t);
	let setColor=(p,a)=>{
		/* get color of CSS property -> hex to rgb -> set uniform data */
		let h=gs(cv,p,true);

		let c=h.match(/\#([0-f]{2})([0-f]{2})([0-f]{2})/i);
		c.shift();
		let cd=c.map(v=>parseInt(v,16)/255);

		ct.uniform4f(colorL,cd[0],cd[1],cd[2],a);
	};
	let setPosition=d=>{
		ct.bindBuffer(ct.ARRAY_BUFFER,positionB);
		ct.bufferData(ct.ARRAY_BUFFER,new Float32Array(d),ct.STATIC_DRAW);
		ct.enableVertexAttribArray(positionL);
		ct.vertexAttribPointer(positionL,2,ct.FLOAT,false,0,0);
	};
	let createIndex=(...d)=>{
		let o={
			data:new Int16Array(d),
			buffer:buf()
		};
		ct.bindBuffer(ct.ELEMENT_ARRAY_BUFFER,o.buffer);
		ct.bufferData(ct.ELEMENT_ARRAY_BUFFER,o.data,ct.STATIC_DRAW);
		return o;
	};
	let drawByIndex=o=>{
		ct.bindBuffer(ct.ELEMENT_ARRAY_BUFFER,o.buffer);
		ct.drawElements(ct.TRIANGLES,o.data.length,ct.UNSIGNED_SHORT,0);
	};
	let buf=()=>ct.createBuffer();
	let loc=(n,t)=>{
		if (t) return ct.getAttribLocation(pg,n);
		else return ct.getUniformLocation(pg,n);
	};

	return r;

});

/* GLSL shader sources */
window.framework("glShaders",()=>{
    return {
        vertex:`uniform int type;uniform mat3 adjust;attribute vec2 position;uniform mat2 areaRotation;uniform float plotRadius;void applyData(vec2);varying float mode;void main() {mode = 0.0;if (type==0) applyData(position);if (type==1) applyData(areaRotation*position);if (type==2) {applyData(position);mode = 1.0;}if (type==3) applyData(position);if (type==4) {applyData(position);gl_PointSize=plotRadius*2.0;mode = 2.0;}}void applyData(vec2 p) {gl_Position = vec4(adjust*vec3(p,1.0),1.0);}`,
        fragment:`precision mediump float;varying float mode;uniform vec4 color;uniform mat3 ovalReshape;uniform vec3 ovalParam;void point();vec4 oval(vec4);void main() {vec4 c = color;if (mode==1.0) c = oval(c);if (mode==2.0) point();gl_FragColor = c;}vec4 oval(vec4 c) {vec2 p=(ovalReshape*vec3(gl_FragCoord.xy,1.0)).xy;float t=ovalParam.x*p.x*p.x+ovalParam.y*p.x*p.y+ovalParam.z*p.y*p.y;if (t<0.0) discard;else if (t<=1.0) c.a = 0.75;else if (t<=4.0) c.a = 0.5;else discard;return c;}void point() {if (length(gl_PointCoord-vec2(0.5))>0.5) discard;}`
    };
});