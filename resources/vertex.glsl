uniform int type; /* draw object type */
uniform mat3 adjust;
attribute vec2 position;

uniform mat2 areaRotation;
uniform float plotRadius;

void applyData(vec2);
varying float mode;

/* choose function for current drawing */
void main() {
	mode = 0.0;
	if (type==0) applyData(position);
	if (type==1) applyData(areaRotation*position);
	if (type==2) {
		applyData(position);
		mode = 1.0;
	}
	if (type==3) applyData(position);
	if (type==4) {
		applyData(position);
		gl_PointSize=plotRadius*2.0;
		mode = 2.0;
	}
}

void applyData(vec2 p) {
	gl_Position = vec4(adjust*vec3(p,1.0),1.0);
}