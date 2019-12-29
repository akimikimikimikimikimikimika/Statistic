window.framework("preset",()=>{
	/* Preset values: If you change these values, they will be applied to some behaviour. */

	return {
		σ:1/3, /* standard deviation used in N ⚀ */
		μ:0, /* average used in N ⚀ */
		randomBuffer:255, /* number of values created at once by getRandomValues */
		invErfBuffer:25, /* dimensions in approximation of inverse erf */
		installedPoints:[
			{x:-0.6,y: 0.3},
			{x: 0.2,y:-0.5}
		] /* points shown at launch */
	};

	/* end preset values */

});



window.framework("header",{
	resources:[
		"preset","status","func","calc","xhtml","svg","canvas","glShaders","webgl","renderer","input","menu","nodes"
	],
	status:{
		args:["sc","mal","csm","cd","html"]
	},
	func:{
		args:["status","csal","ael","gs","html"]
	},
	calc:{
		args:["preset","func","status"]
	},
	xhtml:{
		args:["func","status","calc","cd","ap","rc","tc","ss","bcr"]
	},
	svg:{
		args:["func","calc","cd","cse","ap","rc","tc","sa","ss","bcr"]
	},
	canvas:{
		args:["func","status","calc","cd","che","ap","bcr","dpr"]
	},
	glShaders:{
		args:["ael"]
	},
	webgl:{
		args:["glShaders","func","calc","ce","cd","ap","gs","bcr","dpr"]
	},
	renderer:{
		args:["xhtml","svg","canvas","webgl","cd","ap","rc","tc"]
	},
	input:{
		args:["func","status","calc","renderer","cd","ael"]
	},
	menu:{
		args:["func","status","calc","renderer","cd","ap","sa","ss","ael"]
	},
	nodes:{
		args:["func","renderer","input","menu","cd","ap","rc","ael"]
	}
});