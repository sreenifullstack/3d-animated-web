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

// import { useParticleUniforms } from "./useParticleUniforms";

import { useGPGPU } from "./useGPGPU";

import {
  particle_vertex as vertexShader,
  particle_fragment as fragmentShader,
} from "@/components/3d/shaders/fboShader";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

import {
  fbo_fragment,
  particle_vertex,
  particle_fragment,
} from "../shaders/fboShader";

import { useFboUniformControls } from "./fboUniformControl";

import { useParticleUniforms } from "./useParticleUniforms";
import { useControls } from "leva";
import { useGcrUniforms } from "./useGcrUniforms";

const FboPontMaterial = shaderMaterial(
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
  vertexShader,
  fragmentShader
);

extend({ FboPontMaterial });

const targetFrame = {
  obj: {
    position: {
      x: 0,
      y: -0.251,
      z: -0.565,
    },
    rotation: {
      x: -1.398,
      y: 0,
      z: 0,
    },
    scale: 1.1,
  },
  lines: {
    lines: 0,
    uLineOP: 0,
    uHole: 0,
  },
  farplane: 6,
  roundplane: 0.2,
  closeplane: 1.8,
  particleSize: 20,
  uAlpha: 1,
};

const FboParticles = ({ width = 128 }) => {
  const { uniforms, updateUniforms } = useGcrUniforms();
  console.log(uniforms, "uniforms");

  //   position: {
  //     x: 0,
  //     y: -.251,
  //     z: -.565
  // },
  // rotation: {
  //     x: -1.398,
  //     y: 0,
  //     z: 0
  // },
  // scale: 1.1

  const obj = useRef({
    position: new THREE.Vector3(0, -0.251, -0.565),
    rotation: new THREE.Vector3(-1.398, 0, 0),
    scale: 1.1,
  });

  const [controls, setControls] = useControls("model", () => {
    return {
      position: {
        value: new THREE.Vector3(0, -0.251, -0.565),
        step: 0.01,
        min: -2,
        max: 2,
      },
      rotation: {
        value: new THREE.Vector3(-1.398, 0, 0),
        step: 0.01,
        min: -2,
        max: 2,
      },
      scale: { value: 1.1, min: 0.5, max: 2, step: 0.01 },
    };
  });
  window.controls = controls;
  const { uniforms: particleUniforms, updateUniforms: updateParticleUniforms } =
    useParticleUniforms();

  window.z = {
    uniforms,
    updateUniforms,
    particleUniforms,
    updateParticleUniforms,
  };
  const [gpu, setGPGPU] = useState(null);

  const pointsRef = useRef();
  const materialRef = useRef();
  const transitionModelRefs = useRef([]);
  const geometryRef = useRef();

  const raycasterPlaneRef = useRef();
  const mousePosition = useRef(new THREE.Vector3(0, 0, 0));
  const pointerRef = useRef(new THREE.Vector3(0, 0, 0));

  window.r = { geometryRef, materialRef, pointsRef };

  const { gl } = useThree();

  useEffect(() => {
    if (!gl && uniforms.current) return;
    const gpu = new GPUComputationRenderer(width, width, gl);
    const filter = gpu.createShaderMaterial(fbo_fragment, uniforms.current);
    const output = gpu.createRenderTarget();

    setGPGPU({
      gpuCompute: gpu,
      filter,
      output,
    });

    return () => {
      gpu.dispose();
      filter.dispose?.();
      output.dispose?.();
    };
  }, [width, gl]);

  const filter = gpu?.filter;
  const outputRenderTarget = gpu?.output;
  const gpuCompute = gpu?.gpuCompute;

  const setPosition = useMemo(
    () => (populateFunction) => {
      // const gpuCompute = gpuComputeRef.current;
      if (!gpuCompute) return null;

      const texture = gpuCompute.createTexture();
      populateFunction(texture.image.data);
      return texture;
    },
    [gpu]
  );

  const update = useMemo(
    () => (time) => {
      // const filter = filterRef.current;
      // const gpuCompute = gpuComputeRef.current;

      if (!filter || !gpuCompute || !outputRenderTarget) return;

      // updateUniforms({ time: time });
      filter.uniforms.time.value = time;
      gpuCompute.doRenderTarget(filter, outputRenderTarget);
    },
    [gpu]
  );

  const fboFilter = gpu?.filter;
  const fbo = gpu?.output?.texture;
  const isReady = true;

  window.h = {
    setPosition,
    fboFilter,
    isReady,
    update,
    fbo,
    materialRef,
  };

  // Initialize particle models
  useEffect(() => {
    if (!isReady || !fboFilter) return;

    // Model 1 - Grid pattern
    const model1 = setPosition((data) => {
      const particleCount = Math.sqrt(data.length / 4);
      const spacing = 0.01;
      const halfSize = particleCount / 2;

      for (let i = 0, x = -halfSize, y = -halfSize; i < data.length; i += 4) {
        const v = new THREE.Vector3();

        if (x < halfSize) {
          v.x = y % 2 === 0 ? x * spacing + 0.005 : x * spacing;
          x++;
        } else {
          x = -halfSize;
          v.x = x * spacing;
          y++;
        }

        v.y = y * spacing;
        data[i] = v.x;
        data[i + 1] = v.y;
        data[i + 2] = 0;
        data[i + 3] = 1;
      }
    });

    // Model 2 - Random pattern
    const model2 = setPosition((data) => {
      for (let i = 0; i < data.length; i += 4) {
        const v = new THREE.Vector3();
        const randomOffset = 0.01 * Math.random() - 0.005;

        v.x = 4 * Math.random() - 2;
        v.y = Math.round(10 * Math.random()) / 10 + randomOffset;
        v.y *= Math.random() > 0.5 ? 1 : -1;
        data[i] = v.x;
        data[i + 1] = v.y;
        data[i + 2] = 0;
        data[i + 3] = 1;
      }
    });

    // Assign textures to uniforms
    updateUniforms({ texturePosition1: model2, texturePosition2: model1 });
    transitionModelRefs.current = [model1, model2];
  }, [gpu, uniforms]);

  // Animation frame loop
  useFrame(({ clock }) => {
    if (!materialRef.current || !isReady) return;

    const time = clock.getElapsedTime();

    if (mousePosition.current && materialRef.current.uniforms?.uMousePos) {
      materialRef.current.uniforms.uMousePos.value.lerp(
        mousePosition.current,
        0.1
      );
    }

    if (pointsRef.current && pointerRef.current) {
      const lerp = (a, b, t) => a + t * (b - a);
      const factor = new THREE.Vector2(0.05, 0.05);
      const scale = new THREE.Vector2(15, 10);
      const active = 1;

      // this.mouse.obj && this.mouse.position.x && this.mouse.position.y && this.particlesMixin.pointsGroup.rotation.set(l.m.lerp(this.particlesMixin.pointsGroup.rotation.x, this.mouse.position.y * Math.PI / this.mouse.scale.x * this.mouse.active.value, this.mouse.factor.x), l.m.lerp(this.particlesMixin.pointsGroup.rotation.y, -this.mouse.position.x * Math.PI / this.mouse.scale.y * this.mouse.active.value, this.mouse.factor.y), this.particlesMixin.pointsGroup.rotation.z),
      // pointsRef.current.rotation.set(
      //   lerp(
      //     pointsRef.current.rotation.x,
      //     ((pointerRef.current.y * Math.PI) / scale.x) * active,
      //     factor.x
      //   ),
      //   lerp(
      //     pointsRef.current.rotation.y,
      //     ((-pointerRef.current.x * Math.PI) / scale.y) * active,
      //     factor.y
      //   ),
      //   pointsRef.current.rotation.z
      // );
    }

    // Update time uniform
    if (materialRef.current.uniforms?.time) {
      materialRef.current.uniforms.time.value = time * 0.2;
    }

    // Update position texture
    if (materialRef.current.uniforms?.positionTexture) {
      materialRef.current.uniforms.positionTexture.value = fbo;
    }

    update(time);
  });

  // Create geometry and material
  const [geometry] = useMemo(() => {
    const particleCount = width * width;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const references = new Float32Array(particleCount * 2);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const i2 = i * 2;

      // Random initial positions
      positions[i3] = (Math.random() - 0.5) * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      // UV coordinates for texture lookup
      references[i2] = (i % width) / width;
      references[i2 + 1] = Math.floor(i / width) / width;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute(
      "reference",
      new THREE.BufferAttribute(references, 2)
    );

    return [geometry];
  }, [width]);

  const material = useMemo(() => {
    console.log(
      "Creating new material with uniforms:",
      particleUniforms.current
    );
    if (!particleUniforms.current) return null;

    const mat = new THREE.ShaderMaterial({
      uniforms: { ...particleUniforms.current }, // Create a shallow copy
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    return mat;
  }, [particleUniforms.current]);

  // Update material reference when it changes
  useEffect(() => {
    if (material && materialRef.current) {
      console.log("Updating material reference");
      materialRef.current = material;
    }
  }, [material]);

  const groupRef = useRef();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const mouse = new THREE.Vector2(
        e.clientX / window.innerWidth,
        e.clientY / window.innerHeight
      );
      pointerRef.current.copy(mouse);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  });

  const pointsGroupRef = useRef();

  return (
    <group>
      <mesh
        // scale={[1.1, 1.1, 1.1]}
        // rotation={[-1.398, 0, 0]}
        // position={[0, -0.251, -0.565]}
        ref={raycasterPlaneRef}
        frustumCulled={false}
        onPointerMove={(e) => {
          // console.log(e, "e");
          mousePosition?.current.copy(e.point);
          // mousePosition.current = new THREE.Vector2(
          //   e.clientX / window.innerWidth,
          //   e.clientY / window.innerHeight
          // );
        }}
      >
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial
          color="red"
          wireframe={true}
          transparent={true}
          opacity={0}
        />
      </mesh>

      <group ref={pointsRef}>
        <points
          visible={!false}
          //   position={[
          //     controls.position.x,
          //     controls.position.y,
          //     controls.position.z,
          //   ]}
          //   scale={[controls.scale, controls.scale, controls.scale]}
          //   rotation={[
          //     controls.rotation.x,
          //     controls.rotation.y,
          //     controls.rotation.z,
          //   ]}
          frustumCulled={false}
        >
          <primitive object={geometry} attach="geometry" />
          {material && (
            <primitive object={material} attach="material" ref={materialRef} />
          )}
        </points>
      </group>
    </group>
  );
};

FboParticles.displayName = "FboParticles";

export { FboParticles };
