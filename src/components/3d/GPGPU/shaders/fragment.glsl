varying vec2 vUv;

uniform sampler2D uVelocityTexture;
uniform vec3 uColor;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;


uniform float uMinAlpha;
uniform float uMaxAlpha;
uniform float uOpacity;

// uniform vec3 uColor = vec3(0.808, 0.647, 0.239);
// uniform float uMinAlpha = 0.04;
// uniform float uMaxAlpha = 0.8;


void main() {
	float center = length(gl_PointCoord - 0.5);

   	vec4 velTex  = texture2D( uVelocityTexture, vUv );
	float id = velTex.w;
	vec3 velocity = velTex.xyz * 100.0;

	float velocityAlpha = clamp(length(velocity.r), uMinAlpha, uMaxAlpha);

	if (center > 0.5) { discard; }
    
	if(texture2D( uVelocityTexture, vUv ).w == 2.){
		gl_FragColor = vec4(uColor4, .055 * uOpacity );
		return;
	}
    
	vec4 outColor = vec4(uColor4, velocityAlpha);
	if(id == 12.){
		outColor = vec4(uColor4, velocityAlpha*0.75 );
	}

	gl_FragColor =  outColor;//vec4(outColor, velocityAlpha);
	gl_FragColor.a *=uOpacity; 
}