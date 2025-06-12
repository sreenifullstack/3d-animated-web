
#pragma glslify: snoise = require(glsl-noise/simplex/3d)

vec3 snoiseVec3( vec3 x ){

  float s  = snoise(vec3( x ));
  float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
  float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
  vec3 c = vec3( s , s1 , s2 );
  return c;

}


vec3 curlNoise( vec3 p ){
  
  const float e = .1;
  vec3 dx = vec3( e   , 0.0 , 0.0 );
  vec3 dy = vec3( 0.0 , e   , 0.0 );
  vec3 dz = vec3( 0.0 , 0.0 , e   );

  vec3 p_x0 = snoiseVec3( p - dx );
  vec3 p_x1 = snoiseVec3( p + dx );
  vec3 p_y0 = snoiseVec3( p - dy );
  vec3 p_y1 = snoiseVec3( p + dy );
  vec3 p_z0 = snoiseVec3( p - dz );
  vec3 p_z1 = snoiseVec3( p + dz );

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / ( 2.0 * e );
  return normalize( vec3( x , y , z ) * divisor );
}

uniform float uTime;
uniform sampler2D uOriginalPosition;
uniform vec3 uMouse;
uniform float uMouseSpeed;
uniform float uForce;
uniform float uProgress;

mat2 rot2d(float a){ return mat2(cos(a), sin(a), -sin(a), cos(a));}

void main() {

	vec2 vUv = gl_FragCoord.xy / resolution.xy;

	vec3 position = texture2D( uCurrentPosition, vUv ).xyz;
	vec3 original = texture2D( uOriginalPosition, vUv ).xyz;
	vec3 velocity = texture2D( uCurrentVelocity, vUv ).xyz;

	velocity *= uForce; // Velocity relaxation


	// Particle attraction to shape force

	vec3 direction = normalize( original - position );

	float dist = length( original - position );

	if( dist > 0.001 ) velocity += direction * ( dist * 0.02 );


	// Mouse repel force

	float mouseDistance = distance( position, uMouse );
	float maxDistance = 0.1;


	if( mouseDistance < maxDistance ) {
		vec3 pushDirection = normalize( position - uMouse );
		velocity += pushDirection * ( 1.0 - mouseDistance / maxDistance ) * 0.007 * uMouseSpeed;
	}

    vec4 _original = texture2D( uOriginalPosition, vUv );   

	gl_FragColor = vec4(velocity, _original.w );
}