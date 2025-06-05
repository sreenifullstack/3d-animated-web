import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import * as THREE from "three";
import { particle_vertex, particle_fragment } from "../shaders/fboShader";

const FboPointMaterial = shaderMaterial(
  {
    time: 0,
    color1: new THREE.Color(1, 1, 1),
    color2: new THREE.Color("#0096b8"),
    uMaskAlpha: 0,
    introMask: null,
    uIntroScale: 0.77,
    uIntroWidth: 0.6,
    uDisplacementScale: 0,
    particleSize: 20,
    uRatio: Math.min(window.devicePixelRatio, 2),
    uMouseActive: false,
    uMousePos: new THREE.Vector2(0, 0),
    uMouseArea: 1,
    uMouseColor: new THREE.Color("#0096b8"),
    uMouseLength: 1,
    uMouseScale: 0.15,
    uMouseFrequency: 0,
    border: 0.85,
    border2: false,
    borderAmount: 0.77,
    borderNoiseFrequency: 8.7,
    borderNoiseScale: 0,
    CLOSEPLANE: 0.1,
    FARPLANE: 2.38,
    ROUNDPLANE: 2.38,
    uAlpha: 1,
    positionTexture: null,
  },
  particle_vertex,
  particle_fragment
);
extend({ FboPointMaterial });
