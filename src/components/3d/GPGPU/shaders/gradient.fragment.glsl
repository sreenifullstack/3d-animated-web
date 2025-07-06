
#pragma glslify: snoise = require(glsl-noise/simplex/2d)

precision highp float;


uniform float uTime;
uniform vec2 uBlackPosition;
uniform float uBlackRadius;
uniform float uBlackTimeScale;
uniform float uBlackBorderFade;
uniform float uBlackAlpha;

uniform vec3 uColor1;
uniform vec3 uColor2;

uniform float uTimeScale;
uniform float uScale;

uniform vec3 uColor3;
uniform float uScale3;

uniform float uScaleVignette;
uniform float uVignetteBorderFade;
uniform float uAlpha;

varying vec2 vUv;


vec3 _saturate(vec3 a) {
    return clamp(a, 0.0, 1.0);
}
float rand(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {

    float scaledTime = uTime * uTimeScale;
    float noise = snoise(vec2(vUv.x * uScale + sin(float(scaledTime)), vUv.y * uScale + cos(float(scaledTime))));
    vec3 outputColor = (vec3(noise) * uColor1.rgb + vec3(1. - noise) * uColor2.rgb);
    float noise2 = snoise(vec2(vUv.x * uScale3 + sin(float(scaledTime)), vUv.y * uScale3 + cos(float(scaledTime))));
    outputColor += uColor3 * noise2;

    // vignette   
    float circle = length(vUv - 0.5) * 0.9;
    float border = smoothstep(uScaleVignette - uVignetteBorderFade, uScaleVignette, 1. - circle);

    //blob
    vec2 newPos = uBlackPosition * vec2(0.5) + vec2(0.5);
    float scaledBlobTime = uTime * uBlackTimeScale;
    float blob1 = distance(vUv, newPos);
    float blob3 = distance(vUv, newPos + vec2(sin(float(scaledBlobTime)) * 0.2, 0.4));
    float blob4 = distance(vUv, newPos + vec2(sin(float(scaledBlobTime)) * 0.1, -0.4));
    float blobGroup = smoothstep(uBlackRadius - uBlackBorderFade, uBlackRadius, blob1 * blob3 * blob4);
    outputColor *= mix(vec3(1.), vec3(blobGroup), uBlackAlpha);
    
    // grain
    outputColor.rgb += (rand(vUv) - .5) * .07;
    outputColor.rgb = _saturate(outputColor.rgb);
    
    outputColor *= border * uAlpha;
    gl_FragColor = vec4(outputColor, 1.);

    // gl_FragColor = vec4(uBlackAlpha,0.,0.,1.);

}