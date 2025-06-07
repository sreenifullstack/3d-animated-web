"use client";
import React, {
  useRef,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
  memo,
} from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";

import { Bvh, Html, shaderMaterial, useFBO, useGLTF } from "@react-three/drei";
import { extend } from "@react-three/fiber";

import {
  fbo_fragment,
  particle_vertex,
  particle_fragment,
} from "../shaders/fboShader";

// import { useFboUniformControls } from "./fboUniformControl";

// import { useGcrUniforms } from "./useGcrUniforms";
// import { useParticleUniforms } from "./useParticleUniforms";
import { useControls } from "leva";
// import { frameProperty } from "../FrameProperty";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
// import { useSectionContext } from "./SectionProvider";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
// import { useGSAP } from "@/hooks/useGSAP";
import simFragment from "./shaders/simFragment.glsl";
import simFragmentVelocity from "./shaders/simFragmentVelocity.glsl";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);
// gsap.registerPlugin(ScrollSmoother);

const path = "/models/sigmaV3.glb";

// extend(Bvh);
// let [intro, A, B, C, D, E] = frameProperty;

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

// this.material = new THREE.ShaderMaterial({
//   uniforms: {
//       uPositionTexture: { value: this.gpgpuCompute.getCurrentRenderTarget(this.positionVariable).texture },
//       uVelocityTexture: { value: this.gpgpuCompute.getCurrentRenderTarget(this.velocityVariable).texture },
//       uResolution: { value: new THREE.Vector2(this.sizes.width, this.sizes.height) },
//       uParticleSize: { value: this.params.size },
//       uColor: { value: this.params.color },
//       uMinAlpha: { value: this.params.minAlpha },
//       uMaxAlpha: { value: this.params.maxAlpha },
//   },
//   vertexShader,
//   fragmentShader,
//   depthWrite: false,
//   depthTest: false,
//   blending: THREE.AdditiveBlending,
//   transparent: true
// })
export const hexToRgb = (hex) => {
  const color = new THREE.Color(hex);

  return new THREE.Vector3(color.r, color.g, color.b);
};

const OPTS = {
  ParticleSize: 5,
  Color: 0x111111,
  minAlpha: 0.4,
  maxAlpha: 0.8,
};

const v1 = `
void main(){
gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
gl_PointSize = 10.;
}`;

const f1 = `
uniform float uTime;
uniform vec3 uColor;
void main(){
gl_FragColor = vec4(uColor,1.);
}`;

const ParticlesMaterial = memo(
  forwardRef(
    (
      {
        // size = new THREE.Vector3(512, 512),
        // pointSize = 0.1,
        positionTexture,
        velocityTexture,
        resolution,
        size = OPTS.ParticleSize,
        color = OPTS.Color,
        minAlpha = OPTS.minAlpha,
        maxAlpha = OPTS.maxAlpha,
        ...props
      },
      ref
    ) => {
      console.log(props);
      const uniformsRef = useRef({
        uPositionTexture: { value: positionTexture || null },
        uVelocityTexture: { value: velocityTexture || null },
        uResolution: { value: resolution || new THREE.Vector2() },
        uParticleSize: { value: size },
        uColor: { value: new THREE.Color(color) },
        uMinAlpha: { value: minAlpha },
        uMaxAlpha: { value: maxAlpha },
        uTime: { value: 0 },
      });

      // Update uniforms when props change
      useEffect(() => {
        const uniforms = uniformsRef.current; // Get the mutable uniforms object

        if (!uniforms) return;

        if (positionTexture !== undefined)
          uniforms.uPositionTexture.value = positionTexture;
        if (velocityTexture !== undefined)
          uniforms.uVelocityTexture.value = velocityTexture;
        if (resolution !== undefined) uniforms.uResolution.value = resolution;
        if (size !== undefined) uniforms.uParticleSize.value = size;
        if (color !== undefined) uniforms.uColor.value = new THREE.Color(color);
        if (minAlpha !== undefined) uniforms.uMinAlpha.value = minAlpha;
        if (maxAlpha !== undefined) uniforms.uMaxAlpha.value = maxAlpha;
      }, [
        positionTexture,
        velocityTexture,
        resolution,
        size,
        color,
        minAlpha,
        maxAlpha,
      ]);

      return (
        <shaderMaterial
          // toneMapped={false}
          ref={ref}
          uniforms={uniformsRef.current} // Pass the mutable uniforms object
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          // vertexShader={v1}
          // fragmentShader={f1}
          {...props}
        />
      );
    }
  )
);

