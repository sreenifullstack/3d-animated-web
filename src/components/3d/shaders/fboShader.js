export const particle_vertex = `vec4 permute_0(vec4 x) {
    return mod(x * x * 34. + x, 289.);
}

float snoise(vec3 v) {
    const vec2 C = 1. / vec2(6, 3);
    const vec4 D = vec4(0, .5, 1, 2);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1. - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.x;
    vec3 x2 = x0 - i2 + C.y;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.);
    vec4 p = permute_0(permute_0(permute_0(i.z + vec4(0., i1.z, i2.z, 1.)) + i.y + vec4(0., i1.y, i2.y, 1.)) + i.x + vec4(0., i1.x, i2.x, 1.));
    vec3 ns = .142857142857 * D.wyz - D.xzx;
    vec4 j = p - 49. * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = floor(j - 7. * x_) * ns.x + ns.yyyy;
    vec4 h = 1. - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 sh = -step(h, vec4(0));
    vec4 a0 = b0.xzyw + (floor(b0) * 2. + 1.).xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + (floor(b1) * 2. + 1.).xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = inversesqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.);
    return .5 + 12. * dot(m * m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoiseVec3(vec3 x) {
    return vec3(snoise(vec3(x) * 2. - 1.), snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)) * 2. - 1., snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4) * 2. - 1.));
}

vec3 curlNoise(vec3 p) {
    const float e = .1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 p_x0 = snoiseVec3(p - dx);
    vec3 p_x1 = snoiseVec3(p + dx);
    vec3 p_y0 = snoiseVec3(p - dy);
    vec3 p_y1 = snoiseVec3(p + dy);
    vec3 p_z0 = snoiseVec3(p - dz);
    vec3 p_z1 = snoiseVec3(p + dz);

    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

    const float divisor = 1.0 / (2.0 * e);
    return normalize(vec3(x, y, z) * divisor);
}

//	Classic Perlin 3D Noise
//	by Stefan Gustavson

vec4 permute_1(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
float cnoise(vec3 P){
	vec3 Pi0 = floor(P); // Integer part for indexing
	vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
	Pi0 = mod(Pi0, 289.0);
	Pi1 = mod(Pi1, 289.0);
	vec3 Pf0 = fract(P); // Fractional part for interpolation
	vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
	vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
	vec4 iy = vec4(Pi0.yy, Pi1.yy);
	vec4 iz0 = Pi0.zzzz;
	vec4 iz1 = Pi1.zzzz;
	vec4 ixy = permute_1(permute_1(ix) + iy);
	vec4 ixy0 = permute_1(ixy + iz0);
	vec4 ixy1 = permute_1(ixy + iz1);
	vec4 gx0 = ixy0 / 7.0;
	vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
	gx0 = fract(gx0);
	vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
	vec4 sz0 = step(gz0, vec4(0.0));
	gx0 -= sz0 * (step(0.0, gx0) - 0.5);
	gy0 -= sz0 * (step(0.0, gy0) - 0.5);
	vec4 gx1 = ixy1 / 7.0;
	vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
	gx1 = fract(gx1);
	vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
	vec4 sz1 = step(gz1, vec4(0.0));
	gx1 -= sz1 * (step(0.0, gx1) - 0.5);
	gy1 -= sz1 * (step(0.0, gy1) - 0.5);
	vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
	vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
	vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
	vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
	vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
	vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
	vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
	vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
	vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
	g000 *= norm0.x;
	g010 *= norm0.y;
	g100 *= norm0.z;
	g110 *= norm0.w;
	vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
	g001 *= norm1.x;
	g011 *= norm1.y;
	g101 *= norm1.z;
	g111 *= norm1.w;
	float n000 = dot(g000, Pf0);
	float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
	float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
	float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
	float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
	float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
	float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
	float n111 = dot(g111, Pf1);
	vec3 fade_xyz = fade(Pf0);
	vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
	vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
	float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
	return 2.2 * n_xyz;
}

uniform float time;

uniform sampler2D introMask;
uniform float uIntroWidth;
uniform float uIntroScale;
uniform float uDisplacementScale;

uniform float particleSize;
uniform float uRatio;

uniform bool uMouseActive;
uniform vec3 uMousePos;
uniform float uMouseArea;
uniform float uMouseLength;
uniform float uMouseScale;
uniform float uMouseFrequency;

uniform float border;
uniform bool border2;
uniform float borderAmount;
uniform float borderNoiseFrequency;
uniform float borderNoiseScale;

uniform float CLOSEPLANE;
uniform float FARPLANE;

uniform sampler2D positionTexture;

varying float vCLOSEPLANE;
varying float vFARPLANE;

varying vec2 vReference;
varying vec3 vGlobalPos;
varying float vDist;
varying float vIntroDisplacement;

attribute vec2 reference;

vec3 fbm_vec3(vec3 p, float frequency, float offset) {
  return vec3(cnoise((p + vec3(offset)) * frequency), cnoise((p + vec3(offset + 20.)) * frequency), cnoise((p + vec3(offset - 30.)) * frequency));
}

float cubicOut(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

void main() {
  vReference = reference;

  vec3 pos = texture2D(positionTexture, reference).xyz;

  // intro displacement
  float introDisplacement = texture2D(introMask, pos.xy * vec2(uIntroWidth, 1.) * uIntroScale + vec2(0.5, 0.5)).r;

  introDisplacement = cubicOut(introDisplacement);
  introDisplacement *= uDisplacementScale;
  vIntroDisplacement = introDisplacement;

  pos.z += introDisplacement; 

  // border
  vec3 fp = pos;
  if(position.x > borderAmount) {
    fp += pow(border, 10.) * vec3(mix(-1., 1., position.x), mix(-1., 1., position.y), mix(-1., 1., position.z));
  }

  vec3 offset = fbm_vec3(fp, borderNoiseFrequency, time * 0.02) * borderNoiseScale;

  if(position.x > borderAmount && border2) {
    fp = pos + offset;
  }

  vec4 mvPosition = modelViewMatrix * vec4(fp, 1.);

  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vGlobalPos = worldPosition.xyz;

  gl_PointSize = max(1., ((particleSize)) * ((1. * uRatio) * 0.2 / -mvPosition.z));
  gl_Position = projectionMatrix * mvPosition;

  // mouse distortion
  float dist = 1.;
  if(uMouseActive) {

    vec2 seg = vGlobalPos.xy - uMousePos.xy;
    dist = length(vec2(seg.x, seg.y) * (6. * uMouseArea));
  }
  vDist = dist;
  gl_Position.xyz = mix(gl_Position.xyz + curlNoise(vec3(gl_Position.xyz * uMouseFrequency)) * uMouseScale, gl_Position.xyz, smoothstep(0., 1., dist * uMouseLength));

  // depths
  vFARPLANE = gl_Position.z / max(0.1, FARPLANE); // do not divide by w
  vCLOSEPLANE = gl_Position.z / max(0.1, CLOSEPLANE);
}`;

