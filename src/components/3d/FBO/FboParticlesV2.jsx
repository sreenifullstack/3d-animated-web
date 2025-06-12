"use client";
import React, {
  useRef,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";

import {
  FlowFieldParticles,
  FlowParticleChild,
  FlowParticleFactory,
} from "./FlowFieldParticles";
// import { useParticleUniforms } from "./useParticleUniforms";

import AA from "@/components/3d/shaders/test.vert";
console.log(AA, "bb");

import { useGPGPU } from "./useGPGPU";

import {
  particle_vertex as vertexShader,
  particle_fragment as fragmentShader,
} from "@/components/3d/shaders/fboShader";
import { shaderMaterial, useGLTF } from "@react-three/drei";
import { extend } from "@react-three/fiber";

import {
  fbo_fragment,
  particle_vertex,
  particle_fragment,
} from "../shaders/fboShader";

import { useFboUniformControls } from "./fboUniformControl";

import { useGcrUniforms } from "./useGcrUniforms";
import { useParticleUniforms } from "./useParticleUniforms";
import { useControls } from "leva";
import { frameProperty } from "../FrameProperty";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useSectionContext } from "./SectionProvider";
import { ScrollSmoother } from "gsap/ScrollSmoother";
// import { useGSAP } from "@/hooks/useGSAP";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);
// gsap.registerPlugin(ScrollSmoother);

const path = "/models/sigmalogo.glb";

const FboPonitMaterial = shaderMaterial(
  {
    //  type:0,

    time: { value: 0 },
    timeScale: 0,

    texturePosition1: null,
    texturePosition2: null,

    anim2: 0,
    waves: 0,
    frequency: 0,
    xWaveScale: 0,
    yWaveScale: 0,
    zWaveScale: 0,

    lines: 0,
    uHole: 0,
    uLineOP: 0,
  },
  `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
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
  void main() {
    gl_FragColor = vec4(sin(time*0.1),anim2 ,lines, 1.0);
  }
  `
  // vertexShader,
  // fragmentShader
);

extend({ FboPonitMaterial });

let [intro, A, B, C, D, E] = frameProperty;

const targetFrame = {
  bg: {
    color1: "#caabaa",
    color2: "#945a24",
    color3: "#614933",
    uAlpha: void 0,
    uBlackAlpha: void 0,
  },
  border: {
    borderNoiseScale: void 0,
  },
  obj: {
    position: {
      x: 0.6,
      y: 0,
      z: 0,
    },
    rotation: {
      x: 0.312,
      y: 0.474,
      z: 0,
    },
    scale: 0.8,
  },
  mouse: {
    mouseActive: void 0,
  },
  ground: {
    uMaskAlpha: void 0,
    uDisplacementScale: void 0,
    waves: void 0,
  },
  lines: {
    lines: void 0,
    uLineOP: void 0,
    uHole: void 0,
  },
  farplane: 2.13,
  roundplane: 0.53,
  closeplane: void 0,
  particleSize: void 0,
  uAlpha: void 0,
};

const SCENE_TRANSFORMS = {
  into: {
    position: new THREE.Vector3(0.4, -0.05, 0),
    rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
    scale: new THREE.Vector3(0.3, 0.3, 0.3),
    delay: 3,
    swap: [0, 1],
    texture: [0, 1],
  },
  hero: {
    position: new THREE.Vector3(0, 0, 0.5),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(5.2, 5.2, 5.2),
    delay: 0,
    swap: [1, 0.5],
    texture: [1, 2],
  },
  end: {
    position: new THREE.Vector3(0.2, -1, -1),
    rotation: new THREE.Euler(Math.PI / 4, 0, 0),
    scale: new THREE.Vector3(0.5, 0.5, 0.5),
    delay: 0,
    swap: [1, 0],
    texture: [2, 1],
  },
};

