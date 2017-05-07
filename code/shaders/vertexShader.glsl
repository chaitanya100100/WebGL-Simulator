precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertNormal;
attribute vec2 vertTexCoord;

varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 proj;

void main()
{
	fragNormal = vertNormal;
	fragTexCoord = vertTexCoord;
	gl_Position = proj * view * model * vec4(vertPosition, 1.0);
}