export const particle_fragment = `
uniform vec3 color1;
uniform vec3 color2;

uniform float uMaskAlpha;
uniform vec3 uMouseColor;

uniform float ROUNDPLANE;

uniform float uAlpha;
varying vec3 vGlobalPos;
varying vec2 vReference;
varying float vDist;
varying float vIntroDisplacement;
varying float vCLOSEPLANE;
varying float vFARPLANE;

#define PHI 1.61803398874989484820459 // Φ = Golden Ratio   
float gold_noise(in vec2 xy, in float seed) {
  return fract(tan(distance(xy * PHI, xy) * seed) * xy.x);
}

void main() {

  vec2 uv = vec2(gl_PointCoord.x, 1. - gl_PointCoord.y);  //particles dont have uv so we do this
  vec2 cUv = 2. * uv - 1.; //center uv 
  float disc = length(cUv); // make particle circle 

  vec3 finalColor = mix(color1, color2, gold_noise(vReference, 420.69));
  float particle = smoothstep(0., 1., 1. - disc);

  // mouse color
  vec3 outColor = mix(finalColor, uMouseColor, smoothstep(1., 0., vDist)); // mouse color

  float outAlpha = mix(smoothstep(0., 0.05, vIntroDisplacement), 1., 1. - uMaskAlpha);

  gl_FragColor.rgb = outColor;

  float dist = distance(vec3(0.), vGlobalPos);
  float vd = smoothstep(1., 0., dist * ROUNDPLANE);
  float vc = smoothstep(0.5, 0.8, vCLOSEPLANE);
  float vf = 1. - smoothstep(0.5, 0.8, vFARPLANE);

  gl_FragColor.a = outAlpha * particle * vd * vc * vf;
  gl_FragColor.a *= uAlpha;

  // gl_FragColor = vec4(1.,0.,1.,1.);

}
  `;

