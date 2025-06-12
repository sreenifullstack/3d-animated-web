varying vec2 vUv;
varying vec3 vPosition;

uniform float uParticleSize;
uniform sampler2D uPositionTexture;


void main() {
	vUv = uv;

	vec3 newpos = position;

	vec4 color = texture2D( uPositionTexture, vUv );


	newpos.xyz = color.xyz;

	vPosition = newpos;

	vec4 mvPosition = modelViewMatrix * vec4( newpos, 1.0 );

	float size = uParticleSize;
	if(color.w == 2.){
		// size*=2.;
	}

	gl_PointSize = ( size / -mvPosition.z );

	gl_Position = projectionMatrix * mvPosition;
}