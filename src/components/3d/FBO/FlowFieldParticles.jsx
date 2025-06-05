import * as THREE from "three";
import React, { useRef, useEffect, useState } from "react";
import { forwardRef, useMemo, useImperativeHandle } from "react";
// FlowFieldParticles.js

import { useThree, useFrame } from "@react-three/fiber";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
import { useParticleUniforms } from "./useParticleUniforms";
import { useGcrUniforms } from "./useGcrUniforms";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import {
  particle_fragment,
  particle_vertex,
  fbo_fragment,
} from "../shaders/fboShader";

export const FlowParticleFactory = forwardRef(
  ({ children, width = 40 }, ref) => {
    const [samplers, setSamplers] = useState([]);
    const childRefs = useRef([]);
    const particlesRef = useRef();

    useEffect(() => {
      const s = childRefs.current.map((ref) => ref?.sampler).filter(Boolean);
      setSamplers(s);
    }, [children]);

    useEffect(() => {
      console.log("Children count:", children.length);
      console.log("childRefs", childRefs.current);
    }, [children]);

    useImperativeHandle(ref, () => ({
      samplers,
      particlesRef,
      childRefs,
    }));

    return (
      <FlowFieldParticles width={width} samplers={samplers} ref={particlesRef}>
        {React.Children.map(children, (child, i) =>
          React.cloneElement(child, {
            ref: (el) => {
              if (el) childRefs.current[i] = el;
            },
          })
        )}
      </FlowFieldParticles>
    );
  }
);

// FlowParticleChild.js

export const FlowParticleChild = forwardRef(
  ({ geometry, config = {}, index, ...props }, ref) => {
    const meshRef = useRef();

    useImperativeHandle(ref, () => {
      if (!meshRef.current) return null;
      const sampler = new MeshSurfaceSampler(meshRef.current).build();
      return {
        mesh: meshRef.current,
        sampler,
        config,
        index,
        id: index,
      };
    });

    return (
      <mesh ref={meshRef} geometry={geometry} {...props}>
        <meshStandardMaterial wireframe={true} color="white" visible={false} />
      </mesh>
    );
  }
);

FlowParticleChild.displayName = "FlowParticleChild";

export const FlowFieldParticles = forwardRef(
  ({ width = 256, samplers = [], children }, ref) => {
    console.log("samplers:", samplers, width);
    const { gl } = useThree();
    const groupRef = useRef();
    const meshRef = useRef();
    const materialRef = useRef();
    const filterRef = useRef();
    const anim2UniformRef = useRef();

    const raycasterPlaneRef = useRef();
    const mousePosition = useRef(new THREE.Vector3(0, 0, 0));
    const pointerRef = useRef(new THREE.Vector3(0, 0, 0));

    const { uniforms: particleUniforms } = useParticleUniforms();
    const { uniforms: gcrUniforms, updateUniforms: updateGcrUniforms } =
      useGcrUniforms();

    const [gpu, setGpu] = useState(null);
    const [textures, setTextures] = useState([]);

    useImperativeHandle(ref, () => ({
      filterRef,
      materialRef,
      anim2UniformRef,
      particleUniforms,
      gcrUniforms,
      textures,
      meshRef,
    }));

    useEffect(() => {
      if (!gl) return;
      const gpuCompute = new GPUComputationRenderer(width, width, gl);
      const filter = gpuCompute.createShaderMaterial(fbo_fragment, gcrUniforms);
      const output = gpuCompute.createRenderTarget();
      setGpu({ gpuCompute, filter, output });
      filterRef.current = filter;
      anim2UniformRef.current = gcrUniforms.anim2;
      return () => {
        gpuCompute.dispose();
        filter.dispose();
        output.dispose();
      };
    }, [width]);

    const setPositionTexture = useMemo(
      () => (sampler) => {
        if (!gpu?.gpuCompute || !sampler) return null;
        const texture = gpu.gpuCompute.createTexture();
        const data = texture.image.data;
        for (let i = 0; i < data.length; i += 4) {
          const p = new THREE.Vector3();
          sampler.sample(p);

          const dir = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ).normalize();

          p.addScaledVector(dir, 0.01);

          data[i] = p.x;
          data[i + 1] = p.y;
          data[i + 2] = p.z;
          data[i + 3] = 1;
        }
        return texture;
      },
      [gpu]
    );

    useEffect(() => {
      if (!samplers.length || !gpu) return;
      const texs = samplers.map(setPositionTexture).filter(Boolean);
      setTextures(texs);
      updateGcrUniforms({
        texturePosition1: texs[0],
        texturePosition2: texs[1],
      });
    }, [samplers, gpu]);

    const geometry = useMemo(() => {
      const particleCount = width * width;
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const references = new Float32Array(particleCount * 2);

      for (let i = 0; i < particleCount; i++) {
        positions.set(
          [
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
          ],
          i * 3
        );
        references.set(
          [(i % width) / width, Math.floor(i / width) / width],
          i * 2
        );
      }

      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("reference", new THREE.BufferAttribute(references, 2));
      return geo;
    }, [width]);

    useFrame(({ clock }) => {
      if (!gpu?.filter || !gpu?.gpuCompute || !gpu?.output) return;
      if (!particleUniforms) return;
      gpu.filter.uniforms.time.value = clock.getElapsedTime();
      particleUniforms.time.value = clock.getElapsedTime();
      gpu.gpuCompute.doRenderTarget(gpu.filter, gpu.output);
    });

    return (
      <group ref={groupRef}>
        <points ref={meshRef} frustumCulled={false}>
          <primitive object={geometry} attach="geometry" />
          <shaderMaterial
            ref={materialRef}
            vertexShader={particle_vertex}
            fragmentShader={particle_fragment}
            uniforms={particleUniforms}
            uniforms-positionTexture-value={gpu?.output?.texture}
            transparent
            blending={THREE.AdditiveBlending}
          />
        </points>
        {children}
      </group>
    );
  }
);

FlowFieldParticles.displayName = "FlowFieldParticles";