export const fbo_fragment = `
vec4 permute(vec4 x) {
    return mod(x * x * 34. + x, 289.);
}

float snoise(vec3 v) {
    const vec2 C = 1. / vec2(6, 3);
    const vec4 D = vec4(0, .5, 1, 2);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1. - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.x;
    vec3 x2 = x0 - i2 + C.y;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.);
    vec4 p = permute(permute(permute(i.z + vec4(0., i1.z, i2.z, 1.)) + i.y + vec4(0., i1.y, i2.y, 1.)) + i.x + vec4(0., i1.x, i2.x, 1.));
    vec3 ns = .142857142857 * D.wyz - D.xzx;
    vec4 j = p - 49. * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = floor(j - 7. * x_) * ns.x + ns.yyyy;
    vec4 h = 1. - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 sh = -step(h, vec4(0));
    vec4 a0 = b0.xzyw + (floor(b0) * 2. + 1.).xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + (floor(b1) * 2. + 1.).xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = inversesqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.);
    return .5 + 12. * dot(m * m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoiseVec3(vec3 x) {
    return vec3(snoise(vec3(x) * 2. - 1.), snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)) * 2. - 1., snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4) * 2. - 1.));
}

vec3 curlNoise(vec3 p) {
    const float e = .1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 p_x0 = snoiseVec3(p - dx);
    vec3 p_x1 = snoiseVec3(p + dx);
    vec3 p_y0 = snoiseVec3(p - dy);
    vec3 p_y1 = snoiseVec3(p + dy);
    vec3 p_z0 = snoiseVec3(p - dz);
    vec3 p_z1 = snoiseVec3(p + dz);

    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

    const float divisor = 1.0 / (2.0 * e);
    return normalize(vec3(x, y, z) * divisor);
}

uniform int type;

uniform float time;
uniform float timeScale;

uniform sampler2D texturePosition1;
uniform sampler2D texturePosition2;

uniform float anim2;
uniform float waves;
uniform float frequency;
uniform float xWaveScale;
uniform float yWaveScale;
uniform float zWaveScale;

uniform float lines;
uniform float uHole;
uniform float uLineOP;

float cubicInOut(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
}

void main() {

  vec2 uv = gl_FragCoord.xy / resolution.xy;

  vec4 t1 = texture2D(texturePosition1, uv);
  vec4 t2 = texture2D(texturePosition2, uv);

  float sTime = time * timeScale;

  float scale2 = anim2;

  vec4 tmp1 = mix(t2, t1, smoothstep(1., 0., scale2));

  if(type == 2) {
    vec3 op1 = mix(t1.xyz, t2.xyz, cubicInOut(smoothstep(0., 1., scale2 / uv.y)));
    tmp1 = vec4(op1, 1.);
  }

  // lines
  if(lines > 0. && lines <= 1.) {
    float y2 = smoothstep(0., 1., clamp((tmp1.x + uLineOP) * lines, 0., 1.));
    tmp1.y = mix(tmp1.y, 0., y2); // 1 to 0
  }

  vec3 pos = tmp1.xyz;

  vec3 distortion = vec3(xWaveScale, yWaveScale, zWaveScale) * curlNoise(vec3(pos.x + sTime, pos.y + sTime, pos.y + sTime) * frequency);
  vec3 finalPos = pos;

  finalPos += distortion * waves;

  // gravity hole 
  float diameter = 1.4;
  float dr = length(finalPos.xy * vec2(diameter));

  finalPos.z -= (1. - smoothstep(0.2, 1., clamp(dr, 0.0, 1.))) * uHole;

  gl_FragColor = vec4(finalPos, 1.);

}`;
