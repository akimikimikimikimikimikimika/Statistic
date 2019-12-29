precision mediump float;

varying float mode;
uniform vec4 color;

uniform mat3 ovalReshape;
uniform vec3 ovalParam;

void point();
vec4 oval(vec4);

void main() {
	vec4 c = color;
	if (mode==1.0) c = oval(c);
	if (mode==2.0) point();
	gl_FragColor = c;
}

vec4 oval(vec4 c) {
	vec2 p=(ovalReshape*vec3(gl_FragCoord.xy,1.0)).xy;
	float t=ovalParam.x*p.x*p.x+ovalParam.y*p.x*p.y+ovalParam.z*p.y*p.y;
	if (t<0.0) discard;
	else if (t<=1.0) c.a = 0.75;
	else if (t<=4.0) c.a = 0.5;
	else discard;
	return c;
}

void point() {
	if (length(gl_PointCoord-vec2(0.5))>0.5) discard;
}