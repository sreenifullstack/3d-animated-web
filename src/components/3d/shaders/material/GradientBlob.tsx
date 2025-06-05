import * as THREE from "three";
import { fragmentShader, vertexShader } from "../bgShader";
const uniforms = {
  uTime: {
    value: 1,
  },
  uBlackPosition: {
    value: new THREE.Vector2(0.5, 0.5),
  },
  uBlackRadius: {
    value: 0.141,
  },
  uBlackBorderFade: {
    value: 0.12,
  },
  uBlackTimeScale: {
    value: 0.19,
  },
  uBlackAlpha: {
    value: 1, //0
  },
  uColor1: {
    value: new THREE.Color("#54aba5"),
  },
  uColor2: {
    value: new THREE.Color("#274045"),
  },
  uTimeScale: {
    value: 0.19,
  },
  uScale: {
    value: 1.08,
  },
  uColor3: {
    value: new THREE.Color("#375d54"),
  },
  uScale3: {
    value: 1.08,
  },
  uScaleVignette: {
    value: 0.523,
  },
  uVignetteBorderFade: {
    value: 0.216,
  },
  uAlpha: {
    value: 0.36,
  },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  depthWrite: false,
  depthTest: false,
  vertexShader,
  fragmentShader,
});

export default material;
