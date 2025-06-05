export const vertexShader = `
precision highp float;
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}`;
export const fragmentShader = `
precision highp float;

// Simplex 2D noise
// 

vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

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

}`;
