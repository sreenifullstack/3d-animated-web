
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

uniform sampler2D uOriginalPosition;
uniform float uTime;


uniform float uProgress;

uniform bool intro;
void main() {
	vec2 vUv = gl_FragCoord.xy / resolution.xy;


  
    vec4 _original = texture2D( uOriginalPosition, vUv );   
	vec4 _position = texture2D( uCurrentPosition, vUv );
	vec4 _velocity = texture2D( uCurrentVelocity, vUv );


	vec3 position = texture2D( uCurrentPosition, vUv ).xyz;
	vec3 original = texture2D( uOriginalPosition, vUv ).xyz;
	vec3 velocity = texture2D( uCurrentVelocity, vUv ).xyz;

	
	// uProgress <0.5 &&
	if(intro && _velocity.w == 1.) {
	float time = uTime * 0.01;		
	float speed = snoise(vec3(vUv,time)) * 0.01;
    vec3 noise = curlNoise(vec3(vUv*100.,time ))*0.25; // Added time-based animation		
	 position.y +=noise.x; 
	 position.x +=noise.x; 
	// position.z +=noise.z; 
	}

	if(_position.w < 9.){

   	// float time = uTime * 0.01;		
   	// float speed = snoise(vec3(_original.x , _original.y,_original.z + time )) * 0.01;
   	// vec3 noise = curlNoise(vec3(vUv*102.,time ))*0.05; // Added time-based animation		
	//  position.y +=speed; 
	//  position.x =_original.y + 0.01;
		//  position.y +=noise.y; 
	//  position.x -=noise.y; 
	
	}


    // float progress = mod(uTime*0.001, 1.0);
    
    // Mix factor based on progress (left to right)
    // float factor = vUv.x * progress; // Simple left-to-right mixing
    
    // Mix between noise and original position
    // position = mix( noise,original,factor);
    position +=velocity;            
    gl_FragColor = vec4(position, _original.w);
}
