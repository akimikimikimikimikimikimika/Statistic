importScripts("../Library/SW/SW.js");

let res=[
	"style.css","color.css","font.css","html.css","svg.css",
	"header.js","core.js","status.js","menu.js","calc.js","input.js","html.js","svg.js","canvas.js","webgl.js",
	"icon.png","favicon.ico","apple-touch-icon.png","tileImage.png"
];
cacheManager({
	name:"Statistic",
	build:[2019,12,29],
	list:["Statistic.html","manifest.json"].concat(res.map(v=>"resources/"+v))
});