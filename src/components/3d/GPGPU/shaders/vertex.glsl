varying vec2 vUv;
varying vec3 vPosition;

uniform float uParticleSize;
uniform sampler2D uPositionTexture;
uniform float uPixelRatio;
uniform vec2 uResolution;

// uConstantSize * uPixelRatio / -mvPosition.z;

void main() {
	vUv = uv;

	vec3 newpos = position;

	vec4 color = texture2D( uPositionTexture, vUv );

	newpos.xyz = color.xyz;

	vPosition = newpos;

	vec4 mvPosition = modelViewMatrix * vec4( newpos, 1.0 );

	float size = uParticleSize;
	if(color.w == 2.){
		size*=2.;
	}

gl_PointSize = size * (projectionMatrix[1].y / mvPosition.w)  * uPixelRatio;
//(size  / -mvPosition.z);//(size  / -mvPosition.z);//( size / -mvPosition.z );//size * //(projectionMatrix[1].y / mvPosition.w) * uResolution.x/uResolution.y * uPixelRatio;
	// gl_PointSize =   size * uPixelRatio / -mvPosition.z ;//( size / -mvPosition.z );

	gl_Position = projectionMatrix * mvPosition;
}