const useNormalizedMouse = () => {
  const { size, gl } = useThree();
  const mouseNdc = useRef(new THREE.Vector2()); // Using useRef for mutable object

  const handlePointerMove = useCallback(
    (event) => {
      // Get clientX/Y from the event
      const clientX = event.clientX;
      const clientY = event.clientY;

      // Convert screen coordinates to NDC
      mouseNdc.current.x = (clientX / size.width) * 2 - 1;
      mouseNdc.current.y = -(clientY / size.height) * 2 + 1; // Y is inverted in screen vs NDC
    },
    [size.width, size.height]
  ); // Recreate if canvas size changes

  useEffect(() => {
    const canvas = gl.domElement;
    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [gl, handlePointerMove]);

  return useMemo(() => {
    return mouseNdc.current;
  }, [mouseNdc]);
};

const defaultModel = new THREE.Mesh(new THREE.PlaneGeometry());
// ... existing code ...
const FboParticles = ({ model = defaultModel, size = 128 }) => {
  const particleMaterialRef = useRef();
  window.particleMaterialRef = particleMaterialRef;

  const particlesRef = useRef();
  const number = size * size;
  const simResoution = useMemo(() => {
    return new THREE.Vector2(size, size);
  }, [size]);

  const mouseRef = useRef({ coord: new THREE.Vector3(), force: 0 }).current;
  window.ass = mouseRef;
  // Memoize sampler once when model changes
  const sampler = useMemo(() => new MeshSurfaceSampler(model).build(), [model]);

  const { position, positionTexture, uvs, velocityTexture } = useMemo(() => {
    const positionData = new Float32Array(4 * number);
    const positions = new Float32Array(3 * number);
    const uvs = new Float32Array(2 * number);
    const velocityData = new Float32Array(4 * number);
    const _position = new THREE.Vector3();

    // Initialize velocity data with zeros
    velocityData.fill(0);

    // Generate positions and UVs
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = i * size + j;
        sampler.sample(_position);

        // Position data for texture (RGBA)
        positionData[4 * index] = _position.x;
        positionData[4 * index + 1] = _position.y;
        positionData[4 * index + 2] = _position.z;

        // Positions for geometry
        positions[3 * index] = _position.x;
        positions[3 * index + 1] = _position.y;
        positions[3 * index + 2] = _position.z;

        // UVs
        uvs[2 * index] = j / (size - 1);
        uvs[2 * index + 1] = i / (size - 1);
      }
    }

    // Create textures
    const posTexture = new THREE.DataTexture(
      positionData,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    posTexture.needsUpdate = true;

    const velTexture = new THREE.DataTexture(
      velocityData,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    velTexture.needsUpdate = true;

    return {
      position: positions,
      uvs,
      positionTexture: posTexture,
      velocityTexture: velTexture,
    };
  }, [sampler, size, number]);

  // Memoize geometry
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    return geom;
  }, [position, uvs]);

  // Update material uniforms when textures are ready
  useEffect(() => {
    if (particleMaterialRef.current) {
      particleMaterialRef.current.uniforms.uPositionTexture.value =
        positionTexture;
      particleMaterialRef.current.uniforms.uVelocityTexture.value =
        velocityTexture;
      particleMaterialRef.current.uniforms.uResolution.value =
        new THREE.Vector2(size, size);
    }
  }, [positionTexture, velocityTexture, size]);

  const { gl, size: sizes } = useThree();
  const gpgpuCompute = useRef({});
  const gpgpuUniforms = useRef({});

  const gpgpuTextures = useRef({
    positionTexture: null,
    velocityTexture: null,
  });

  const _gcrVariable = useRef({
    position: null,
    velocity: null,
  });

  useEffect(() => {
    if (!gl || !positionTexture || !velocityTexture) return;
    const _gcr = new GPUComputationRenderer(size, size, gl);

    // const positionTexture = this.utils.getPositionTexture();
    // const velocityTexture = this.utils.getVelocityTexture();

    const positionVariable = _gcr.addVariable(
      "uCurrentPosition",
      simFragment,
      positionTexture
    );
    const velocityVariable = _gcr.addVariable(
      "uCurrentVelocity",
      simFragmentVelocity,
      velocityTexture
    );

    _gcr.setVariableDependencies(positionVariable, [
      positionVariable,
      velocityVariable,
    ]);
    _gcr.setVariableDependencies(velocityVariable, [
      positionVariable,
      velocityVariable,
    ]);

    const _uniforms = {
      position: positionVariable.material.uniforms,
      velocity: velocityVariable.material.uniforms,
    };

    _gcrVariable.current = {
      position: positionVariable,
      velocity: velocityVariable,
    };
    _uniforms.velocity.uMouse = { value: new THREE.Vector3() }; // vec3
    _uniforms.velocity.uMouseSpeed = { value: 0 };
    _uniforms.velocity.uOriginalPosition = { value: positionTexture };
    _uniforms.velocity.uTime = { value: 0 };
    _uniforms.velocity.uForce = { value: 0.7 }; //this.params.force

    _gcr.init();

    gpgpuUniforms.current = _uniforms;

    _gcr.compute();

    const _textures = {
      positionTexture: _gcr.getCurrentRenderTarget(positionVariable).texture,
      velocityTexture: _gcr.getCurrentRenderTarget(velocityVariable).texture,
    };

    gpgpuTextures.current = _textures;

    //console.log(_textures);

    gpgpuCompute.current = _gcr;

    return () => {
      _gcr.dispose();
    };
  }, [size, positionTexture, velocityTexture, gl]);

  useFrame(({ clock }) => {
    if (gpgpuCompute.current) {
      gpgpuCompute.current.compute();

      if (particleMaterialRef.current) {
      }
    }

    if (gpgpuUniforms?.current?.velocity) {
      gpgpuUniforms.current.velocity.uTime.value = clock.getElapsedTime();

      mouseRef.force *= 0.85;

      gpgpuUniforms.current.velocity.uMouseSpeed.value = mouseRef.force;

      // console.log(mouseCoord);
      // gpgpuUniforms.current.velocity.uMouse.value.x = mouseCoord.x;
      // gpgpuUniforms.current.velocity.uMouse.value.y = mouseCoord.y;
      // console.log(mouseCoord);
      // vec3
      // vec3
      // gpgpuUniforms?.current?.velocity?.uTime?.value = clock.getElapsedTime()
    }
  });

  const handlePointerMove = (e) => {};

  const modelRef = useRef();
  window.n = gpgpuUniforms;
  return (
    <group>
      <Bvh
        firstHitOnly
        onPointerMove={(e) => {
          mouseRef.coord.copy(e.intersections[0].point);
          gpgpuUniforms?.current &&
            gpgpuUniforms.current.velocity.uMouse.value.copy(mouseRef.coord);
          mouseRef.force = 1;

          // this.uniforms.velocityUniforms.uMouseSpeed.value = this.mouseSpeed
        }}
      >
        <mesh visible={false}>
          <primitive object={model.geometry} attach="geometry" />
        </mesh>
      </Bvh>
      {/* <bvh>{model}</bvh> */}

      <points ref={particlesRef} geometry={geometry}>
        <ParticlesMaterial
          ref={particleMaterialRef}
          attach="material"
          positionTexture={gpgpuTextures.current.positionTexture}
          velocityTexture={gpgpuTextures.current.velocityTexture}
          resolution={simResoution}
          color="#F777A8"
          size={1.7}
          minAlpha={0.04}
          maxAlpha={0.8}
          // force: 0.7
          // color="green"
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          transparent={true}
        />
      </points>
      {/* <gridHelper /> */}
    </group>
  );
};

FboParticles.displayName = "FboParticlesV2";

const ParticleFactory = ({ width = 128 }) => {
  const model = useGLTF(path);
  console.log(model.meshes.Curve007);
  model.meshes.Curve007.scale.multiplyScalar(24);
  const [size, setSize] = useState(512);
  return (
    <>
      {/* <Html className="absolute z-40 left-0 top-0">
        <input
          type="number"
          className="border"
          value={size}
          onChange={setSize}
        />
        <button className="p-2 border ">Create</button>
      </Html> */}
      <FboParticles size={size} model={model.meshes.Curve007} />;
    </>
  );
};

useGLTF.preload(path);

export { ParticleFactory as FboParticlesV2 };
// ... existing code ...
