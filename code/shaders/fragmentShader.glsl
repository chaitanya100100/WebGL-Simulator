precision mediump float;

varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform sampler2D sampler;

void main()
{
	vec3 ambientIntensity = vec3(0.4, 0.4, 0.5);
	vec3 sunIntensity = vec3(0.9, 0.8, 0.6);
	vec3 sunDirection = normalize(vec3(1.0, -4.0, 0.0));

	vec4 texel = texture2D(sampler, fragTexCoord);

	vec3 light = ambientIntensity + sunIntensity * max(0.0, dot(fragNormal, sunDirection));

	gl_FragColor = vec4(texel.rgb * light, texel.a);
}