// ... existing code ...
const FboParticles = ({ width = 128 }) => {
  const { containerRef, sectionRefs, timelines } = useSectionContext();
  const groupRef = useRef();
  const factoryRef = useRef();
  window.factoryRef = factoryRef;

  window.groupRef = groupRef;
  const model = useGLTF(path);
  console.log((window.model = model));
  const geometry = model?.meshes?.node_id3?.geometry;

  // Memoize refs to prevent unnecessary re-renders
  const refs = useMemo(
    () => ({
      gcrUniforms: factoryRef?.current?.particlesRef?.current?.gcrUniforms,
      particleUniforms:
        factoryRef?.current?.particlesRef?.current?.particleUniforms,
      materialRef:
        factoryRef?.current?.particlesRef?.current?.materialRef?.current,
      filterRef: factoryRef?.current?.particlesRef?.current?.filterRef?.current,
      meshRef: factoryRef?.current?.particlesRef?.current?.meshRef?.current,
      textures: factoryRef?.current?.particlesRef?.current?.textures,
    }),
    [factoryRef?.current]
  );

  const {
    gcrUniforms,
    particleUniforms,
    materialRef,
    filterRef,
    meshRef,
    textures,
  } = refs;

  const fboUniform = filterRef?.uniforms;
  const pointUniform = meshRef?.material?.uniforms;

  const [currentScene, setCurrentScene] = useState("into"); // "into" | "hero" | "end"
  const [isInView, setView] = useState(factoryRef);

  useControls("swap", {
    swap: {
      value: true,
      onChange: (v) => setCurrentScene(v ? "into" : "hero"),
    },
  });

  window.s = setCurrentScene;
  useEffect(() => {
    factoryRef.current && fboUniform && setView(true);
  }, [fboUniform, factoryRef, refs]);

  // useGSAP(() => {
  //   if (
  //     !isInView ||
  //     !groupRef.current ||
  //     !fboUniform ||
  //     !SCENE_TRANSFORMS[currentScene]
  //   )
  //     return;

  //   const { position, rotation, scale, delay, swap, texture } =
  //     SCENE_TRANSFORMS[currentScene];

  //   const p = groupRef.current.position.clone();
  //   const r = groupRef.current.rotation.clone();
  //   const s = groupRef.current.scale.clone();

  //   const tl = gsap.timeline({
  //     delay: delay,
  //     onComplete: () => {
  //       // fboUniform.texturePosition1.value = textures[texture[1]];
  //       // fboUniform.texturePosition2.value = textures[texture[0]];
  //     },
  //   });

  //   tl.to(
  //     p,
  //     {
  //       x: position.x,
  //       y: position.y,
  //       z: position.z,
  //       duration: 1.5,
  //       ease: "power2.inOut",
  //       onUpdate: () => groupRef.current.position.copy(p),
  //     },
  //     0
  //   ); // start at 0

  //   tl.to(
  //     r,
  //     {
  //       x: rotation.x,
  //       y: rotation.y,
  //       z: rotation.z,
  //       duration: 1.5,
  //       ease: "power2.inOut",
  //       onUpdate: () => groupRef.current.rotation.set(r.x, r.y, r.z),
  //     },
  //     0
  //   ); // start in parallel

  //   tl.to(
  //     s,
  //     {
  //       x: scale.x,
  //       y: scale.y,
  //       z: scale.z,
  //       duration: 1.5,
  //       ease: "power2.inOut",
  //       onUpdate: () => groupRef.current.scale.copy(s),
  //     },
  //     0
  //   );

  //   const directionKeyframes = swap; //i % 2 === 0 ? [0, 1] : [1, 0];
  //   const ease = "circ4.inOut";

  //   tl.to(
  //     fboUniform.anim2,
  //     {
  //       keyframes: {
  //         value: directionKeyframes,
  //         ease: "none",
  //         easeEach: ease,
  //       },
  //       onUpdate: (v) => {
  //         // console.log(v, directionKeyframes, fboUniform);
  //       },
  //     },
  //     "<"
  //   );
  // }, [currentScene, isInView]);

  const obj = useRef({
    position: new THREE.Vector3(0, -0.251, -0.565),
    rotation: new THREE.Vector3(-1.398, 0, 0),
    scale: 1.1,
  });

  // useControls("model", {
  //   position: {
  //     value: new THREE.Vector3(0, -0.251, -0.565),
  //     step: 0.01,
  //     min: -2,
  //     max: 2,
  //     onChange: (v) => groupRef.current?.position.set(v.x, v.y, v.z),
  //   },

  //   rotation: {
  //     value: new THREE.Vector3(-1.398, 0, 0),
  //     step: 0.01,
  //     min: -2,
  //     max: 2,
  //     onChange: (v) => groupRef.current?.rotation.set(v.x, v.y, v.z),
  //   },
  //   scale: {
  //     value: 1,
  //     step: 0.01,
  //     min: -2,
  //     max: 2,
  //     onChange: (v) => groupRef.current?.scale.set(v, v, v),
  //   },
  // });

  // Cleanup function for GSAP animations
  const cleanupTimelines = useCallback(() => {
    if (timelines.current) {
      timelines.current.forEach((tl) => tl.kill());
      timelines.current = [];
    }
  }, [timelines]);

  // // Setup GSAP animations
  // useEffect(() => {
  //   if (!fboUniform || !pointUniform) return;
  //   if (!textures) return;

  //   cleanupTimelines();

  //   sectionRefs.current.forEach((section, i, arr) => {
  //     const timeline = gsap.timeline({
  //       immediateRender: !1,
  //       scrollTrigger: {
  //         invalidateOnRefresh: !0,
  //         trigger: section,
  //         endTrigger: section,
  //         yoyo: !0,
  //         scrub: !0,
  //         start: "top top",
  //         end: "bottom top",
  //       },
  //       onComplete: () => {
  //         return;
  //         if (!textures || !fboUniform) return;

  //         const nextIndex = i + 1;
  //         if (nextIndex >= textures.length) return;

  //         const nextTexture = textures[nextIndex];
  //         console.log("Next texture:", nextIndex, nextTexture?.id);

  //         if (i % 2 === 0) {
  //           fboUniform.texturePosition1.value = nextTexture;
  //         } else {
  //           fboUniform.texturePosition2.value = nextTexture;
  //         }
  //       },
  //       onReverseComplete: () => {
  //         return;
  //         if (!textures || !fboUniform) return;

  //         const prevIndex = i - 1;
  //         if (prevIndex < 0) return;

  //         const prevTexture = textures[prevIndex];
  //         console.log("Prev texture:", prevIndex, prevTexture?.id);

  //         if (i % 2 === 0) {
  //           fboUniform.texturePosition2.value = prevTexture;
  //         } else {
  //           fboUniform.texturePosition1.value = prevTexture;
  //         }
  //       },
  //       yoyo: true,
  //     });

  //     const directionKeyframes = i % 2 === 0 ? [0, 1] : [1, 0];
  //     const ease = "circ4.inOut";

  //     timeline.to(
  //       fboUniform.anim2,
  //       {
  //         keyframes: {
  //           value: directionKeyframes,
  //           ease: "none",
  //           easeEach: ease,
  //         },
  //         onUpdate: (v) => {
  //           // console.log(v, directionKeyframes, fboUniform);
  //         },
  //       },
  //       "<"
  //     );

  //     timelines.current.push(timeline);
  //   });

  //   const ctx = gsap.context(() => {}, containerRef);

  //   return () => {
  //     ctx.revert();
  //     cleanupTimelines();
  //   };
  // }, [
  //   textures,
  //   fboUniform,
  //   pointUniform,
  //   containerRef,
  //   sectionRefs,
  //   cleanupTimelines,
  //   refs,
  // ]);

  // Memoize geometries to prevent recreation on each render
  const geometries = useMemo(
    () => ({
      plane: new THREE.PlaneGeometry(1, 1, 1),
      sphere: new THREE.SphereGeometry(1, 32, 32),
      cone: new THREE.ConeGeometry(0.5, 2, 32),
      torus: new THREE.TorusGeometry(),
    }),
    []
  );

  return (
    <group
      ref={groupRef}
      rotation={[-1.398, 0, 0]}
      position={[0, -0.251, -0.565]}
      scale={[5.1, 5.1, 5.1]}
    >
      {geometry && (
        <FlowParticleFactory width={256} ref={factoryRef}>
          <FlowParticleChild
            geometry={geometries.plane}
            position={[2, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            config={intro}
            index={0}
          />
          <FlowParticleChild
            geometry={geometry}
            position={[2, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            config={intro}
            index={0}
          />
          <FlowParticleChild
            geometry={geometries.sphere}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            config={A}
            index={1}
          />
          <FlowParticleChild
            geometry={geometries.cone}
            position={[-2, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            config={B}
            index={2}
          />

          <FlowParticleChild
            geometry={geometries.torus}
            position={[-2, 0, 0]}
            rotation={[0, 0, 0]}
            scale={[1, 1, 1]}
            config={B}
            index={2}
          />
        </FlowParticleFactory>
      )}
    </group>
  );
};

FboParticles.displayName = "FboParticlesV2";

useGLTF.preload(path);

export { FboParticles as FboParticlesV2 };
// ... existing code ...
